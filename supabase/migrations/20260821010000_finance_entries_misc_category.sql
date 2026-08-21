-- Rename the "Other" category to "Misc." Drop whatever the category check
-- constraint is actually named (rather than assuming Postgres's default
-- naming) so this is robust regardless of how it was created.
do $$
declare
  con record;
begin
  for con in
    select conname from pg_constraint
    where conrelid = 'public.finance_entries'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%category%'
  loop
    execute format('alter table public.finance_entries drop constraint %I', con.conname);
  end loop;
end $$;

update public.finance_entries set category = 'Misc.' where category = 'Other';

alter table public.finance_entries add constraint finance_entries_category_check
  check (category in ('Income', 'Bill', 'Debt', 'Child Support', 'Food', 'Gas', 'Misc.'));
