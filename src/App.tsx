import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import InspectionContainer from './components/InspectionContainer';
import { initialInspection } from './data/initialData';
import { PhotoItem, Section, Subsection, ChecklistItem, Inspection } from './types';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { saveInspection, loadInspection, loadSequentialPhotos } from './lib/supabase';

function App() {
  const [inspection, setInspection] = useState<Inspection>(initialInspection);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryPhotos, setGalleryPhotos] = useState<PhotoItem[]>([]);
  
  // Cargar las fotos de la galería
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const photos = await loadSequentialPhotos(inspection.property || 'Villa Palacio');
        setGalleryPhotos(photos);
        console.log(`Cargadas ${photos.length} fotos para la galería`);
      } catch (error) {
        console.error('Error al cargar las fotos:', error);
      }
    };
    
    loadPhotos();
  }, [inspection.property]);
  
  // Cargar la inspección guardada al iniciar
  useEffect(() => {
    const loadSavedInspection = async () => {
      try {
        setIsLoading(true);
        // Usamos el ID de la inspección inicial como clave
        const savedInspection = await loadInspection(initialInspection.id);
        
        if (savedInspection) {
          // Inspección cargada correctamente
          setInspection(savedInspection as Inspection);
        } else {
          // No se encontró una inspección guardada, usando la inicial
          setInspection(initialInspection);
        }
      } catch {
        // En caso de error, usar la inspección inicial
        setInspection(initialInspection);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedInspection();
  }, []);
  
  // Guardar la inspección cuando cambie
  useEffect(() => {
    const saveInspectionData = async () => {
      if (!isLoading) { // Evitar guardar durante la carga inicial
        try {
          await saveInspection(inspection.id, inspection);
          // La inspección se guardó correctamente (en Supabase o localStorage)
        } catch {
          // Error silencioso, ya que estamos usando localStorage como respaldo
        }
      }
    };
    
    // Debounce para no guardar en cada pequeño cambio
    const timeoutId = setTimeout(saveInspectionData, 1000);
    return () => clearTimeout(timeoutId);
  }, [inspection, isLoading]);
  
  // Obtener la sección seleccionada
  const getSelectedSection = () => {
    return selectedSectionId 
      ? inspection.sections.find(section => section.id === selectedSectionId) || null
      : null;
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setIsSidebarOpen(false);
  };

  // Función para manejar la adición manual de fotos a secciones
  const handleAddPhotoToSection = (photoId: string, sectionId: string) => {
    // Encontrar la foto en la galería
    const photo = galleryPhotos.find(p => p.id === photoId);
    if (!photo) {
      console.error('No se encontró la foto con ID:', photoId);
      return;
    }
    
    // Encontrar la sección
    const sectionIndex = inspection.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) {
      console.error('No se encontró la sección con ID:', sectionId);
      return;
    }
    
    // Crear una copia de la foto con un nuevo ID
    const newPhoto: PhotoItem = {
      id: `${photo.id}-${Date.now()}`,
      url: photo.url,
      caption: photo.caption || 'Foto sin título'
    };
    
    // Crear una copia del estado actual
    const newInspection = {
      ...inspection,
      sections: [...inspection.sections]
    };
    
    // Clonar la sección específica
    newInspection.sections[sectionIndex] = {
      ...newInspection.sections[sectionIndex],
      photos: [...newInspection.sections[sectionIndex].photos, newPhoto]
    };
    
    // Actualizar el estado
    setInspection(newInspection);
    console.log(`Foto añadida manualmente a la sección ${newInspection.sections[sectionIndex].title}`);
  };
  
  const handleAddPhotoToSubsection = (photoId: string, sectionId: string, subsectionId: string) => {
    // Encontrar la foto en la galería
    const photo = galleryPhotos.find(p => p.id === photoId);
    if (!photo) {
      console.error('No se encontró la foto con ID:', photoId);
      return;
    }
    
    // Encontrar la sección y subsección
    const sectionIndex = inspection.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) {
      console.error('No se encontró la sección con ID:', sectionId);
      return;
    }
    
    const subsectionIndex = inspection.sections[sectionIndex].subsections.findIndex(s => s.id === subsectionId);
    if (subsectionIndex === -1) {
      console.error('No se encontró la subsección con ID:', subsectionId);
      return;
    }
    
    // Crear una copia de la foto con un nuevo ID
    const newPhoto: PhotoItem = {
      id: `${photo.id}-${Date.now()}`,
      url: photo.url,
      caption: photo.caption || 'Foto sin título'
    };
    
    // Crear una copia del estado actual
    const newInspection = {
      ...inspection,
      sections: [...inspection.sections]
    };
    
    // Clonar la sección específica
    newInspection.sections[sectionIndex] = {
      ...newInspection.sections[sectionIndex],
      subsections: [...newInspection.sections[sectionIndex].subsections]
    };
    
    // Clonar la subsección específica
    newInspection.sections[sectionIndex].subsections[subsectionIndex] = {
      ...newInspection.sections[sectionIndex].subsections[subsectionIndex],
      photos: [...newInspection.sections[sectionIndex].subsections[subsectionIndex].photos, newPhoto]
    };
    
    // Actualizar el estado
    setInspection(newInspection);
    console.log(`Foto añadida manualmente a la subsección ${newInspection.sections[sectionIndex].subsections[subsectionIndex].title}`);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, type, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    console.log('handleDragEnd:', { source, destination, type, draggableId });
    
    // Si el tipo es 'photo', estamos arrastrando una foto
    if (type === 'photo') {
      // Si la fuente es la galería de fotos
      if (source.droppableId === 'photo-gallery') {
        // Determinar el destino (sección o subsección)
        const [destType, destId, parentId] = destination.droppableId.split('-');
        
        if (destType === 'section') {
          // Añadir foto a la sección usando la función manual
          handleAddPhotoToSection(draggableId, destId);
        } else if (destType === 'subsection' && parentId) {
          // Añadir foto a la subsección usando la función manual
          handleAddPhotoToSubsection(draggableId, parentId, destId);
        }
      }
    }

    // Manejar reordenamiento de secciones
    if (type === 'section') {
      const newSections = Array.from(inspection.sections);
      const [movedSection] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, movedSection);
      
      setInspection(prev => ({
        ...prev,
        sections: newSections
      }));
    }
    
    // Manejar reordenamiento de elementos dentro de una sección
    if (type === 'item') {
      const [sourceParentId, sourceType] = source.droppableId.split('-');
      const [destParentId, destType] = destination.droppableId.split('-');
      
      // Si es un movimiento dentro de la misma sección
      if (sourceParentId === destParentId && sourceType === destType) {
        const sectionIndex = inspection.sections.findIndex(s => s.id === sourceParentId);
        if (sectionIndex === -1) return;
        
        const newSections = [...inspection.sections];
        
        if (sourceType === 'items') {
          // Mover un elemento dentro de la misma sección
          const items = [...newSections[sectionIndex].items];
          const [movedItem] = items.splice(source.index, 1);
          items.splice(destination.index, 0, movedItem);
          newSections[sectionIndex].items = items;
        } else if (sourceType === 'photos') {
          // Mover una foto dentro de la misma sección
          const photos = [...newSections[sectionIndex].photos];
          const [movedPhoto] = photos.splice(source.index, 1);
          photos.splice(destination.index, 0, movedPhoto);
          newSections[sectionIndex].photos = photos;
        }
        
        setInspection(prev => ({
          ...prev,
          sections: newSections
        }));
      }
    }
    
    // Manejar reordenamiento de elementos dentro de una subsección
    if (type === 'subsection-item') {
      const [sectionId, subsectionId, sourceType] = source.droppableId.split('-');
      const [destSectionId, destSubsectionId, destType] = destination.droppableId.split('-');
      
      // Si es un movimiento dentro de la misma subsección
      if (sectionId === destSectionId && subsectionId === destSubsectionId && sourceType === destType) {
        const sectionIndex = inspection.sections.findIndex(s => s.id === sectionId);
        if (sectionIndex === -1) return;
        
        const subsectionIndex = inspection.sections[sectionIndex].subsections.findIndex(
          sub => sub.id === subsectionId
        );
        if (subsectionIndex === -1) return;
        
        const newSections = [...inspection.sections];
        
        if (sourceType === 'items') {
          // Mover un elemento dentro de la misma subsección
          const items = [...newSections[sectionIndex].subsections[subsectionIndex].items];
          const [movedItem] = items.splice(source.index, 1);
          items.splice(destination.index, 0, movedItem);
          newSections[sectionIndex].subsections[subsectionIndex].items = items;
        } else if (sourceType === 'photos') {
          // Mover una foto dentro de la misma subsección
          const photos = [...newSections[sectionIndex].subsections[subsectionIndex].photos];
          const [movedPhoto] = photos.splice(source.index, 1);
          photos.splice(destination.index, 0, movedPhoto);
          newSections[sectionIndex].subsections[subsectionIndex].photos = photos;
        }
        
        setInspection(prev => ({
          ...prev,
          sections: newSections
        }));
      }
    }
  };

  const handleToggleItem = (itemId: string) => {
    setInspection(prev => ({
      ...prev,
      sections: prev.sections.map(section => ({
        ...section,
        items: section.items.map(item => 
          item.id === itemId 
            ? { ...item, checked: !item.checked } 
            : item
        )
      }))
    }));
  };
  
  const handleToggleSubsectionItem = (itemId: string) => {
    setInspection(prev => ({
      ...prev,
      sections: prev.sections.map(section => ({
        ...section,
        subsections: section.subsections.map(subsection => ({
          ...subsection,
          items: subsection.items.map(item => 
            item.id === itemId 
              ? { ...item, checked: !item.checked } 
              : item
          )
        }))
      }))
    }));
  };
  

  const handleRemoveSectionPhoto = (sectionId: string, photoId: string) => {
    setInspection(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId
          ? {
              ...section,
              photos: section.photos.filter(photo => photo.id !== photoId)
            }
          : section
      )
    }));
  };
  
  const handleRemoveSubsectionPhoto = (subsectionId: string, photoId: string) => {
    setInspection(prev => ({
      ...prev,
      sections: prev.sections.map(section => ({
        ...section,
        subsections: section.subsections.map(sub => 
          sub.id === subsectionId
            ? {
                ...sub,
                photos: sub.photos.filter(photo => photo.id !== photoId)
              }
            : sub
        )
      }))
    }));
  };
  
  const handleAddSection = () => {
    const newSection: Section = {
      id: uuidv4(),
      title: 'Nueva sección',
      items: [],
      photos: [],
      subsections: []
    };
    
    setInspection(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    
    // Seleccionar la nueva sección
    setSelectedSectionId(newSection.id);
  };
  
  const handleRemoveSection = (sectionId: string) => {
    setInspection(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
    
    // Si la sección eliminada es la que estaba seleccionada, deseleccionarla
    if (selectedSectionId === sectionId) {
      setSelectedSectionId('');
    }
  };
  
  const handleUpdateSectionTitle = (sectionId: string, newTitle: string) => {
    setInspection(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, title: newTitle } : section
      )
    }));
  };
  
  const handleAddItem = (sectionId: string) => {
    const newItem: ChecklistItem = {
      id: uuidv4(),
      text: 'Nuevo elemento',
      checked: false
    };
    
    setInspection(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, items: [...section.items, newItem] }
          : section
      )
    }));
  };
  
  const handleUpdateItem = (sectionId: string, itemId: string, newText: string) => {
    setInspection(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId ? { ...item, text: newText } : item
              ),
              // También buscar en subsecciones
              subsections: section.subsections.map(subsection => ({
                ...subsection,
                items: subsection.items.map(item =>
                  item.id === itemId ? { ...item, text: newText } : item
                )
              }))
            }
          : section
      )
    }));
  };
  
  const handleRemoveItem = (sectionId: string, itemId: string) => {
    setInspection(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter(item => item.id !== itemId),
              // También buscar en subsecciones
              subsections: section.subsections.map(subsection => ({
                ...subsection,
                items: subsection.items.filter(item => item.id !== itemId)
              }))
            }
          : section
      )
    }));
  };
  
  const handleAddSubsection = (sectionId: string) => {
    const newSubsection: Subsection = {
      id: uuidv4(),
      title: 'Nueva subsección',
      items: [],
      photos: []
    };
    
    setInspection(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, subsections: [...section.subsections, newSubsection] }
          : section
      )
    }));
  };
  
  const handleRemoveSubsection = (sectionId: string, subsectionId: string) => {
    setInspection(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              subsections: section.subsections.filter(sub => sub.id !== subsectionId)
            }
          : section
      )
    }));
  };
  
  const handleUpdateSubsectionTitle = (sectionId: string, subsectionId: string, newTitle: string) => {
    setInspection(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              subsections: section.subsections.map(sub =>
                sub.id === subsectionId ? { ...sub, title: newTitle } : sub
              )
            }
          : section
      )
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando inspección...</p>
        </div>
      </div>
    );
  }
  
  // Obtener la sección seleccionada para el renderizado
  const selectedSection = getSelectedSection();
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-gray-100">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex flex-1" style={{ overflow: 'visible' }}>
          <Sidebar 
            inspection={inspection} 
            isOpen={isSidebarOpen} 
            onSectionSelect={handleSectionSelect}
            selectedSectionId={selectedSectionId}
            onAddSection={handleAddSection}
            galleryPhotos={galleryPhotos}
            onAddPhotoToSection={handleAddPhotoToSection}
            onAddPhotoToSubsection={handleAddPhotoToSubsection}
          />
          <div className="flex-1 ml-0 md:ml-64" style={{ overflowY: 'auto', overflowX: 'visible' }}>
            <InspectionContainer 
              section={selectedSection}
              property={inspection.property}
              onToggleItem={handleToggleItem}
              onToggleSubsectionItem={handleToggleSubsectionItem}
              onRemovePhoto={handleRemoveSectionPhoto}
              onRemoveSubsectionPhoto={handleRemoveSubsectionPhoto}
              onUpdateTitle={handleUpdateSectionTitle}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onRemoveItem={handleRemoveItem}
              onAddSubsection={handleAddSubsection}
              onRemoveSection={handleRemoveSection}
              onRemoveSubsection={handleRemoveSubsection}
              onUpdateSubsectionTitle={handleUpdateSubsectionTitle}
            />
          </div>
        </main>
      </div>
    </DragDropContext>
  );
}

export default App;