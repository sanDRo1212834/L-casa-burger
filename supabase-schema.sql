-- Schema for La Casa Burger
-- Run this in your Supabase SQL Editor

-- 1. Create Tables
-- If you are updating an existing database, run:
-- ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '[]'::jsonb;
--
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    extras JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    image TEXT,
    stock INTEGER DEFAULT 0,
    sales INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    items JSONB NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    change_for NUMERIC,
    address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public read for categories and products, authenticated insert/update)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.categories;

CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.categories FOR DELETE USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.products;

CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.products FOR DELETE USING (true);

DROP POLICY IF EXISTS "Enable insert for all users (demo purposes)" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.orders;

CREATE POLICY "Enable insert for all users (demo purposes)" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Enable update access for all users" ON public.orders FOR UPDATE USING (true);

CREATE TABLE public.localizacao_entregadores (
    id TEXT PRIMARY KEY,
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
    name TEXT,
    vehicle TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.localizacao_entregadores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for localizacao_entregadores" ON public.localizacao_entregadores FOR ALL USING (true) WITH CHECK (true);

-- Ativar realtime para a tabela:
-- ALTER PUBLICATION supabase_realtime ADD TABLE localizacao_entregadores;

