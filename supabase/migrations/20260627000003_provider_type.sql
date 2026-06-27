-- Add provider_type to scholarships to distinguish university vs org vs government
alter table public.scholarships
  add column if not exists provider_type text
  check (provider_type in ('university', 'organization', 'government'))
  default 'organization';
