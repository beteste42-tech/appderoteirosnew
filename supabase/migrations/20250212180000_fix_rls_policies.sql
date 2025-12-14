-- Enable RLS on usuarios table
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.usuarios 
FOR SELECT 
USING (auth.uid() = id);

-- Policy: Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.usuarios 
FOR UPDATE 
USING (auth.uid() = id);

-- Policy: Allow users to insert their own profile (needed for the fallback creation in AppContext)
CREATE POLICY "Users can insert own profile" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Policy: Allow admins to view all profiles (Optional, but good for management)
-- Assuming we can check role from the table itself, but that creates recursion.
-- For now, let's stick to basic self-access to fix login.

-- Fix access_logs RLS
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert logs" 
ON public.access_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own logs" 
ON public.access_logs 
FOR SELECT 
USING (auth.uid() = user_id);
