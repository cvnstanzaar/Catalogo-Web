// Configuración de Supabase
const SUPABASE_URL = 'https://ilfwhbecexmjwgpxjtoa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZndoYmVjZXhtandncHhqdG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTExNTksImV4cCI6MjEwNDc4NzE1OX0.FIuPuAyc7H555E-vu0Yo5e6uCG20Nw8eGbma09Y4tJ4';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const catalogGrid = document.getElementById('catalogGrid');
const searchInput = document.getElementById('searchInput');
let allProducts = [];

// Cargar productos directamente desde Supabase
async function loadProducts() {
    try {
        catalogGrid.innerHTML = "<p style='text-align:center;width:100%;color:#888;'>Cargando fragancias exclusivas...</p>";
        const { data, error } = await supabaseClient
            .from('productos')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;
        allProducts = data || [];
        renderProducts(allProducts);
    } catch (error) {
        console.error("Error al cargar desde Supabase:", error);
        catalogGrid.innerHTML = "<p style='text-align:center;width:100%;color:#c0392b;'>Error al conectar con la base de datos de productos.</p>";
    }
}

// Renderizar las tarjetas de productos
function renderProducts(products) {
    catalogGrid.innerHTML = '';
    
    if (products.length === 0) {
        catalogGrid.innerHTML = "<p style='text-align:center;width:100%;'>No se encontraron perfumes disponibles.</p>";
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <img src="${product.imagen || 'https://via.placeholder.com/300x320?text=Perfume'}" alt="${product.nombre}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.nombre}</h3>
                <p class="product-desc">${product.descripcion}</p>
                <div class="product-price">$${Number(product.precio || 0).toLocaleString('es-CL')}</div>
                <a href="https://wa.me/56900000000?text=Hola,%20me%20interesa%20el%20perfume:%20${encodeURIComponent(product.nombre)}" target="_blank" class="btn-comprar">Comprar por WhatsApp</a>
            </div>
        `;
        
        catalogGrid.appendChild(card);
    });
}

// Búsqueda en tiempo real
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = allProducts.filter(product => 
        (product.nombre && product.nombre.toLowerCase().includes(searchTerm)) || 
        (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm))
    );
    renderProducts(filteredProducts);
});

// Iniciar carga
loadProducts();
