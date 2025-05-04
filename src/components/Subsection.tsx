import React from 'react';
import { Subsection as SubsectionType } from '../types';
import ChecklistItem from './ChecklistItem';
import EditableText from './EditableText';
import { Plus, Trash2 } from 'lucide-react';
import { Droppable } from '@hello-pangea/dnd';

interface SubsectionProps {
  subsection: SubsectionType;
  sectionId: string;
  villaName: string; // Nombre de la villa para buscar fotos en el bucket
  parentSectionName: string; // Nombre de la sección padre para la ruta de fotos
  onToggleItem: (itemId: string) => void;
  onRemovePhoto: (subsectionId: string, photoId: string) => void;
  onUpdateTitle: (newTitle: string) => void;
  onAddItem: (subsectionId: string) => void;
  onUpdateItem: (subsectionId: string, itemId: string, newText: string) => void;
  onRemoveItem: (subsectionId: string, itemId: string) => void;
  onRemoveSubsection: () => void;
}

const Subsection: React.FC<SubsectionProps> = ({
  subsection,
  sectionId,
  villaName,
  parentSectionName,
  onToggleItem,
  onRemovePhoto,
  onUpdateTitle,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onRemoveSubsection
}) => {
  return (
    <div className="ml-6 mb-6 border-l-2 border-gray-200 pl-4">
      <div className="flex items-center justify-between mb-2">
        <EditableText
          value={subsection.title}
          onSave={onUpdateTitle}
          className="text-lg font-medium text-gray-700"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddItem(subsection.id)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
          >
            <Plus size={16} />
            <span>Agregar Item</span>
          </button>
          <button
            onClick={onRemoveSubsection}
            className="text-red-600 hover:text-red-800"
            title="Eliminar subsección"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {subsection.items.length > 0 && (
        <Droppable droppableId={subsection.id} type="item">
          {(provided) => (
            <ul
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-1 mb-3"
            >
              {subsection.items.map((item, index) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  index={index}
                  onToggle={onToggleItem}
                  onUpdate={(newText) => onUpdateItem(subsection.id, item.id, newText)}
                  onRemove={() => onRemoveItem(subsection.id, item.id)}
                />
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      )}
      
      <Droppable droppableId={`subsection-${subsection.id}`} type="photo">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="border border-dashed border-gray-300 rounded-md p-2 mb-4 bg-gray-50"
          >
            <div className="p-2 text-center">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Área para fotos</h4>
              <p className="text-xs text-gray-500">Arrastra fotos desde la galería</p>
              
              {subsection.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {subsection.photos.map(photo => (
                    <div key={photo.id} className="relative group">
                      <img 
                        src={photo.url} 
                        alt={photo.caption} 
                        className="w-full h-16 object-cover rounded-md"
                      />
                      <button
                        onClick={() => onRemovePhoto(subsection.id, photo.id)}
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

      {subsection.subsections && subsection.subsections.length > 0 && (
        <div className="mt-4">
          {subsection.subsections.map(nestedSubsection => (
            <Subsection
              key={nestedSubsection.id}
              subsection={nestedSubsection}
              sectionId={sectionId}
              villaName={villaName}
              parentSectionName={`${parentSectionName}/${subsection.title}`}
              onToggleItem={onToggleItem}
              onRemovePhoto={onRemovePhoto}
              onUpdateTitle={onUpdateTitle}
              onAddItem={onAddItem}
              onUpdateItem={onUpdateItem}
              onRemoveItem={onRemoveItem}
              onRemoveSubsection={onRemoveSubsection}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Subsection;