import { createClient } from '@supabase/supabase-js';
import { PhotoItem, Inspection } from '../types';

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
    
    // Primero, vamos a listar el contenido raíz del bucket para depurar
    console.log('DEPURACIÓN: Listando contenido raíz del bucket photos...');
    const rootCheck = await supabase.storage
      .from('photos')
      .list('');
      
    if (rootCheck.error) {
      console.error('Error al listar contenido raíz:', rootCheck.error);
    } else {
      console.log('Contenido raíz del bucket:', rootCheck.data);
      // Mostrar cada carpeta/archivo encontrado
      rootCheck.data?.forEach(item => {
        console.log(`- ${item.name} (${item.id}) [${item.metadata?.mimetype || 'carpeta'}]`);
      });
    }
    
    // Intentar cargar fotos directamente con URLs conocidas
    console.log('Intentando cargar fotos directamente con URLs conocidas...');
    const directPhotos = await loadPhotosDirectly();
    
    if (directPhotos.length > 0) {
      console.log(`Éxito! Cargadas ${directPhotos.length} fotos directamente`);
      return directPhotos;
    }
    
    // Si la carga directa no funciona, intentamos con las estrategias anteriores
    
    // 1. Intentar con el nombre normalizado de la villa
    const normalizedVillaName = 'villapalacio'; // Nombre fijo para pruebas
    console.log(`Estrategia 1: Buscando en carpeta '${normalizedVillaName}'`);
    
    const strategy1 = await supabase.storage
      .from('photos')
      .list(normalizedVillaName);
      
    if (!strategy1.error && strategy1.data && strategy1.data.length > 0) {
      console.log(`Éxito! Encontrados ${strategy1.data.length} archivos en '${normalizedVillaName}'`);
      return processFiles(strategy1.data, normalizedVillaName);
    }
    
    // 2. Intentar directamente en la raíz
    console.log(`Estrategia 2: Buscando en la raíz del bucket`);
    
    if (rootCheck.data && rootCheck.data.length > 0) {
      // Filtrar solo archivos (no carpetas) en la raíz
      const rootFiles = rootCheck.data.filter(item => item.metadata?.mimetype);
      
      if (rootFiles.length > 0) {
        console.log(`Éxito! Encontrados ${rootFiles.length} archivos en la raíz`);
        return processFiles(rootFiles, '');
      }
      
      // 3. Buscar en cada carpeta del nivel raíz
      console.log(`Estrategia 3: Buscando en cada subcarpeta`);
      
      // Filtrar solo carpetas
      const folders = rootCheck.data.filter(item => !item.metadata?.mimetype);
      
      for (const folder of folders) {
        console.log(`Explorando carpeta: ${folder.name}`);
        
        const folderContents = await supabase.storage
          .from('photos')
          .list(folder.name);
          
        if (!folderContents.error && folderContents.data && folderContents.data.length > 0) {
          // Filtrar solo imágenes
          const folderImageFiles = folderContents.data.filter(file => 
            file.metadata?.mimetype?.startsWith('image/') ||
            /\.(jpe?g|png|gif|webp|tiff?)$/i.test(file.name)
          );
          
          if (folderImageFiles.length > 0) {
            console.log(`Éxito! Encontrados ${folderImageFiles.length} imágenes en '${folder.name}'`);
            return processFiles(folderImageFiles, folder.name);
          }
        }
      }
    }
    
    console.warn('No se encontraron imágenes en ninguna ubicación del bucket');
    return [];
  } catch (error) {
    console.error('Error al cargar fotos:', error);
    return [];
  }
};

/**
 * Carga fotos directamente usando la API REST de Supabase
 * @returns Array de objetos PhotoItem con las fotos encontradas
 */
const bucketName = 'photos';

async function loadPhotosDirectly(): Promise<PhotoItem[]> {
  const prefix = 'villapalacio'; // Define prefix used in API URL
  console.log(`Attempting to list photos using supabase-js client for prefix: ${prefix}`);

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(prefix, {
        limit: 1000, // Corresponds to the previous limit parameter
        offset: 0,
        // sortBy: { column: 'name', order: 'asc' }, // Optional sorting
      });

    if (error) {
      console.error('Error listing files using supabase-js:', error);
      throw error;
    }

    if (!data) {
       console.warn('Supabase storage list returned null data, returning empty array.');
       return [];
    }

    console.log(`Successfully listed ${data.length} files/folders from Supabase Storage.`);

    const photoItems = data
      // Filter out potential placeholder files/folders if Supabase includes them
      .filter(file => file.id !== null && file.name !== '.emptyFolderPlaceholder') 
      .map(file => {
        // Construct the public URL. Assumes the bucket is public or has appropriate policies.
        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(`${prefix}/${file.name}`);
        
        // Basic check if publicUrl is available
        if (!publicUrlData || !publicUrlData.publicUrl) {
          console.warn(`Could not get public URL for ${file.name}`);
          // Decide how to handle missing URLs: return null/undefined and filter later, or use a placeholder
          return null; // Indicate failure to get URL
        }

        return {
          id: file.id ?? file.name, // Use name as fallback ID if id is null
          name: file.name,
          url: publicUrlData.publicUrl,
          caption: file.name // Default caption, can be customized later
        };
      })
      .filter((item): item is PhotoItem => item !== null); // Filter out any nulls from URL failures

    console.log(`Mapped ${photoItems.length} files to PhotoItem objects.`);
    return photoItems;

  } catch (err) {
    console.error('Supabase API list failed, falling back to pattern matching...', err);
    // Fallback to pattern matching
    return loadPhotosWithPatternMatching(prefix);
  }
};

/**
 * Carga fotos usando un patrón de numeración secuencial
 * @returns Array de objetos PhotoItem
 */
async function loadPhotosWithPatternMatching(prefix: string): Promise<PhotoItem[]> {
  console.log(`Starting pattern matching fallback for prefix: ${prefix}`);
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const foundPhotos: PhotoItem[] = []; // Explicitly type the array
  const patterns: { path: string; name: string }[] = [];

  // --- Generate patterns ---
  // Example: Foto 1.jpg, Foto 2.jpg, etc.
  for (let i = 1; i <= 100; i++) {
    const name = `Foto ${i}.jpg`;
    // Ensure the path part is properly encoded for the URL
    const path = `${encodeURIComponent('villapalacio')}/${encodeURIComponent(name)}`;
    patterns.push({ path, name });
  }
  // Add other patterns if needed (e.g., IMG_0001.JPG)
  // patterns.push(...);

  console.log(`Generated ${patterns.length} patterns to check.`);

  // --- Check patterns in batches ---
  for (let i = 0; i < patterns.length; i += 10) {
    const batch = patterns.slice(i, i + 10);
    console.log(`Checking batch ${Math.floor(i / 10) + 1}/${Math.ceil(patterns.length / 10)}`);

    const promises = batch.map(async (pattern) => {
      // Construct the full URL for the HEAD request
      const checkUrl = `${baseUrl}/storage/v1/object/public/${bucketName}/${pattern.path}`;
      try {
        const response = await fetch(checkUrl, { method: 'HEAD' });
        // If HEAD request is successful (status 2xx), the file exists
        if (response.ok) {
          return {
            id: `pattern-photo-${pattern.name}-${Math.random().toString(36).substring(2, 9)}`, // Generate unique ID
            name: pattern.name,
            url: checkUrl, // Use the same URL for display
            caption: pattern.name.replace(/\.[^/.]+$/, '') // Extract caption
          };
        } else {
          // Log non-200 status briefly but don't treat as error
          // console.log(`HEAD request for ${pattern.name} failed with status: ${response.status}`);
          return null; // Indicate file not found
        }
      } catch (error) {
        // Log network errors but don't stop the process
        console.warn(`Network error checking ${pattern.name}:`, error instanceof Error ? error.message : String(error));
        return null; // Indicate file check failed
      }
    });

    // Use Promise.allSettled to wait for all checks in the batch, even if some fail
    const results = await Promise.allSettled(promises);

    results.forEach(result => {
      // Check if the promise was fulfilled and the result is not null
      if (result.status === 'fulfilled' && result.value) {
        // Ensure the pushed object conforms to PhotoItem
        const photoItem: PhotoItem = result.value; 
        foundPhotos.push(photoItem);
      }
      // Optional: Log rejections if needed for debugging
      // else if (result.status === 'rejected') {
      //   console.error('Promise rejected during HEAD request:', result.reason);
      // }
    });

    console.log(`Current found photos after batch: ${foundPhotos.length}`);

    // Optional: Stop early if a reasonable number of photos are found
    // if (foundPhotos.length >= 30) { // Adjust threshold as needed
    //   console.log('Found enough photos, stopping pattern matching early...');
    //   break;
    // }
  }

  console.log(`Pattern matching finished. Found ${foundPhotos.length} photos.`);
  return foundPhotos;
};

/**
 * Procesa los archivos encontrados y los convierte en objetos PhotoItem
 * @param files Archivos encontrados en el bucket
 * @param folderPath Ruta de la carpeta donde se encontraron
 * @returns Array de objetos PhotoItem
 */
const processFiles = (files: any[], folderPath: string): PhotoItem[] => {
  // Filtrar solo imágenes por extensión o tipo MIME
  const imageFiles = files.filter(file => 
    (file.metadata?.mimetype?.startsWith('image/')) ||
    /\.(jpe?g|png|gif|webp|tiff?)$/i.test(file.name)
  );
  
  console.log(`Procesando ${imageFiles.length} imágenes de ${files.length} archivos`);
  
  if (imageFiles.length === 0) {
    return [];
  }
  
  // Crear objetos PhotoItem para cada imagen encontrada
  const photos: PhotoItem[] = [];
  
  for (const file of imageFiles) {
    // Crear URL pública para el archivo
    const { data } = supabase.storage
      .from('photos')
      .getPublicUrl(`${folderPath ? folderPath + '/' : ''}${file.name}`);
    
    if (data?.publicUrl) {
      // Usar el nombre del archivo como caption (sin extensión)
      const caption = file.name.replace(/\.[^/.]+$/, '');
      
      photos.push({
        id: `photo-${file.id || Math.random().toString(36).substring(2, 10)}`,
        url: data.publicUrl,
        caption: caption
      });
    }
  }
  
  console.log(`Generados ${photos.length} objetos PhotoItem`);
  return photos;
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