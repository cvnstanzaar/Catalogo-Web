const catalogGrid = document.getElementById('catalogGrid');
const searchInput = document.getElementById('searchInput');
let allProducts = [];

// Función para cargar los productos desde el JSON
async function loadProducts() {
    try {
        const response = await fetch('productos.json');
        allProducts = await response.json();
        renderProducts(allProducts);
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        catalogGrid.innerHTML = "<p>Error al cargar el catálogo. Verifica el archivo productos.json.</p>";
    }
}

// Función para renderizar (dibujar) los productos en la pantalla
function renderProducts(products) {
    catalogGrid.innerHTML = '';
    
    if (products.length === 0) {
        catalogGrid.innerHTML = "<p>No se encontraron productos.</p>";
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <img src="${product.imagen}" alt="${product.nombre}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.nombre}</h3>
                <p class="product-desc">${product.descripcion}</p>
                <div class="product-price">$${product.precio.toLocaleString()}</div>
                <a href="https://wa.me/56900000000?text=Hola,%20me%20interesa%20el%20producto:%20${product.nombre}" target="_blank" class="btn-comprar">Comprar por WhatsApp</a>
            </div>
        `;
        
        catalogGrid.appendChild(card);
    });
}

// Sistema de búsqueda en tiempo real
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = allProducts.filter(product => 
        product.nombre.toLowerCase().includes(searchTerm) || 
        product.descripcion.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
});

// Inicializar
loadProducts();
