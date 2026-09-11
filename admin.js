let adminProducts = [];

// Cargar productos iniciales (solo al cargar la página)
async function initAdmin() {
    try {
        const res = await fetch('productos.json');
        adminProducts = await res.json();
        renderTable();
    } catch (e) {
        console.error("No se pudo cargar productos.json", e);
    }
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    adminProducts.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nombre}</td>
            <td>$${p.precio}</td>
            <td>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">Borrar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteProduct(id) {
    if(confirm("¿Seguro que quieres borrar este perfume?")) {
        adminProducts = adminProducts.filter(p => p.id !== id);
        renderTable();
    }
}

document.getElementById('addForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Generar un nuevo ID (el mayor actual + 1)
    let newId = 1;
    if (adminProducts.length > 0) {
        newId = Math.max(...adminProducts.map(p => p.id)) + 1;
    }

    const newProd = {
        id: newId,
        nombre: document.getElementById('pNombre').value,
        descripcion: document.getElementById('pDesc').value,
        precio: parseInt(document.getElementById('pPrecio').value),
        imagen: document.getElementById('pImagen').value
    };

    adminProducts.push(newProd);
    renderTable();
    this.reset();
});

// Función para descargar el JSON
function downloadJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(adminProducts, null, 4));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "productos.json");
    document.body.appendChild(downloadAnchorNode); // requerido para Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    alert("¡Archivo descargado! Ahora reemplázalo en tu carpeta y súbelo a GitHub.");
}

initAdmin();
