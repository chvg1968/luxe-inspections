import React from 'react';
import { ChecklistItem as ChecklistItemType } from '../types';
import { CheckSquare, Square, Trash2, GripVertical } from 'lucide-react';
import EditableText from './EditableText';
import { Draggable } from '@hello-pangea/dnd';

interface ChecklistItemProps {
  item: ChecklistItemType;
  index: number;
  onToggle: (id: string) => void;
  onUpdate: (newText: string) => void;
  onRemove: () => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ 
  item, 
  index,
  onToggle, 
  onUpdate,
  onRemove 
}) => {
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex items-start py-2 group ${
            snapshot.isDragging ? 'opacity-50' : ''
          }`}
        >
          <div
            {...provided.dragHandleProps}
            className="flex-shrink-0 mr-2 cursor-grab hover:text-blue-600"
          >
            <GripVertical size={16} />
          </div>
          <div className="flex-shrink-0 mt-0.5 mr-2 relative">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => onToggle(item.id)}
              className="absolute w-5 h-5 opacity-0 cursor-pointer z-10"
              title={item.checked ? "Marcar como no completado" : "Marcar como completado"}
              aria-label={item.checked ? "Marcado" : "No marcado"}
            />
            <div className="pointer-events-none">
              {item.checked ? (
                <CheckSquare className="w-5 h-5 text-blue-600 transition-colors" />
              ) : (
                <Square className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              )}
            </div>
          </div>
          <div className="flex-grow">
            <EditableText
              value={item.text}
              onSave={onUpdate}
              className={`text-sm ${
                item.checked 
                  ? 'text-gray-500 line-through' 
                  : 'text-gray-700'
              } transition-all`}
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
            title="Eliminar elemento"
          >
            <Trash2 size={14} />
          </button>
        </li>
      )}
    </Draggable>
  );
};

export default ChecklistItem;