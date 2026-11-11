-- Run inside a rollback transaction, after the migration. No fixture survives.
set local role service_role;
do $test$
declare first_record record; again record; ai_record record; phone_record record;
begin
  select * into first_record from public.record_client_inquiry(
    '00000000-0000-4000-8000-000000000407', 'video', 'Intake contract fixture',
    'contract-407@example.invalid', null, 'free-test-edit', '{"footage":"Weekly series"}');
  select * into again from public.record_client_inquiry(
    '00000000-0000-4000-8000-000000000407', 'video', 'Intake contract fixture',
    'contract-407@example.invalid', null, 'free-test-edit', '{"footage":"Weekly series"}');
  assert first_record.inquiry_id = again.inquiry_id, 'Retry must return the same receipt';
  assert first_record.contact_id = again.contact_id, 'Retry must return the same contact';
  assert (select lane='Content Editor' and relationship_type='new_prospect' from public.contacts where id=first_record.contact_id), 'Editing must create a new Content Editor prospect';
  update public.contacts set relationship_type='returning_client',status='paused' where id=first_record.contact_id;
  select * into ai_record from public.record_client_inquiry(
    '00000000-0000-4000-8000-000000000408', 'ai', 'Intake contract fixture',
    'CONTRACT-407@EXAMPLE.INVALID', null, 'build-it-for-me', '{"aiWish":"Follow ups"}');
  assert ai_record.contact_id=first_record.contact_id, 'One person across both service Lanes';
  assert (select relationship_type='returning_client' and status='paused' and service_lanes @> array['Content Editor','AI Consultant'] from public.contacts where id=first_record.contact_id), 'An inquiry must preserve an existing relationship and status';
  assert exists(select 1 from public.clients_returning where id=first_record.contact_id), 'Returning view must include the contact';
  select * into phone_record from public.record_client_inquiry(
    '00000000-0000-4000-8000-000000000409', 'recruiting', 'Phone fixture',
    null, '+1 (813) 555-0199', 'recruiting-highlights', '{"sport":"Football","purpose":"Recruiting","footage":"Clips already picked","deadline":null}');
  assert (select lane='Content Editor' and phone='+1 (813) 555-0199' from public.contacts where id=phone_record.contact_id), 'Recruiting keeps phone and Content Editor Lane';
  assert exists(select 1 from public.clients_prospects where id=phone_record.contact_id), 'Prospect view includes new inquiries';
  begin
    perform public.record_client_inquiry('00000000-0000-4000-8000-000000000407','video','Different input','different@example.invalid',null,'free-test-edit','{}');
    raise exception 'Expected retry conflict';
  exception when unique_violation then null; end;
  begin
    perform public.record_client_inquiry(gen_random_uuid(),'recruiting','Fixture','fixture@example.invalid',null,'build-it-for-me','{}');
    raise exception 'Expected offer rejection';
  exception when check_violation then null; end;
end $test$;
reset role;
do $security$
begin
  assert not has_function_privilege('anon','public.record_client_inquiry(uuid,text,text,text,text,text,jsonb)','execute'), 'No public RPC';
  assert not has_function_privilege('authenticated','public.record_client_inquiry(uuid,text,text,text,text,text,jsonb)','execute'), 'No client RPC';
  assert not has_table_privilege('anon','public.client_inquiries','select'), 'No public records';
  assert not has_table_privilege('authenticated','public.clients_current','select'), 'No client view access';
  assert (select relrowsecurity from pg_class where oid='public.client_inquiries'::regclass), 'RLS is required';
end $security$;
