import React from 'react';
import { Section as SectionType } from '../types';
import ChecklistItem from './ChecklistItem';
import Subsection from './Subsection';
import EditableText from './EditableText';
import { Plus, Trash2 } from 'lucide-react';
import { Droppable } from '@hello-pangea/dnd';

interface SectionProps {
  section: SectionType;
  villaName: string; // Nombre de la villa para buscar fotos en el bucket
  onToggleItem: (itemId: string) => void;
  onToggleSubsectionItem: (itemId: string) => void;
  onRemovePhoto: (sectionId: string, photoId: string) => void;
  onRemoveSubsectionPhoto: (subsectionId: string, photoId: string) => void;
  onUpdateTitle: (sectionId: string, newTitle: string) => void;
  onAddItem: (sectionId: string) => void;
  onUpdateItem: (sectionId: string, itemId: string, newText: string) => void;
  onRemoveItem: (sectionId: string, itemId: string) => void;
  onAddSubsection: (sectionId: string) => void;
  onRemoveSection: (sectionId: string) => void;
  onRemoveSubsection: (sectionId: string, subsectionId: string) => void;
  onUpdateSubsectionTitle: (sectionId: string, subsectionId: string, newTitle: string) => void;
}

const Section: React.FC<SectionProps> = ({
  section,
  villaName,
  onToggleItem,
  onToggleSubsectionItem,
  onRemovePhoto,
  onRemoveSubsectionPhoto,
  onUpdateTitle,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onAddSubsection,
  onRemoveSection,
  onRemoveSubsection,
  onUpdateSubsectionTitle
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
        <EditableText
          value={section.title}
          onSave={(newTitle) => onUpdateTitle(section.id, newTitle)}
          className="text-xl font-semibold text-gray-800"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddItem(section.id)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
          >
            <Plus size={16} />
            <span>Agregar Item</span>
          </button>
          <button
            onClick={() => onAddSubsection(section.id)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
          >
            <Plus size={16} />
            <span>Agregar Subsección</span>
          </button>
          <button
            onClick={() => onRemoveSection(section.id)}
            className="text-red-600 hover:text-red-800"
            title="Eliminar sección"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {section.items.length > 0 && (
        <Droppable droppableId={section.id} type="item">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="mb-4"
            >
              <ul className="space-y-1">
                {section.items.map((item, index) => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    index={index}
                    onToggle={onToggleItem}
                    onUpdate={(newText) => onUpdateItem(section.id, item.id, newText)}
                    onRemove={() => onRemoveItem(section.id, item.id)}
                  />
                ))}
                {provided.placeholder}
              </ul>
            </div>
          )}
        </Droppable>
      )}
      
      <Droppable droppableId={`section-${section.id}`} type="photo">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="border border-dashed border-gray-300 rounded-md p-2 mb-4 bg-gray-50"
          >
            <div className="p-2 text-center">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Área para fotos</h4>
              <p className="text-xs text-gray-500">Arrastra fotos desde la galería</p>
              
              {section.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {section.photos.map(photo => (
                    <div key={photo.id} className="relative group">
                      <img 
                        src={photo.url} 
                        alt={photo.caption} 
                        className="w-full h-16 object-cover rounded-md"
                      />
                      <button
                        onClick={() => onRemovePhoto(section.id, photo.id)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar foto"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      
      {section.subsections && section.subsections.length > 0 && (
        <div className="mt-6">
          {section.subsections.map(subsection => (
            <Subsection
              key={subsection.id}
              subsection={subsection}
              sectionId={section.id}
              villaName={villaName}
              parentSectionName={section.title}
              onToggleItem={onToggleSubsectionItem}
              onRemovePhoto={onRemoveSubsectionPhoto}
              onUpdateTitle={(newTitle) => onUpdateSubsectionTitle(section.id, subsection.id, newTitle)}
              onAddItem={(subsectionId) => onAddItem(subsectionId)}
              onUpdateItem={(subsectionId, itemId, newText) => 
                onUpdateItem(subsectionId, itemId, newText)}
              onRemoveItem={(subsectionId, itemId) => 
                onRemoveItem(subsectionId, itemId)}
              onRemoveSubsection={() => onRemoveSubsection(section.id, subsection.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Section;