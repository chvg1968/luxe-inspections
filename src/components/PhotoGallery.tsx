import React, { useState, useEffect, useCallback } from 'react';
import { PhotoItem } from '../types';
import './PhotoGallery.css';
import { Loader2, Image as ImageIcon, RefreshCw, Plus } from 'lucide-react';
import { loadSequentialPhotos } from '../lib/supabase';

interface PhotoGalleryProps {
  villaName: string;
  photos?: PhotoItem[];
  onAddPhotoToSection?: (photoId: string, sectionId: string) => void;
  sections?: { id: string; title: string }[];
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ 
  villaName, 
  photos: propPhotos, 
  onAddPhotoToSection, 
  sections = [] 
}) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    // Si tenemos fotos como prop, las usamos directamente
    if (propPhotos && propPhotos.length > 0) {
      console.log('Usando fotos proporcionadas:', propPhotos.length);
      
      // Ordenar fotos por nombre si tienen un patrón numérico
      const sortedPhotos = [...propPhotos].sort((a, b) => {
        const numA = a.caption?.match(/\\d+/);
        const numB = b.caption?.match(/\\d+/);
        
        if (numA && numB) {
          return parseInt(numA[0]) - parseInt(numB[0]);
        }
        
        return (a.caption || '').localeCompare(b.caption || '');
      });
      
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
        const numA = a.caption?.match(/\\d+/);
        const numB = b.caption?.match(/\\d+/);
        
        if (numA && numB) {
          return parseInt(numA[0]) - parseInt(numB[0]);
        }
        
        // Si no se pueden extraer números, ordenar alfabéticamente
        return (a.caption || '').localeCompare(b.caption || '');
      });
      
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

  // Función para manejar el clic en una foto
  const handlePhotoClick = (photoId: string) => {
    setSelectedPhotoId(selectedPhotoId === photoId ? null : photoId);
  };

  // Función para añadir una foto a una sección
  const handleAddToSection = (photoId: string, sectionId: string) => {
    if (onAddPhotoToSection) {
      onAddPhotoToSection(photoId, sectionId);
      setSelectedPhotoId(null);
    }
  };

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
      <div className="grid grid-cols-2 gap-2">
        {photos.map((photo, index) => (
          <div 
            key={photo.id} 
            className="relative bg-white rounded-md overflow-hidden shadow-sm"
          >
            <div className="relative">
              <img 
                src={photo.url} 
                alt={photo.caption || `Foto ${index + 1}`} 
                className="w-full h-24 object-cover"
                onError={(e) => {
                  // Mostrar imagen de error si la carga falla
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmMWYxZjEiLz48cGF0aCBkPSJNMzUgNjVMNTAgNDVMNjUgNjVIMzVaIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjYwIiBjeT0iNDAiIHI9IjUiIGZpbGw9IiM5OTkiLz48L3N2Zz4=';
                }}
              />
              
              {/* Botón para mostrar/ocultar opciones */}
              {onAddPhotoToSection && sections.length > 0 && (
                <button 
                  onClick={() => handlePhotoClick(photo.id)}
                  className="absolute top-1 right-1 bg-white bg-opacity-70 rounded-full p-1 hover:bg-opacity-100 transition-all"
                  title="Añadir a sección"
                >
                  <Plus size={16} className="text-blue-600" />
                </button>
              )}
              
              {/* Menú de secciones */}
              {selectedPhotoId === photo.id && sections.length > 0 && (
                <div className="absolute top-8 right-1 bg-white shadow-md rounded-md p-1 z-10 w-36">
                  <p className="text-xs font-medium text-gray-500 p-1">Añadir a sección:</p>
                  {sections.map(section => (
                    <button
                      key={section.id}
                      onClick={() => handleAddToSection(photo.id, section.id)}
                      className="w-full text-left text-xs py-1 px-2 hover:bg-blue-50 rounded transition-colors truncate"
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs p-2 truncate">{photo.caption || `Foto ${index + 1}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoGallery;