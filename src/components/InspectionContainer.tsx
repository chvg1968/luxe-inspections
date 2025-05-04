import React from 'react';
import { Section as SectionType } from '../types';
import Section from './Section';

interface InspectionContainerProps {
  section: SectionType | null;
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
  property?: string; // Propiedad actual (villa) seleccionada
}

const InspectionContainer: React.FC<InspectionContainerProps> = ({
  section,
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
  onUpdateSubsectionTitle,
  property = 'Villa Palacio' // Valor por defecto si no se proporciona
}) => {
  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-lg text-gray-500 mb-2">Seleccione una sección para comenzar la inspección</p>
        <p className="text-sm text-gray-400">Elija una sección del menú lateral para ver y gestionar la lista de verificación</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Section 
        section={section}
        villaName={property}
        onToggleItem={onToggleItem}
        onToggleSubsectionItem={onToggleSubsectionItem}
        onRemovePhoto={onRemovePhoto}
        onRemoveSubsectionPhoto={onRemoveSubsectionPhoto}
        onUpdateTitle={onUpdateTitle}
        onAddItem={onAddItem}
        onUpdateItem={onUpdateItem}
        onRemoveItem={onRemoveItem}
        onAddSubsection={onAddSubsection}
        onRemoveSection={onRemoveSection}
        onRemoveSubsection={onRemoveSubsection}
        onUpdateSubsectionTitle={onUpdateSubsectionTitle}
      />
    </div>
  );
};

export default InspectionContainer;