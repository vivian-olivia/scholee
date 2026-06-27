-- Allow admin to manage scholarships (insert, update, delete)
-- Admin is identified by email; we check via auth.jwt() → email claim
create policy "Admin can insert scholarships" on public.scholarships
  for insert with check (
    (auth.jwt() ->> 'email') = 'vivianoliviafs@gmail.com'
  );

create policy "Admin can update scholarships" on public.scholarships
  for update using (
    (auth.jwt() ->> 'email') = 'vivianoliviafs@gmail.com'
  );

create policy "Admin can delete scholarships" on public.scholarships
  for delete using (
    (auth.jwt() ->> 'email') = 'vivianoliviafs@gmail.com'
  );

-- Admin can also view all scholarships (including draft/closed)
create policy "Admin can view all scholarships" on public.scholarships
  for select using (
    (auth.jwt() ->> 'email') = 'vivianoliviafs@gmail.com'
  );
