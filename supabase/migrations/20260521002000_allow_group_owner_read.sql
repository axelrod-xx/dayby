drop policy if exists "members can read groups" on public.groups;
create policy "members and owners can read groups"
on public.groups
for select
to authenticated
using (
  owner_id = (select auth.uid())
  or (select private.is_group_member(id))
);
