-- Schema for La Casa Burger
-- Run this in your Supabase SQL Editor

-- 1. Create Tables
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
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
CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users (demo purposes)" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Enable update access for all users" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all users" ON public.products FOR UPDATE USING (true);
