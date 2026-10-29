-- Save a dashboard task and its new child tasks in one transaction.
create function public.command_center_inbox_edit(p_id uuid, p_expected timestamptz, p_patch jsonb, p_children jsonb default '[]'::jsonb)
returns setof public.command_center_inbox language plpgsql security invoker set search_path = public as $$
declare prior public.command_center_inbox; next_row public.command_center_inbox; child jsonb;
begin
 select * into prior from public.command_center_inbox where id=p_id for update;
 if not found or prior.updated_at <> p_expected then return; end if;
 select * into next_row from jsonb_populate_record(prior,p_patch || jsonb_build_object('updated_at',clock_timestamp()));
 update public.command_center_inbox set title=next_row.title, description=next_row.description, lane=next_row.lane, status=next_row.status, project_id=next_row.project_id,project_name=next_row.project_name,due_date=next_row.due_date,updated_at=next_row.updated_at where id=p_id;
 if prior.parent_id is not null and jsonb_array_length(p_children)>0 then raise exception 'Only parent tasks can have subtasks'; end if;
 for child in select value from jsonb_array_elements(p_children) loop
   insert into public.command_center_inbox(id,title,parent_id) values((child->>'id')::uuid,child->>'title',p_id) on conflict(id) do nothing;
   if not exists(select 1 from public.command_center_inbox where id=(child->>'id')::uuid and parent_id=p_id and title=child->>'title') then raise exception 'Subtask identity mismatch'; end if;
 end loop;
 return query select * from public.command_center_inbox where id=p_id;
end;
$$;
revoke all on function public.command_center_inbox_edit(uuid,timestamptz,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.command_center_inbox_edit(uuid,timestamptz,jsonb,jsonb) to service_role;
create index command_center_inbox_parent_idx on public.command_center_inbox(parent_id);
