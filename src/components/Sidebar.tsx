import React, { useState } from 'react';
import { Inspection, Section, PhotoItem } from '../types';
import { ChevronRight, Home, GripVertical, Plus, Image } from 'lucide-react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import PhotoGallery from './PhotoGallery';

interface SidebarProps {
  inspection: Inspection;
  isOpen: boolean;
  onSectionSelect: (sectionId: string) => void;
  selectedSectionId: string;
  onAddSection: () => void;
  galleryPhotos?: PhotoItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  inspection, 
  isOpen, 
  onSectionSelect, 
  selectedSectionId,
  onAddSection,
  galleryPhotos = []
}) => {
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const calculateProgress = (section: Section): number => {
    let totalItems = section.items.length;
    let checkedItems = section.items.filter(item => item.checked).length;
    
    section.subsections.forEach(subsection => {
      totalItems += subsection.items.length;
      checkedItems += subsection.items.filter(item => item.checked).length;
    });
    
    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  };

  return (
    <aside 
      className={`bg-gray-50 border-r border-gray-200 h-[calc(100vh-72px)] transition-all duration-300 ${
        isOpen ? 'w-64 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full md:w-64 md:opacity-100 md:translate-x-0'
      } fixed md:relative z-20`}
    >
      <div className="p-4 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Home size={20} className="text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">{inspection.property}</h2>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Inspección: {inspection.title}</p>
          <p className="text-sm text-gray-600">Fecha: {inspection.date}</p>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Secciones</h3>
            <div className="flex space-x-2">
              <button
                onClick={onAddSection}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
              >
                <Plus size={16} />
                <span>Nueva Sección</span>
              </button>
            </div>
          </div>
          <Droppable droppableId="sections" type="section">
            {(provided) => (
              <nav
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <ul className="space-y-1">
                  {inspection.sections.map((section, index) => {
                    const progress = calculateProgress(section);
                    return (
                      <Draggable
                        key={section.id}
                        draggableId={section.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                          >
                            <div className="flex items-center">
                              <div
                                {...provided.dragHandleProps}
                                className="p-2 cursor-grab hover:text-blue-600"
                              >
                                <GripVertical size={16} />
                              </div>
                              <button
                                onClick={() => onSectionSelect(section.id)}
                                className={`flex-1 flex items-center justify-between px-3 py-2 text-left rounded-md ${
                                  selectedSectionId === section.id 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <div className="flex items-center">
                                  <ChevronRight size={16} className="mr-2" />
                                  <span>{section.title}</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-6 h-6 relative mr-2">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                      <circle
                                        className="text-gray-200"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="10"
                                        cx="12"
                                        cy="12"
                                      />
                                      <circle
                                        className="text-blue-600"
                                        strokeWidth="2"
                                        strokeDasharray={`${progress * 0.628} 62.8`}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="10"
                                        cx="12"
                                        cy="12"
                                      />
                                    </svg>
                                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium">
                                      {progress}%
                                    </span>
                                  </div>
                                </div>
                              </button>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </ul>
              </nav>
            )}
          </Droppable>
          
          {/* Botón para mostrar/ocultar la galería de fotos */}
          <div className="mt-8 border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowPhotoGallery(!showPhotoGallery)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Image size={18} />
                <span>Galería de Fotos</span>
              </div>
              <ChevronRight
                size={16}
                className={`transform transition-transform ${showPhotoGallery ? 'rotate-90' : ''}`}
              />
            </button>
            
            {/* Galería de fotos */}
            {showPhotoGallery && (
              <div className="mt-4" style={{ overflow: 'visible' }}>
                <PhotoGallery 
                  villaName={inspection.property || 'Villa Palacio'} 
                  photos={galleryPhotos}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;