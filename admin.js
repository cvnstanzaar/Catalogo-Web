// Configuración de Supabase
const SUPABASE_URL = 'https://ilfwhbecexmjwgpxjtoa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZndoYmVjZXhtandncHhqdG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTExNTksImV4cCI6MjEwNDc4NzE1OX0.FIuPuAyc7H555E-vu0Yo5e6uCG20Nw8eGbma09Y4tJ4';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tbody = document.getElementById('tableBody');
const addForm = document.getElementById('addForm');
const btnSubmit = document.getElementById('btnSubmit');

// Cargar productos directamente desde Supabase
async function loadAdminProducts() {
    try {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;">Cargando inventario desde la base de datos...</td></tr>';
        
        const { data, error } = await supabaseClient
            .from('productos')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;
        renderAdminTable(data || []);
    } catch (e) {
        console.error("Error al cargar productos:", e);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#c0392b;">Error al conectar con Supabase. Revisa la consola.</td></tr>';
    }
}

// Renderizar tabla
function renderAdminTable(products) {
    tbody.innerHTML = '';
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;">No hay perfumes registrados en la base de datos.</td></tr>';
        return;
    }

    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.imagen || 'https://via.placeholder.com/50'}" alt="" class="thumb-img"></td>
            <td><strong>${p.nombre}</strong><br><small style="color:#777;">${p.descripcion ? p.descripcion.substring(0, 50) + '...' : ''}</small></td>
            <td style="font-weight:bold;color:#d4af37;">$${Number(p.precio || 0).toLocaleString('es-CL')}</td>
            <td>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">🗑️ Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Eliminar producto en tiempo real
async function deleteProduct(id) {
    if (!confirm("¿Estás segura de que deseas eliminar este perfume del catálogo en vivo?")) {
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('productos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await loadAdminProducts();
    } catch (e) {
        alert("Error al eliminar el producto: " + e.message);
    }
}

// Agregar producto en tiempo real
addForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    btnSubmit.disabled = true;
    btnSubmit.textContent = "⏳ Guardando en la nube...";

    const newProd = {
        nombre: document.getElementById('pNombre').value.trim(),
        descripcion: document.getElementById('pDesc').value.trim(),
        precio: parseInt(document.getElementById('pPrecio').value),
        imagen: document.getElementById('pImagen').value.trim()
    };

    try {
        const { error } = await supabaseClient
            .from('productos')
            .insert([newProd]);

        if (error) throw error;

        addForm.reset();
        await loadAdminProducts();
        alert("¡Perfume guardado con éxito en Supabase y visible en la tienda!");
    } catch (e) {
        alert("Error al guardar: " + e.message);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "➕ Añadir Perfume a la Tienda";
    }
});

// Inicializar carga
loadAdminProducts();
