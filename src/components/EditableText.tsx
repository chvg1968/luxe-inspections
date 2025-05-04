import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
}

const EditableText: React.FC<EditableTextProps> = ({ value, onSave, className = '' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    if (text.trim() !== '') {
      onSave(text);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setText(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="relative">
        <label htmlFor="editable-text-input" className="sr-only">Editar texto</label>
        <input
          ref={inputRef}
          id="editable-text-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          aria-label="Editar texto"
          aria-describedby="editable-text-input-description"
          placeholder={value}
          title="Presiona Enter para guardar o Escape para cancelar"
          className={`px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        />
        <div id="editable-text-input-description" className="sr-only">Presiona Enter para guardar o Escape para cancelar</div>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <span className={className}>{value}</span>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        title="Editar texto"
        aria-label="Editar texto"
      >
        <Pencil size={14} className="text-gray-500 hover:text-gray-700" />
      </button>
    </div>
  );
};

export default EditableText;