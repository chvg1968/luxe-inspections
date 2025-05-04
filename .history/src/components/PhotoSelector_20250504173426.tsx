import React, { useState } from 'react';
import { PhotoItem, Section } from '../types';
import { Plus, Image as ImageIcon } from 'lucide-react';

interface PhotoSelectorProps {
  photos: PhotoItem[];
  sections: Section[];
  onAddPhotoToSection: (photoId: string, sectionId: string) => void;
  onAddPhotoToSubsection: (photoId: string, sectionId: string, subsectionId: string) => void;
}

const PhotoSelector: React.FC<PhotoSelectorProps> = ({ 
  photos, 
  sections, 
  onAddPhotoToSection,
  onAddPhotoToSubsection
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [showSections, setShowSections] = useState(false);
  const [showSubsections, setShowSubsections] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const handlePhotoSelect = (photo: PhotoItem) => {
    setSelectedPhoto(photo);
    setShowSections(true);
    setShowSubsections(false);
    setSelectedSection(null);
  };

  const handleSectionSelect = (section: Section) => {
    if (selectedPhoto) {
      if (section.subsections.length > 0) {
        // Si la sección tiene subsecciones, mostrar el selector de subsecciones
        setSelectedSection(section);
        setShowSubsections(true);
      } else {
        // Si la sección no tiene subsecciones, añadir directamente la foto
        onAddPhotoToSection(selectedPhoto.id, section.id);
        // Resetear el estado
        setSelectedPhoto(null);
        setShowSections(false);
        setShowSubsections(false);
        setSelectedSection(null);
      }
    }
  };

  const handleSubsectionSelect = (subsectionId: string) => {
    if (selectedPhoto && selectedSection) {
      onAddPhotoToSubsection(selectedPhoto.id, selectedSection.id, subsectionId);
      // Resetear el estado
      setSelectedPhoto(null);
      setShowSections(false);
      setShowSubsections(false);
      setSelectedSection(null);
    }
  };

  const handleCancel = () => {
    setSelectedPhoto(null);
    setShowSections(false);
    setShowSubsections(false);
    setSelectedSection(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
        <ImageIcon size={20} className="mr-2 text-blue-500" />
        Añadir fotos a secciones
      </h3>

      {/* Selector de fotos */}
      {!selectedPhoto && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Selecciona una foto para añadir a una sección:</p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {photos.map(photo => (
              <div 
                key={photo.id} 
                className="cursor-pointer border rounded-md p-1 hover:border-blue-500 transition-colors"
                onClick={() => handlePhotoSelect(photo)}
              >
                <img 
                  src={photo.url} 
                  alt={photo.caption || 'Sin título'} 
                  className="w-full h-20 object-cover rounded"
                />
                <p className="text-xs truncate mt-1">{photo.caption || 'Sin título'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selector de secciones */}
      {selectedPhoto && showSections && !showSubsections && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Selecciona una sección para la foto:</p>
            <button 
              onClick={handleCancel}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Cancelar
            </button>
          </div>
          <div className="flex items-center mb-3">
            <img 
              src={selectedPhoto.url} 
              alt={selectedPhoto.caption || 'Sin título'} 
              className="w-12 h-12 object-cover rounded mr-2 border"
            />
            <p className="text-sm font-medium">{selectedPhoto.caption || 'Sin título'}</p>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => handleSectionSelect(section)}
                className="w-full text-left p-2 border-b hover:bg-blue-50 flex items-center"
              >
                <Plus size={16} className="mr-2 text-blue-500" />
                <span className="text-sm">{section.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selector de subsecciones */}
      {selectedPhoto && showSubsections && selectedSection && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Selecciona una subsección de "{selectedSection.title}":</p>
            <button 
              onClick={() => {
                setShowSubsections(false);
                setSelectedSection(null);
              }}
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              Volver
            </button>
          </div>
          <div className="flex items-center mb-3">
            <img 
              src={selectedPhoto.url} 
              alt={selectedPhoto.caption || 'Sin título'} 
              className="w-12 h-12 object-cover rounded mr-2 border"
            />
            <p className="text-sm font-medium">{selectedPhoto.caption || 'Sin título'}</p>
          </div>
          <div className="max-h-40 overflow-y-auto">
            <button
              onClick={() => onAddPhotoToSection(selectedPhoto.id, selectedSection.id)}
              className="w-full text-left p-2 border-b hover:bg-green-50 flex items-center"
            >
              <Plus size={16} className="mr-2 text-green-500" />
              <span className="text-sm font-medium">Añadir a la sección principal</span>
            </button>
            {selectedSection.subsections.map(subsection => (
              <button
                key={subsection.id}
                onClick={() => handleSubsectionSelect(subsection.id)}
                className="w-full text-left p-2 border-b hover:bg-blue-50 flex items-center pl-4"
              >
                <Plus size={16} className="mr-2 text-blue-500" />
                <span className="text-sm">{subsection.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoSelector;