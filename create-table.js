// Script para crear la tabla luxe_inspections en Supabase
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
config();

// Crear cliente de Supabase usando las variables de entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTable() {
  try {
    // Ejecutar SQL para crear la tabla
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.luxe_inspections (
          id UUID PRIMARY KEY,
          data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE public.luxe_inspections ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow all operations for all users" ON public.luxe_inspections
          FOR ALL
          TO public
          USING (true)
          WITH CHECK (true);
        
        GRANT ALL ON public.luxe_inspections TO anon;
        GRANT ALL ON public.luxe_inspections TO authenticated;
        GRANT ALL ON public.luxe_inspections TO service_role;
      `
    });

    if (error) {
      console.error('Error al crear la tabla:', error);
    } else {
      console.log('Tabla luxe_inspections creada correctamente');
    }
  } catch (error) {
    console.error('Error al ejecutar el script:', error);
  }
}

createTable();
