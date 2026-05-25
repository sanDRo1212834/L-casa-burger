create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  extras jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.products (
  id uuid default gen_random_uuid() primary key,
  "categoryId" uuid references public.categories(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric not null,
  image text,
  stock integer default 0,
  sales integer default 0,
  likes integer default 0,
  extras jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  phone text not null,
  items jsonb not null,
  total numeric not null,
  status text not null default 'pending',
  payment_method text not null,
  change_for numeric,
  delivery_type text not null,
  address jsonb,
  delivery_fee numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Create extremely permissive policies for development purposes
create policy "Enable full access to categories" on public.categories for all using (true) with check (true);
create policy "Enable full access to products" on public.products for all using (true) with check (true);
create policy "Enable full access to orders" on public.orders for all using (true) with check (true);
