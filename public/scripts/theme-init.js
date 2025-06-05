// public/scripts/theme-init.js
// Script para prevenir Flash of Unstyled Content (FOUC)
// Debe ejecutarse inmediatamente en el <head>

(function() {
  // Función para obtener el tema actual
  function getTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Si no hay tema guardado, usar el del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  // Aplicar el tema inmediatamente
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  // Aplicar el tema antes de que se renderice la página
  const theme = getTheme();
  applyTheme(theme);
})();