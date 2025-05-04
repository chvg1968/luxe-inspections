import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Plus, Loader2, FolderOpen, FileImage } from 'lucide-react';
import { PhotoItem } from '../types';
import { uploadPhoto, listPhotos, loadSequentialPhotos } from '../lib/supabase';

interface PhotoUploaderProps {
  photos: PhotoItem[];
  sectionId: string;
  subsectionId?: string;
  villaName: string; // Nombre de la villa para buscar en el bucket
  sectionName: string; // Nombre de la sección para buscar en el bucket
  onAddPhoto: (photo: PhotoItem) => void;
  onRemovePhoto: (photoId: string) => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ 
  photos, 
  sectionId,
  subsectionId,
  villaName,
  sectionName,
  onAddPhoto, 
  onRemovePhoto 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSequential, setIsLoadingSequential] = useState(false);
  const [bucketPhotos, setBucketPhotos] = useState<Array<{
    id: string;
    name: string;
    path: string;
    url: string;
    caption: string;
  }>>([]);
  const [showBucketPhotos, setShowBucketPhotos] = useState(false);
  const [autoLoadAttempted, setAutoLoadAttempted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Cargar fotos automáticamente siguiendo la estructura de inspección
  const loadSequentialPhotosAutomatically = React.useCallback(async () => {
    setIsLoadingSequential(true);
    setAutoLoadAttempted(true);
    try {
      // Cargar fotos según la estructura de inspección definida
      // Ahora solo pasamos el nombre de la villa ya que las fotos están directamente en esa carpeta
      const sequentialPhotos = await loadSequentialPhotos(villaName);
      
      // Agregar cada foto encontrada a la sección
      sequentialPhotos.forEach(photo => {
        onAddPhoto(photo);
      });
      
      if (sequentialPhotos.length > 0) {
        console.log(`Se cargaron automáticamente ${sequentialPhotos.length} fotos para ${sectionName}`);
      }
    } catch (error) {
      console.error('Error cargando fotos secuenciales:', error);
      // No mostramos alerta para no interrumpir la experiencia del usuario
    } finally {
      setIsLoadingSequential(false);
    }
  }, [villaName, onAddPhoto, sectionName]);

  // Intentar cargar fotos automáticamente al montar el componente
  useEffect(() => {
    // Solo intentamos cargar automáticamente si no hay fotos ya cargadas
    // y si no se ha intentado antes
    if (photos.length === 0 && !autoLoadAttempted) {
      loadSequentialPhotosAutomatically();
    }
  }, [photos.length, autoLoadAttempted, loadSequentialPhotosAutomatically]);

  // Cargar fotos del bucket cuando se muestra el selector
  const loadBucketPhotos = async () => {
    setIsLoading(true);
    try {
      // Normalizar nombres para la ruta
      const normalizedVillaName = villaName.toLowerCase().replace(/\s+/g, '');
      const normalizedSectionName = sectionName.toLowerCase().replace(/\s+/g, '');
      
      // Cargar fotos del bucket para esta villa y sección
      const photos = await listPhotos(normalizedVillaName, normalizedSectionName);
      setBucketPhotos(photos);
    } catch (error) {
      console.error('Error loading photos from bucket:', error);
      alert('No se pudieron cargar las fotos del servidor. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar selector de fotos del bucket
  const toggleBucketPhotos = () => {
    const newState = !showBucketPhotos;
    setShowBucketPhotos(newState);
    if (newState && bucketPhotos.length === 0) {
      loadBucketPhotos();
    }
  };

  // Seleccionar una foto del bucket
  const selectBucketPhoto = (photo: {
    id: string;
    name: string;
    path: string;
    url: string;
    caption: string;
  }) => {
    onAddPhoto({
      id: Date.now().toString(),
      url: photo.url,
      caption: photo.caption
    });
    setShowBucketPhotos(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `Foto ${photos.length + 1}.jpg`;
      // Construct path without undefined segments
      const pathSegments = [sectionId];
      if (subsectionId) {
        pathSegments.push(subsectionId);
      }
      pathSegments.push(fileName);
      const path = pathSegments.join('/');

      const url = await uploadPhoto(file, path);

      onAddPhoto({
        id: Date.now().toString(),
        url,
        caption: `Foto ${photos.length + 1}`
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-md font-medium text-gray-700">Fotos</h3>
        <div className="flex space-x-3">
          <button 
            className="flex items-center text-green-600 hover:text-green-800 text-sm cursor-pointer"
            onClick={toggleBucketPhotos}
            disabled={isLoading}
            title="Ver fotos disponibles en el bucket"
          >
            <FolderOpen size={16} className="mr-1" />
            <span>Fotos de la villa</span>
          </button>
          <button 
            className="flex items-center text-purple-600 hover:text-purple-800 text-sm cursor-pointer"
            onClick={loadSequentialPhotosAutomatically}
            disabled={isLoadingSequential}
            title="Cargar fotos automáticamente por numeración"
          >
            <FileImage size={16} className="mr-1" />
            <span>Cargar fotos</span>
          </button>
          <label className="flex items-center text-blue-600 hover:text-blue-800 text-sm cursor-pointer">
            <Plus size={16} className="mr-1" />
            <span>Agregar foto</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Selector de fotos del bucket */}
      {showBucketPhotos && (
        <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Seleccionar foto de la villa</h4>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowBucketPhotos(false)}
              title="Cerrar selector"
            >
              <X size={16} />
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={24} className="text-blue-600 animate-spin" />
            </div>
          ) : bucketPhotos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {bucketPhotos.map((photo) => (
                <div 
                  key={photo.id} 
                  className="relative cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => selectBucketPhoto(photo)}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-20 object-cover rounded-md"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                    {photo.caption}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No se encontraron fotos para esta sección. Verifique que el nombre de la villa y sección sean correctos.
            </p>
          )}
        </div>
      )}

      {/* Fotos seleccionadas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group">
            <img
              src={photo.url}
              alt={photo.caption}
              className="w-full h-24 object-cover rounded-md shadow-sm"
            />
            <button
              type="button"
              onClick={() => onRemovePhoto(photo.id)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Eliminar foto"
            >
              <X size={14} />
            </button>
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                {photo.caption}
              </div>
            )}
          </div>
        ))}
        {isUploading && (
          <div className="flex items-center justify-center border-2 border-gray-300 rounded-md h-24 bg-gray-50">
            <Loader2 size={24} className="text-blue-600 animate-spin" />
          </div>
        )}
        {isLoadingSequential && (
          <div className="flex items-center justify-center border-2 border-gray-300 rounded-md h-24 bg-gray-50">
            <Loader2 size={24} className="text-purple-600 animate-spin" />
            <span className="ml-2 text-sm text-gray-500">Cargando fotos...</span>
          </div>
        )}
        {photos.length === 0 && !isUploading && !isLoadingSequential && (
          <label 
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-24 p-4 cursor-pointer hover:bg-gray-50"
          >
            <Camera size={24} className="text-gray-400 mb-1" />
            <span className="text-xs text-gray-500">Agregar fotos</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default PhotoUploader;