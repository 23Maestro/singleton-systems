-- One contact can have work in both service Lanes. Relationship is not task status.
alter table public.contacts
  add column relationship_type text check (relationship_type in ('current_client','returning_client','new_prospect','unpaid_collaboration')),
  add column service_lanes text[] not null default '{}' check (service_lanes <@ array['Content Editor','AI Consultant']::text[]),
  add column canonical_key text unique,
  add column asana_url text,
  add column outreach_url text;
update public.contacts set service_lanes=array[lane] where lane in ('Content Editor','AI Consultant');

create table public.client_inquiries (
  id uuid primary key,
  contact_id bigint not null references public.contacts(id),
  form text not null check (form in ('video','recruiting','ai')),
  lane text not null check (lane in ('Content Editor','AI Consultant')),
  offer text not null,
  submitted jsonb not null,
  delivery_state text not null default 'delivered' check (delivery_state in ('pending','delivered','failed')),
  delivery_error text,
  audio_object_path text,
  audio_file_name text,
  audio_content_type text,
  source_url text,
  created_at timestamptz not null default now()
);
create index client_inquiries_contact_created on public.client_inquiries(contact_id,created_at desc);
alter table public.client_inquiries enable row level security;
revoke all on public.client_inquiries from public,anon,authenticated;
grant select,insert,update on public.client_inquiries to service_role;

create view public.clients_current with (security_invoker=true) as select * from public.contacts where relationship_type='current_client';
create view public.clients_returning with (security_invoker=true) as select * from public.contacts where relationship_type='returning_client';
create view public.clients_prospects with (security_invoker=true) as select * from public.contacts where relationship_type='new_prospect';
create view public.clients_collaborations with (security_invoker=true) as select * from public.contacts where relationship_type='unpaid_collaboration';
revoke all on public.clients_current,public.clients_returning,public.clients_prospects,public.clients_collaborations from public,anon,authenticated;
grant select on public.clients_current,public.clients_returning,public.clients_prospects,public.clients_collaborations to service_role;

-- The API validates form fields. This private RPC owns atomic receipt/contact writes.
-- It never changes an existing contact's name, status, payment or next action.
create function public.record_client_inquiry(
  p_request_id uuid,p_form text,p_name text,p_email text,p_phone text,p_offer text,p_details jsonb
) returns table(inquiry_id uuid,contact_id bigint)
language plpgsql security invoker set search_path='' as $function$
declare
  v_email text := nullif(lower(btrim(p_email)),'');
  v_phone text := nullif(regexp_replace(p_phone,'[^0-9]','','g'),'');
  v_lane text;
  v_contact bigint;
  v_matches bigint;
  v_submitted jsonb;
  v_existing public.client_inquiries%rowtype;
begin
  if p_request_id is null or p_form is null or p_offer is null or nullif(btrim(p_name),'') is null
     or (v_email is null and v_phone is null) or jsonb_typeof(p_details) is distinct from 'object' then
    raise check_violation using message='Missing inquiry fields';
  end if;
  if not ((p_form='video' and p_offer in ('free-test-edit','four-video-bundle','eight-video-bundle'))
      or (p_form='recruiting' and p_offer='recruiting-highlights')
      or (p_form='ai' and p_offer in ('start-with-one-thing','build-it-for-me','keep-it-working','build-my-ai-system'))) then
    raise check_violation using message='Offer does not belong to this form';
  end if;
  v_lane := case when p_form='ai' then 'AI Consultant' else 'Content Editor' end;
  v_submitted := jsonb_build_object('name',btrim(p_name),'email',v_email,'phone',p_phone,'details',p_details);
  perform pg_advisory_xact_lock(hashtextextended('inquiry:'||p_request_id::text,0));
  select * into v_existing from public.client_inquiries i where i.id=p_request_id;
  if found then
    if v_existing.form<>p_form or v_existing.offer<>p_offer or v_existing.submitted<>v_submitted then
      raise unique_violation using message='Request ID already has different answers';
    end if;
    return query select v_existing.id,v_existing.contact_id;
    return;
  end if;
  perform pg_advisory_xact_lock(hashtextextended('contact:'||coalesce(v_email,v_phone),0));
  select count(*),min(c.id) into v_matches,v_contact from public.contacts c
    where (v_email is not null and lower(btrim(c.email))=v_email)
      or (v_email is null and v_phone is not null and regexp_replace(c.phone,'[^0-9]','','g')=v_phone);
  if v_matches>1 then raise check_violation using message='Contact match needs review'; end if;
  if v_contact is null then
    insert into public.contacts(name,email,phone,lane,service_lanes,status,relationship_type,platform,source_url)
    values(btrim(p_name),v_email,p_phone,v_lane,array[v_lane],'lead','new_prospect','Website',
      'https://singleton-systems.com/'||case p_form when 'video' then 'video-inquiry' when 'recruiting' then 'recruiting-highlights' else 'ai-workflow-session' end)
    returning id into v_contact;
  else
    update public.contacts c set service_lanes=array(select distinct x from unnest(c.service_lanes||array[v_lane]) x)
      where c.id=v_contact and not v_lane=any(c.service_lanes);
  end if;
  insert into public.client_inquiries(id,contact_id,form,lane,offer,submitted,delivery_state)
    values(p_request_id,v_contact,p_form,v_lane,p_offer,v_submitted,
      case when p_form='ai' and p_details->>'hasAudio'='true' then 'pending' else 'delivered' end);
  return query select p_request_id,v_contact;
end $function$;
revoke all on function public.record_client_inquiry(uuid,text,text,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.record_client_inquiry(uuid,text,text,text,text,text,jsonb) to service_role;
