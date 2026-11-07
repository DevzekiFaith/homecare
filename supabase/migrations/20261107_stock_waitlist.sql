-- STOCK WAITLIST & RESTOCK RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS public.stock_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'fulfilled', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.stock_waitlist ENABLE ROW LEVEL SECURITY;

-- POLICIES
DROP POLICY IF EXISTS "Public can join waitlist" ON public.stock_waitlist;
CREATE POLICY "Public can join waitlist" ON public.stock_waitlist 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin and users can view waitlist" ON public.stock_waitlist;
CREATE POLICY "Admin and users can view waitlist" ON public.stock_waitlist 
FOR SELECT USING (true);

