import { createClient } from '@supabase/supabase-js';
import { PhotoItem } from '../types';
import { Inspection } from '../types';

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
    // Diagnóstico: Listar el contenido raíz del bucket para ver qué carpetas existen
    console.log('Listando contenido raíz del bucket photos...');
    const { data: rootData, error: rootError } = await supabase.storage
      .from('photos')
      .list('', {
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (rootError) {
      console.error('Error al listar el contenido raíz:', rootError);
    } else {
      console.log('Contenido raíz del bucket:', rootData);
    }
    
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
      
      // Intentar con una ruta alternativa: búsqueda sin normalizar
      console.log('Intentando con ruta alternativa: "Villa Palacio"');
      const { data: altData, error: altError } = await supabase.storage
        .from('photos')
        .list('Villa Palacio', {
          sortBy: { column: 'name', order: 'asc' }
        });
        
      if (altError) {
        console.error('Error en ruta alternativa:', altError);
      } else if (altData && altData.length > 0) {
        console.log('Fotos encontradas en ruta alternativa:', altData.length);
        return altData;
      } else {
        console.log('No se encontraron fotos en ruta alternativa');
      }
      
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
 * Carga todas las fotos disponibles para una villa específica
 * @param villaPath Nombre de la villa (ej: 'Villa Palacio')
 * @returns Array de objetos PhotoItem con todas las fotos encontradas
 */
export const loadSequentialPhotos = async (
  villaPath: string
): Promise<PhotoItem[]> => {
  try {
    console.log(`Cargando fotos para: ${villaPath}`);
    
    // URL base para las fotos
    const baseUrl = 'https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio';
    
    // Lista de fotos que sabemos que existen (basado en el dashboard de Supabase)
    const existingPhotos = [
      'Foto 1.jpg',
      'Foto 2A.jpg',
      'Foto 10.jpg',
      'Foto 11.jpg',
      'Foto 12.jpg',
      'Foto 13.jpg',
      'Foto 14.jpg',
      'Foto 15.jpg',
      'Foto 16.jpg',
      'Foto 17.jpeg',
      'Foto 18A.jpg',
      'Foto 18B.jpg',
      'Foto 18C.jpg',
      'Foto 18D.jpg',
      'Foto 19.jpg',
      'Foto 20.jpg',
      'Foto 21.jpg',
      'Foto 22.jpg',
      'Foto 23.jpg',
      'Foto 24.jpg',
      'Foto 25.jpg',
      'Foto 26.jpg',
      'Foto 27.jpg',
      'Foto 28.jpg',
      'Foto 29.jpg',
      'Foto 53.jpg',
      'Foto 54.jpg',
      'Foto 55.jpg',
      'Foto 56.jpg',
      'Foto 57.jpg',
      'Foto 58.jpg',
      'Foto 59.jpg',
      'Foto 5A.jpg',
      'Foto 5B.jpg',
      'Foto 5C.jpg',
      'Foto 5D.jpg',
      'Foto 60A.jpg'
    ];
    
    // Crear objetos PhotoItem solo para las fotos que sabemos que existen
    const photos: PhotoItem[] = existingPhotos.map(filename => {
      const caption = filename.replace('.jpg', '');
      return {
        id: `photo-${caption.toLowerCase().replace(' ', '-')}`,
        url: `${baseUrl}/${filename}`,
        caption: caption
      };
    });
    
    console.log(`Cargadas ${photos.length} fotos que sabemos que existen`);
    return photos;
  } catch (error) {
    console.error('Error al cargar fotos:', error);
    return [];
  }
};


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
    
    // Intentamos guardar en Supabase también
    try {
      console.log('Intentando guardar en Supabase:', inspectionId);
      
      // Verificar si ya existe la inspección
      const { data: existingData, error: checkError } = await supabase
        .from('luxe_inspections')
        .select('id')
        .eq('id', inspectionId)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error al verificar existencia en Supabase:', checkError);
        return { success: true, source: 'localStorage', error: checkError };
      }
      
      let result;
      
      if (existingData) {
        // Actualizar inspección existente
        result = await supabase
          .from('luxe_inspections')
          .update({
            data: inspectionData,
            updated_at: new Date().toISOString()
          })
          .eq('id', inspectionId);
      } else {
        // Crear nueva inspección
        result = await supabase
          .from('luxe_inspections')
          .insert({
            id: inspectionId,
            data: inspectionData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
      
      if (result.error) {
        console.error('Error al guardar en Supabase:', result.error);
        return { success: true, source: 'localStorage', error: result.error };
      }
      
      console.log('Inspección guardada en Supabase:', inspectionId);
      return { success: true, source: 'both' };
    } catch (supabaseError) {
      console.error('Error al conectar con Supabase:', supabaseError);
      return { success: true, source: 'localStorage', error: supabaseError };
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