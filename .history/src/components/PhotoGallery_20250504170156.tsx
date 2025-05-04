import React, { useState, useEffect } from 'react';
import { PhotoItem } from '../types';
import { Droppable } from '@hello-pangea/dnd';
import './PhotoGallery.css';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { loadSequentialPhotos } from '../lib/supabase';

interface PhotoGalleryProps {
  villaName: string;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ villaName }) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPhotos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const loadedPhotos = await loadSequentialPhotos(villaName);
        setPhotos(loadedPhotos);
      } catch (err) {
        console.error('Error cargando fotos:', err);
        setError('No se pudieron cargar las fotos. Intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    if (villaName) {
      loadPhotos();
    }
  }, [villaName]);

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
          onClick={() => loadSequentialPhotos(villaName).then(setPhotos)}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="photo-gallery mb-4">
        <h3 className="photo-gallery__title">Galería de Fotos</h3>
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-md">
          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">No hay fotos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="photo-gallery mb-4">
      <h3 className="photo-gallery__title">Galería de Fotos</h3>
      <Droppable droppableId="photo-gallery" type="photo" direction="horizontal">
        {(provided) => (
          <div 
            ref={provided.innerRef} 
            {...provided.droppableProps}
            className="photo-gallery__grid"
          >
            {photos.map((photo, index) => (
              <Draggable key={photo.id} draggableId={photo.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`photo-gallery__item ${snapshot.isDragging ? 'photo-gallery__item--dragging' : ''}`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || `Foto ${index + 1}`}
                      className="photo-gallery__image"
                    />
                    {photo.caption && (
                      <div className="photo-gallery__caption">
                        {photo.caption}
                      </div>
                    )}
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
