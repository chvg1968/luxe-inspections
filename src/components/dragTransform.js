// Script para aplicar transformaciones a elementos arrastrables durante el drag and drop
document.addEventListener('DOMContentLoaded', () => {
  // Función para aplicar transformaciones
  function applyTransforms() {
    const draggableElements = document.querySelectorAll('[data-x]');
    
    draggableElements.forEach(element => {
      const transform = element.getAttribute('data-x');
      if (transform) {
        element.style.transform = transform;
      }
    });
  }

  // Observador de mutaciones para detectar cambios en el DOM
  const observer = new MutationObserver(() => {
    // Cada vez que hay un cambio en el DOM, verificamos si hay elementos arrastrables
    applyTransforms();
  });

  // Configuración del observador
  const config = { attributes: true, childList: true, subtree: true };
  
  // Iniciar observación del documento
  observer.observe(document.body, config);
  
  // Aplicar transformaciones iniciales
  applyTransforms();
  
  // También aplicar transformaciones durante el arrastre
  document.addEventListener('dragover', () => {
    applyTransforms();
  });

  // Aplicar transformaciones cuando se completa un arrastre
  document.addEventListener('dragend', () => {
    applyTransforms();
  });
});
