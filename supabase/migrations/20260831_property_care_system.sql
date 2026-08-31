-- ==============================================================================
-- HOMECARE PROPERTY CARE SYSTEM SCHEMA MIGRATION
-- Project: https://iqvizntilpgitzyxmgoa.supabase.co
-- Features: Property ID, Property QR, Equipment Register, Property Health Check,
--           Open Issues, Maintenance Passport, Upcoming Maintenance
-- ==============================================================================

-- 1. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id TEXT UNIQUE NOT NULL,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    property_type TEXT NOT NULL DEFAULT 'duplex' CHECK (property_type IN ('duplex', 'bungalow', 'apartment', 'estate_unit', 'office', 'commercial', 'shortlet', 'clinic', 'other')),
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Lagos',
    state TEXT DEFAULT 'Lagos State',
    floors_count INTEGER DEFAULT 1,
    units_count INTEGER DEFAULT 1,
    bedrooms_count INTEGER,
    year_built INTEGER,
    occupancy_type TEXT DEFAULT 'owner_occupied' CHECK (occupancy_type IN ('owner_occupied', 'tenant_occupied', 'shortlet', 'vacant', 'commercial')),
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    health_status TEXT DEFAULT 'not_assessed' CHECK (health_status IN ('healthy', 'attention', 'critical', 'not_assessed')),
    last_health_check_date TIMESTAMPTZ,
    qr_active BOOLEAN DEFAULT true,
    qr_secret_token UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PROPERTY EQUIPMENT REGISTER TABLE
CREATE TABLE IF NOT EXISTS public.property_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    equipment_code TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('power', 'cooling', 'water', 'appliances', 'security', 'building', 'other')),
    name TEXT NOT NULL,
    manufacturer TEXT,
    model_number TEXT,
    serial_number TEXT,
    installation_date DATE,
    warranty_expiry DATE,
    service_interval_days INTEGER DEFAULT 90,
    current_condition TEXT DEFAULT 'good' CHECK (current_condition IN ('good', 'attention', 'critical', 'unknown')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PROPERTY HEALTH CHECKS TABLE
CREATE TABLE IF NOT EXISTS public.property_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    inspector_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    inspector_name TEXT,
    inspection_date TIMESTAMPTZ DEFAULT now(),
    health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress', 'approved', 'draft')),
    summary TEXT,
    system_ratings JSONB DEFAULT '{}'::jsonb,
    immediate_actions JSONB DEFAULT '[]'::jsonb,
    recommended_actions JSONB DEFAULT '[]'::jsonb,
    preventive_actions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PROPERTY HEALTH CHECK ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.property_health_check_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    health_check_id UUID REFERENCES public.property_health_checks(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('electrical', 'plumbing', 'water_system', 'power', 'cooling_appliances', 'building_condition', 'general_safety')),
    item_name TEXT NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN ('good', 'attention', 'critical', 'not_assessed')),
    finding TEXT,
    recommendation TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PROPERTY OPEN ISSUES TABLE
CREATE TABLE IF NOT EXISTS public.property_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    reported_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_name TEXT,
    reporter_phone TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'resolved', 'closed')),
    assigned_worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    related_service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PROPERTY MAINTENANCE PASSPORT RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.property_maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
    health_check_id UUID REFERENCES public.property_health_checks(id) ON DELETE SET NULL,
    equipment_id UUID REFERENCES public.property_equipment(id) ON DELETE SET NULL,
    performed_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    performed_by_name TEXT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    work_performed TEXT NOT NULL,
    findings TEXT,
    recommendations TEXT,
    date_completed TIMESTAMPTZ DEFAULT now(),
    cost DECIMAL(12, 2) DEFAULT 0.00,
    documents_urls TEXT[] DEFAULT '{}',
    photos_urls TEXT[] DEFAULT '{}',
    next_recommended_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. PROPERTY UPCOMING MAINTENANCE SCHEDULE TABLE
CREATE TABLE IF NOT EXISTS public.property_upcoming_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    equipment_id UUID REFERENCES public.property_equipment(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'recommended' CHECK (status IN ('recommended', 'scheduled', 'due_soon', 'overdue')),
    source TEXT DEFAULT 'health_check' CHECK (source IN ('health_check', 'standard_interval', 'staff_scheduled', 'customer_scheduled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. EXTEND SERVICE_REQUESTS TABLE TO LINK PROPERTY
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'service_requests' 
        AND column_name = 'property_id'
    ) THEN 
        ALTER TABLE public.service_requests ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 9. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_properties_property_id ON public.properties(property_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_property_equipment_property_id ON public.property_equipment(property_id);
CREATE INDEX IF NOT EXISTS idx_property_health_checks_property_id ON public.property_health_checks(property_id);
CREATE INDEX IF NOT EXISTS idx_property_issues_property_id ON public.property_issues(property_id);
CREATE INDEX IF NOT EXISTS idx_property_maintenance_records_property_id ON public.property_maintenance_records(property_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_property_id ON public.service_requests(property_id);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_health_check_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_upcoming_maintenance ENABLE ROW LEVEL SECURITY;

-- Allow public read access to properties table (needed for Property QR public lookups)
DROP POLICY IF EXISTS "Public can view basic properties" ON public.properties;
CREATE POLICY "Public can view basic properties" ON public.properties
    FOR SELECT USING (true);

-- Allow authenticated users to insert/update their properties
DROP POLICY IF EXISTS "Users can manage their own properties" ON public.properties;
CREATE POLICY "Users can manage their own properties" ON public.properties
    FOR ALL USING (auth.uid() = owner_id);

-- Allow full access to admins on all property tables
DROP POLICY IF EXISTS "Admins full access to properties" ON public.properties;
CREATE POLICY "Admins full access to properties" ON public.properties
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Allow read on equipment, health checks, issues, maintenance records
DROP POLICY IF EXISTS "Public/Users view property related data" ON public.property_equipment;
CREATE POLICY "Public/Users view property related data" ON public.property_equipment FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users manage property equipment" ON public.property_equipment;
CREATE POLICY "Users manage property equipment" ON public.property_equipment FOR ALL USING (
    EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND (owner_id = auth.uid() OR auth.uid() IS NOT NULL))
);

DROP POLICY IF EXISTS "Public/Users view property health checks" ON public.property_health_checks;
CREATE POLICY "Public/Users view property health checks" ON public.property_health_checks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Inspectors/Users manage health checks" ON public.property_health_checks;
CREATE POLICY "Inspectors/Users manage health checks" ON public.property_health_checks FOR ALL USING (true);

DROP POLICY IF EXISTS "Public/Users view property issues" ON public.property_issues;
CREATE POLICY "Public/Users view property issues" ON public.property_issues FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can report issues" ON public.property_issues;
CREATE POLICY "Public can report issues" ON public.property_issues FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users/Staff manage issues" ON public.property_issues;
CREATE POLICY "Users/Staff manage issues" ON public.property_issues FOR ALL USING (true);

DROP POLICY IF EXISTS "Public/Users view maintenance records" ON public.property_maintenance_records;
CREATE POLICY "Public/Users view maintenance records" ON public.property_maintenance_records FOR SELECT USING (true);
DROP POLICY IF EXISTS "Workers/Staff manage maintenance records" ON public.property_maintenance_records;
CREATE POLICY "Workers/Staff manage maintenance records" ON public.property_maintenance_records FOR ALL USING (true);

DROP POLICY IF EXISTS "Public/Users view upcoming maintenance" ON public.property_upcoming_maintenance;
CREATE POLICY "Public/Users view upcoming maintenance" ON public.property_upcoming_maintenance FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users/Staff manage upcoming maintenance" ON public.property_upcoming_maintenance;
CREATE POLICY "Users/Staff manage upcoming maintenance" ON public.property_upcoming_maintenance FOR ALL USING (true);
