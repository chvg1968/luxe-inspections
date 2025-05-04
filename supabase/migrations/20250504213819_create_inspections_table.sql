-- Create luxe_inspections table
CREATE TABLE IF NOT EXISTS public.luxe_inspections (
    id UUID PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.luxe_inspections ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for simplicity in this demo)
CREATE POLICY "Allow all operations for all users" ON public.luxe_inspections
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Grant access to the anon role
GRANT ALL ON public.luxe_inspections TO anon;
GRANT ALL ON public.luxe_inspections TO authenticated;
GRANT ALL ON public.luxe_inspections TO service_role;