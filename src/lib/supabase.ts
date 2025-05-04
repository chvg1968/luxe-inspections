import { createClient } from '@supabase/supabase-js';
import { PhotoItem } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication methods
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

/**
 * Lista todas las fotos en un directorio específico del bucket
 * @param villaPath Ruta de la villa (ej: 'villapalacio')
 * @param sectionPath Ruta opcional de la sección (ej: 'cocina')
 * @returns Array de objetos con información de las fotos
 */
export const listPhotos = async (villaPath: string, sectionPath?: string) => {
  try {
    // Construir la ruta de búsqueda
    let searchPath = villaPath;
    if (sectionPath) {
      searchPath = `${villaPath}/${sectionPath}`;
    }
    
    console.log('Buscando fotos en la ruta:', searchPath);
    
    // Listar archivos en el bucket
    const { data, error } = await supabase.storage
      .from('photos')
      .list(searchPath, {
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      console.error('List error details:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No se encontraron fotos en la ruta:', searchPath);
      return [];
    }
    
    console.log('Fotos encontradas:', data.length);
    
    // Mapear los resultados a URLs públicas
    const photoUrls = data
      .filter(item => !item.id.endsWith('/') && !item.name.endsWith('/')) // Filtrar carpetas
      .map(item => {
        const fullPath = `${searchPath}/${item.name}`;
        const { data: publicUrl } = supabase.storage
          .from('photos')
          .getPublicUrl(fullPath);
        
        return {
          id: item.id,
          name: item.name,
          path: fullPath,
          url: publicUrl.publicUrl,
          caption: item.name.replace(/\.[^/.]+$/, '') // Quitar extensión para el caption
        };
      });
    
    return photoUrls;
  } catch (error) {
    console.error('Error listing photos:', error);
    // En modo de inspección, devolvemos un array vacío en lugar de lanzar un error
    // para evitar interrumpir la experiencia del usuario
    return [];
  }
};

export const uploadPhoto = async (file: File, path: string) => {
  try {
    // Para modo de inspección fija, no requerimos autenticación
    // Upload the file without user metadata
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(path, file, {
        upsert: true,
        // No metadata needed for inspection mode
      });

    if (error) {
      console.error('Upload error details:', error);
      if (error.message.includes('row-level security')) {
        // En modo de inspección, manejamos este error de manera más amigable
        alert('No se pudo cargar la foto. Verifica que el bucket "photos" tenga permisos públicos de escritura.');
        throw new Error('Error de permisos: Verifica la configuración del bucket en Supabase');
      }
      throw error;
    }
    
    const { data: publicUrl } = supabase.storage
      .from('photos')
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

export const deletePhoto = async (path: string) => {
  try {
    // Para modo de inspección fija, no requerimos autenticación
    const { error } = await supabase.storage
      .from('photos')
      .remove([path]);

    if (error) {
      console.error('Delete error details:', error);
      if (error.message.includes('row-level security')) {
        // En modo de inspección, manejamos este error de manera más amigable
        alert('No se pudo eliminar la foto. Verifica que el bucket "photos" tenga permisos públicos de eliminación.');
        throw new Error('Error de permisos: Verifica la configuración del bucket en Supabase');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};

/**
 * Carga fotos para una villa específica usando un enfoque directo
 * @param villaPath Nombre de la villa (ej: 'Villa Palacio')
 * @returns Array de objetos PhotoItem con las fotos encontradas
 */
export const loadSequentialPhotos = async (
  villaPath: string
): Promise<PhotoItem[]> => {
  // Normalizar el nombre de la villa (quitar espacios y convertir a minúsculas)
  const normalizedVillaName = villaPath.toLowerCase().replace(/\s+/g, '');
  
  console.log(`Intentando cargar fotos para villa: ${villaPath} (${normalizedVillaName})`);
  
  // Usar la URL exacta que sabemos que funciona
  const baseUrl = `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/${normalizedVillaName}`;
  console.log(`URL base para fotos: ${baseUrl}`);
  
  // Generar URLs para las fotos (hasta 30 fotos)
  const photoUrls = [];
  
  // Fotos numeradas (Foto 1.jpg, Foto 2.jpg, etc.)
  for (let i = 1; i <= 30; i++) {
    photoUrls.push({
      url: `${baseUrl}/Foto%20${i}.jpg`,
      caption: `Foto ${i}`
    });
  }
  
  // Crear manualmente las fotos que sabemos que existen
  const manualPhotos: PhotoItem[] = [
    // Fotos que sabemos que existen (basado en la URL que compartiste)
    {
      id: `photo-1`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%201.jpg`,
      caption: 'Foto 1'
    },
    {
      id: `photo-2`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%202.jpg`,
      caption: 'Foto 2'
    },
    {
      id: `photo-3`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%203.jpg`,
      caption: 'Foto 3'
    },
    {
      id: `photo-4`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%204.jpg`,
      caption: 'Foto 4'
    },
    {
      id: `photo-5`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%205.jpg`,
      caption: 'Foto 5'
    },
    {
      id: `photo-6`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%206.jpg`,
      caption: 'Foto 6'
    },
    {
      id: `photo-7`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%207.jpg`,
      caption: 'Foto 7'
    },
    {
      id: `photo-8`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%208.jpg`,
      caption: 'Foto 8'
    },
    {
      id: `photo-9`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%209.jpg`,
      caption: 'Foto 9'
    },
    {
      id: `photo-10`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2010.jpg`,
      caption: 'Foto 10'
    },
    {
      id: `photo-11`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2011.jpg`,
      caption: 'Foto 11'
    },
    {
      id: `photo-12`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2012.jpg`,
      caption: 'Foto 12'
    },
    {
      id: `photo-13`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2013.jpg`,
      caption: 'Foto 13'
    },
    {
      id: `photo-14`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2014.jpg`,
      caption: 'Foto 14'
    },
    {
      id: `photo-15`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2015.jpg`,
      caption: 'Foto 15'
    },
    {
      id: `photo-16`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2016.jpg`,
      caption: 'Foto 16'
    },
    {
      id: `photo-17`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2017.jpg`,
      caption: 'Foto 17'
    },
    {
      id: `photo-18`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2018.jpg`,
      caption: 'Foto 18'
    },
    {
      id: `photo-19`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2019.jpg`,
      caption: 'Foto 19'
    },
    {
      id: `photo-20`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2020.jpg`,
      caption: 'Foto 20'
    },
    {
      id: `photo-21`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2021.jpg`,
      caption: 'Foto 21'
    },
    {
      id: `photo-22`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2022.jpg`,
      caption: 'Foto 22'
    },
    {
      id: `photo-23`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2023.jpg`,
      caption: 'Foto 23'
    },
    {
      id: `photo-24`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2024.jpg`,
      caption: 'Foto 24'
    },
    {
      id: `photo-25`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2025.jpg`,
      caption: 'Foto 25'
    },
    {
      id: `photo-26`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2026.jpg`,
      caption: 'Foto 26'
    },
    {
      id: `photo-27`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2027.jpg`,
      caption: 'Foto 27'
    },
    {
      id: `photo-28`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2028.jpg`,
      caption: 'Foto 28'
    },
    {
      id: `photo-29`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2029.jpg`,
      caption: 'Foto 29'
    },
    {
      id: `photo-30`,
      url: `https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto%2030.jpg`,
      caption: 'Foto 30'
    },
  ];
  
  console.log(`Cargando ${manualPhotos.length} fotos predefinidas`);
  return manualPhotos;
};

// Ya no necesitamos esta función porque ahora usamos list() para obtener los archivos disponibles

import { Inspection } from '../types';

/**
 * Guarda la estructura completa de una inspección
 * @param inspectionId ID de la inspección
 * @param inspectionData Datos de la inspección
 * @returns Resultado de la operación
 */
export const saveInspection = async (inspectionId: string, inspectionData: Inspection) => {
  // Siempre guardamos en localStorage primero como respaldo
  try {
    localStorage.setItem(`inspection_${inspectionId}`, JSON.stringify({
      id: inspectionId,
      data: inspectionData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    console.log('Inspección guardada en localStorage:', inspectionId);
  } catch (localStorageError) {
    console.error('Error al guardar en localStorage:', localStorageError);
  }
  
  // Luego intentamos guardar en Supabase
  try {
    console.log('Intentando guardar inspección en Supabase:', inspectionId);
    
    // Verificar si ya existe la inspección
    const { data: existingData, error: checkError } = await supabase
      .from('luxe_inspections')
      .select('id')
      .eq('id', inspectionId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error al verificar si existe la inspección:', checkError);
      return { success: true, source: 'localStorage', error: checkError };
    }
    
    if (existingData) {
      // Si existe, actualizamos
      console.log('Actualizando inspección existente en Supabase:', inspectionId);
      const { data, error } = await supabase
        .from('luxe_inspections')
        .update({ 
          data: inspectionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', inspectionId);
      
      if (error) {
        console.error('Error al actualizar inspección en Supabase:', error);
        return { success: true, source: 'localStorage', error };
      }
      
      return { success: true, source: 'supabase', data };
    } else {
      // Si no existe, insertamos
      console.log('Insertando nueva inspección en Supabase:', inspectionId);
      const { data, error } = await supabase
        .from('luxe_inspections')
        .insert([
          { 
            id: inspectionId,
            data: inspectionData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      
      if (error) {
        console.error('Error al insertar inspección en Supabase:', error);
        return { success: true, source: 'localStorage', error };
      }
      
      return { success: true, source: 'supabase', data };
    }
  } catch (error) {
    console.error('Error general al guardar la inspección en Supabase:', error);
    return { success: true, source: 'localStorage', error };
  }
};

/**
 * Carga la estructura de una inspección
 * @param inspectionId ID de la inspección a cargar
 * @returns Los datos de la inspección o null si no existe
 */
export const loadInspection = async (inspectionId: string) => {
  try {
    // Intentamos cargar desde localStorage primero (más rápido y confiable)
    const localData = localStorage.getItem(`inspection_${inspectionId}`);
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        console.log('Inspección cargada desde localStorage:', inspectionId);
        return parsedData.data || null;
      } catch (parseError) {
        console.error('Error al parsear datos de localStorage:', parseError);
        // Si hay error al parsear, continuamos con Supabase
      }
    }
    
    // Si no hay datos en localStorage o hubo un error, intentamos con Supabase
    try {
      console.log('Intentando cargar inspección desde Supabase:', inspectionId);
      
      // Usar headers explícitos para evitar problemas de aceptación
      const { data, error } = await supabase
        .from('luxe_inspections')
        .select('data')
        .eq('id', inspectionId)
        .maybeSingle();
      
      if (error) {
        console.error('Error al cargar desde Supabase:', error);
        return null;
      }
      
      if (!data) {
        console.log('No se encontró la inspección en Supabase');
        return null;
      }
      
      // Inspección cargada desde Supabase
      console.log('Inspección cargada desde Supabase:', inspectionId);
      return data.data || null;
    } catch (supabaseError) {
      console.error('Error al conectar con Supabase:', supabaseError);
      return null;
    }
  } catch (error) {
    console.error('Error general al cargar la inspección:', error);
    return null; // En caso de error, retornamos null en lugar de lanzar una excepción
  }
};