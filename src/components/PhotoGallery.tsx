import React, { useState, useEffect, useCallback } from 'react';
import { PhotoItem } from '../types';
import './PhotoGallery.css';
import { Loader2, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { loadSequentialPhotos } from '../lib/supabase';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface PhotoGalleryProps {
  villaName: string;
  photos?: PhotoItem[];
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ 
  villaName, 
  photos: propPhotos
}) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para manejar errores de carga de imágenes
  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>, photoId: string) => {
    console.log(`Imagen rota: ${photoId}`);
    // Usar una imagen placeholder en lugar de filtrar la imagen
    event.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmMWYxZjEiLz48cGF0aCBkPSJNMzUgNjVMNTAgNDVMNjUgNjVIMzVaIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjYwIiBjeT0iNDAiIHI9IjUiIGZpbGw9IiM5OTkiLz48L3N2Zz4=';
  }, []);
  
  // Función para manejar carga exitosa de imágenes
  const handleImageLoad = useCallback((photo: PhotoItem) => {
    console.log(`Imagen cargada correctamente: ${photo.id}`);
    // Ya no necesitamos mantener un registro de fotos válidas
  }, []);
  
  const loadPhotos = useCallback(async () => {
    // Si tenemos fotos como prop, las usamos directamente
    if (propPhotos && propPhotos.length > 0) {
      console.log('Usando fotos proporcionadas:', propPhotos.length);
      
      // Ordenar fotos por nombre si tienen un patrón numérico
      const sortedPhotos = [...propPhotos].sort((a, b) => {
        const numA = a.caption?.match(/\d+/);
        const numB = b.caption?.match(/\d+/);
        
        if (numA && numB) {
          return parseInt(numA[0]) - parseInt(numB[0]);
        }
        
        return (a.caption || '').localeCompare(b.caption || '');
      });
      
      // Ya no necesitamos reiniciar fotos válidas
      setPhotos(sortedPhotos);
      setIsLoading(false);
      return;
    }
    
    // Si no hay fotos como prop, las cargamos desde Supabase
    setIsLoading(true);
    setError(null);
    try {
      console.log('Cargando fotos para villa:', villaName);
      const loadedPhotos = await loadSequentialPhotos(villaName);
      console.log('Fotos cargadas:', loadedPhotos.length);
      
      // Ordenar fotos por nombre si tienen un patrón numérico (ej: "Foto 1", "Foto 2", etc.)
      const sortedPhotos = [...loadedPhotos].sort((a, b) => {
        // Extraer números de los captions si es posible
        const numA = a.caption?.match(/\d+/);
        const numB = b.caption?.match(/\d+/);
        
        if (numA && numB) {
          return parseInt(numA[0]) - parseInt(numB[0]);
        }
        
        // Si no se pueden extraer números, ordenar alfabéticamente
        return (a.caption || '').localeCompare(b.caption || '');
      });
      
      // Ya no necesitamos reiniciar fotos válidas
      setPhotos(sortedPhotos);
    } catch (err) {
      console.error('Error cargando fotos:', err);
      setError('No se pudieron cargar las fotos. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  }, [villaName, propPhotos]);

  useEffect(() => {
    loadPhotos();
  }, [villaName, propPhotos, loadPhotos]);

  // Mostrar todas las fotos
  const displayPhotos = photos;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-md">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
        <p className="text-sm text-gray-600">Cargando fotos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-md">
        <p className="text-sm text-red-600">{error}</p>
        <button 
          onClick={loadPhotos}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Intentar nuevamente
        </button>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="photo-gallery mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Galería de Fotos</h3>
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-md">
          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">No hay fotos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="photo-gallery mb-4">
      <h3 className="text-lg font-medium text-gray-800 mb-2">Galería de Fotos</h3>
      
      <Droppable droppableId="photo-gallery" type="photo" direction="horizontal" isDropDisabled={true}>
        {(provided) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="grid grid-cols-2 gap-2"
          >
            {displayPhotos.map((photo, index) => (
              <Draggable 
                key={photo.id} 
                draggableId={photo.id} 
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`draggable-photo draggable-photo-style ${
                      snapshot.isDragging ? 'is-dragging' : ''
                    } draggable-transform`}
                    // Usamos un atributo data para almacenar la transformación
                    data-x={provided.draggableProps.style?.transform}
                    // El estilo se aplicará mediante CSS y JavaScript
                  >
                    <div className="relative photo-gallery__image-container">
                      <div className="photo-gallery__image-wrapper">
                        <img 
                          src={photo.url} 
                          alt={photo.caption || `Foto ${index + 1}`} 
                          className="photo-gallery__image"
                          onError={(e) => handleImageError(e, photo.id)}
                          onLoad={() => handleImageLoad(photo)}
                          loading="lazy"
                        />
                      </div>
                      {/* Instrucción de arrastrar */}
                      {!snapshot.isDragging && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all">
                          <span className="text-white text-xs font-medium opacity-0 hover:opacity-100 pointer-events-none">
                            Arrastra para añadir
                          </span>
                        </div>
                      )}
                      <div className="photo-caption">
                        {photo.caption || `Foto ${index + 1}`}
                      </div>
                    </div>
                    <p className="text-xs p-2 truncate">{photo.caption || `Foto ${index + 1}`}</p>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default PhotoGallery;