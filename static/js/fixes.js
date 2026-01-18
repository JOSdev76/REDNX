const form = document.getElementById('uploadForm');
const loaderContainer = document.getElementById('loaderContainer');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');

console.log('Script cargado correctamente');

// Mostrar nombre de archivo seleccionado
fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        fileName.textContent = this.files[0].name;
        console.log('Archivo seleccionado:', this.files[0].name);
    }
});

// Procesar el formulario con fetch
form.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Formulario enviado');
    
    // Validar que haya un archivo
    if (!fileInput.files || !fileInput.files[0]) {
        alert('Por favor selecciona una imagen');
        return;
    }
    
    // Mostrar loader
    console.log('Mostrando loader');
    loaderContainer.style.display = 'flex';
    
    // Crear FormData
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    
    console.log('Enviando petición al servidor...');
    
    // Enviar la petición
    fetch('/remove_bg', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Respuesta recibida:', response.status);
        if (!response.ok) {
            throw new Error('Error al procesar la imagen');
        }
        
        // Obtener el nombre del archivo del header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'imagen_sin_fondo.png';
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }
        
        return response.blob().then(blob => ({ blob, filename }));
    })
    .then(({ blob, filename }) => {
        console.log('Imagen procesada, iniciando descarga...');
        console.log('Nombre del archivo:', filename);
        
        // Crear URL del blob
        const url = window.URL.createObjectURL(blob);
        
        // Crear enlace de descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Limpiar
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Ocultar loader
        console.log('Ocultando loader');
        loaderContainer.style.display = 'none';
        
        // Resetear formulario
        form.reset();
        fileName.textContent = '';
        console.log('Proceso completado');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al procesar la imagen: ' + error.message);
        loaderContainer.style.display = 'none';
    });
});
