// Configuración de Supabase
const SUPABASE_URL = 'https://ilfwhbecexmjwgpxjtoa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZndoYmVjZXhtandncHhqdG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTExNTksImV4cCI6MjEwNDc4NzE1OX0.FIuPuAyc7H555E-vu0Yo5e6uCG20Nw8eGbma09Y4tJ4';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tbody = document.getElementById('tableBody');
const addForm = document.getElementById('addForm');
const btnSubmit = document.getElementById('btnSubmit');
const btnCancelEdit = document.getElementById('btnCancelEdit');
const formTitle = document.getElementById('formTitle');
const editProductId = document.getElementById('editProductId');

let allProductsList = [];

// Cargar productos directamente desde Supabase
async function loadAdminProducts() {
    try {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;">Cargando inventario desde la base de datos...</td></tr>';
        
        const { data, error } = await supabaseClient
            .from('productos')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;
        allProductsList = data || [];
        renderAdminTable(allProductsList);
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
                <div class="action-buttons">
                    <button class="btn-edit" onclick="startEdit(${p.id})">✏️ Editar</button>
                    <button class="btn-delete" onclick="deleteProduct(${p.id})">🗑️ Eliminar</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Iniciar edición de un producto
function startEdit(id) {
    const prod = allProductsList.find(p => p.id === id);
    if (!prod) return;

    editProductId.value = prod.id;
    document.getElementById('pNombre').value = prod.nombre || '';
    document.getElementById('pPrecio').value = prod.precio || 0;
    document.getElementById('pImagen').value = prod.imagen || '';
    document.getElementById('pDesc').value = prod.descripcion || '';

    formTitle.innerHTML = `✏️ Editando: <span style="color:#d4af37;">${prod.nombre}</span>`;
    btnSubmit.textContent = "💾 Guardar Cambios";
    btnCancelEdit.style.display = "inline-block";

    // Desplazar suavemente hacia el formulario
    addForm.scrollIntoView({ behavior: 'smooth' });
}

// Cancelar edición
function cancelEdit() {
    editProductId.value = '';
    addForm.reset();
    formTitle.innerHTML = "➕ Añadir Nuevo Perfume";
    btnSubmit.textContent = "➕ Añadir Perfume a la Tienda";
    btnCancelEdit.style.display = "none";
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
        
        if (editProductId.value == id) {
            cancelEdit();
        }
        await loadAdminProducts();
    } catch (e) {
        alert("Error al eliminar el producto: " + e.message);
    }
}

// Guardar o Actualizar producto
addForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const editingId = editProductId.value;
    btnSubmit.disabled = true;
    btnSubmit.textContent = editingId ? "⏳ Guardando cambios..." : "⏳ Añadiendo perfume...";

    const prodData = {
        nombre: document.getElementById('pNombre').value.trim(),
        descripcion: document.getElementById('pDesc').value.trim(),
        precio: parseInt(document.getElementById('pPrecio').value),
        imagen: document.getElementById('pImagen').value.trim()
    };

    try {
        if (editingId) {
            // MODO EDICIÓN
            const { data, error } = await supabaseClient
                .from('productos')
                .update(prodData)
                .eq('id', parseInt(editingId))
                .select();

            if (error) throw error;

            if (!data || data.length === 0) {
                // Alerta por si falta la política RLS de UPDATE
                alert("Atención: Para poder editar perfumes en Supabase, debes ingresar a Supabase > SQL Editor y ejecutar:\n\nCREATE POLICY \"Permitir actualizar\" ON productos FOR UPDATE USING (true) WITH CHECK (true);");
                return;
            }

            alert("¡Perfume modificado exitosamente!");
            cancelEdit();
        } else {
            // MODO CREACIÓN
            const { error } = await supabaseClient
                .from('productos')
                .insert([prodData]);

            if (error) throw error;

            addForm.reset();
            alert("¡Perfume guardado con éxito en Supabase y visible en la tienda!");
        }

        await loadAdminProducts();
    } catch (e) {
        alert("Error en la operación: " + e.message);
    } finally {
        btnSubmit.disabled = false;
        if (!editProductId.value) {
            btnSubmit.textContent = "➕ Añadir Perfume a la Tienda";
        } else {
            btnSubmit.textContent = "💾 Guardar Cambios";
        }
    }
});

// Inicializar carga
loadAdminProducts();
