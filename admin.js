// Configuración de Supabase
const SUPABASE_URL = 'https://ilfwhbecexmjwgpxjtoa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZndoYmVjZXhtandncHhqdG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTExNTksImV4cCI6MjEwNDc4NzE1OX0.FIuPuAyc7H555E-vu0Yo5e6uCG20Nw8eGbma09Y4tJ4';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos de Login
const loginGate = document.getElementById('loginGate');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');

// Elementos de Formulario
const tbody = document.getElementById('tableBody');
const addForm = document.getElementById('addForm');
const btnSubmit = document.getElementById('btnSubmit');
const btnCancelEdit = document.getElementById('btnCancelEdit');
const formTitle = document.getElementById('formTitle');
const editProductId = document.getElementById('editProductId');
const previewImg = document.getElementById('previewImg');
const uploadProgress = document.getElementById('uploadProgress');
const uploadLabelText = document.getElementById('uploadLabelText');

let allProductsList = [];

// ==========================================
// 1. SEGURIDAD Y CONTROL DE ACCESO
// ==========================================
const ADMIN_PASS = "Coni2025@@";

function checkAuth() {
    if (sessionStorage.getItem('admin_authenticated') === 'true') {
        loginGate.style.display = 'none';
        adminPanel.style.display = 'block';
        loadAdminProducts();
    } else {
        loginGate.style.display = 'block';
        adminPanel.style.display = 'none';
    }
}

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (adminPassword.value.trim() === ADMIN_PASS) {
        sessionStorage.setItem('admin_authenticated', 'true');
        loginError.style.display = 'none';
        checkAuth();
    } else {
        loginError.style.display = 'block';
        adminPassword.value = '';
        adminPassword.focus();
    }
});

function logoutAdmin() {
    if (confirm("¿Deseas cerrar la sesión administrativa?")) {
        sessionStorage.removeItem('admin_authenticated');
        adminPassword.value = '';
        checkAuth();
    }
}

// ==========================================
// 2. SUBIDA DE FOTOS A SUPABASE STORAGE
// ==========================================
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    uploadProgress.style.display = 'block';
    uploadLabelText.style.display = 'none';

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabaseClient
            .storage
            .from('perfumes')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Obtener la URL pública oficial
        const { data: publicData } = supabaseClient
            .storage
            .from('perfumes')
            .getPublicUrl(filePath);

        const finalUrl = publicData.publicUrl;
        document.getElementById('pImagen').value = finalUrl;

        previewImg.src = finalUrl;
        previewImg.style.display = 'inline-block';
        uploadProgress.textContent = "✅ ¡Foto subida exitosamente!";
    } catch (err) {
        console.error("Error al subir foto:", err);
        alert("No se pudo subir la foto automáticamente: " + err.message + "\nPuedes pegar el enlace de la imagen manualmente abajo.");
        uploadProgress.style.display = 'none';
        uploadLabelText.style.display = 'block';
    }
}

// Previsualización manual si pegan una URL
document.getElementById('pImagen').addEventListener('input', function(e) {
    const val = e.target.value.trim();
    if (val) {
        previewImg.src = val;
        previewImg.style.display = 'inline-block';
    } else {
        previewImg.style.display = 'none';
    }
});

// ==========================================
// 3. CARGA Y VISUALIZACIÓN DE PERFUMES
// ==========================================
async function loadAdminProducts() {
    try {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;">Cargando inventario desde la base de datos...</td></tr>';
        
        const { data, error } = await supabaseClient
            .from('productos')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;
        allProductsList = data || [];
        renderAdminTable(allProductsList);
    } catch (e) {
        console.error("Error al cargar productos:", e);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#c0392b;">Error al conectar con Supabase.</td></tr>';
    }
}

function renderAdminTable(products) {
    tbody.innerHTML = '';
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;">No hay perfumes registrados. ¡Añade el primero arriba!</td></tr>';
        return;
    }

    products.forEach(p => {
        const tr = document.createElement('tr');
        
        const badgeHtml = p.badge ? `<span class="badge-tag badge-highlight">${p.badge}</span>` : '';
        const catHtml = `<span class="badge-tag badge-cat">${p.categoria || 'Unisex'}</span>`;
        const stockHtml = (p.en_stock !== false) 
            ? `<span class="badge-tag badge-stock-in">✅ En Stock</span>` 
            : `<span class="badge-tag badge-stock-out">❌ Agotado</span>`;

        tr.innerHTML = `
            <td><img src="${p.imagen || 'https://via.placeholder.com/55'}" alt="" class="thumb-img"></td>
            <td>
                <strong>${p.nombre}</strong><br>
                <div style="margin-top: 4px; display:flex; gap:6px; flex-wrap:wrap;">
                    ${catHtml} ${badgeHtml}
                </div>
            </td>
            <td>${stockHtml}</td>
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

// ==========================================
// 4. EDICIÓN Y CANCELACIÓN
// ==========================================
function startEdit(id) {
    const prod = allProductsList.find(p => p.id === id);
    if (!prod) return;

    editProductId.value = prod.id;
    document.getElementById('pNombre').value = prod.nombre || '';
    document.getElementById('pPrecio').value = prod.precio || 0;
    document.getElementById('pCategoria').value = prod.categoria || 'Unisex';
    document.getElementById('pBadge').value = prod.badge || '';
    document.getElementById('pStock').value = (prod.en_stock !== false) ? 'true' : 'false';
    document.getElementById('pImagen').value = prod.imagen || '';
    document.getElementById('pDesc').value = prod.descripcion || '';

    if (prod.imagen) {
        previewImg.src = prod.imagen;
        previewImg.style.display = 'inline-block';
    }

    formTitle.innerHTML = `✏️ Editando: <span style="color:#d4af37;">${prod.nombre}</span>`;
    btnSubmit.textContent = "💾 Guardar Cambios";
    btnCancelEdit.style.display = "inline-block";

    addForm.scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
    editProductId.value = '';
    addForm.reset();
    previewImg.style.display = 'none';
    uploadProgress.style.display = 'none';
    uploadLabelText.style.display = 'block';
    formTitle.innerHTML = "➕ Añadir Nuevo Perfume";
    btnSubmit.textContent = "➕ Añadir Perfume a la Tienda";
    btnCancelEdit.style.display = "none";
}

// ==========================================
// 5. ELIMINACIÓN DE PRODUCTO
// ==========================================
async function deleteProduct(id) {
    if (!confirm("¿Estás segura de que deseas eliminar este perfume del catálogo?")) {
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

// ==========================================
// 6. GUARDAR (CREAR O ACTUALIZAR)
// ==========================================
addForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const editingId = editProductId.value;
    btnSubmit.disabled = true;
    btnSubmit.textContent = editingId ? "⏳ Guardando cambios..." : "⏳ Añadiendo perfume...";

    const prodData = {
        nombre: document.getElementById('pNombre').value.trim(),
        descripcion: document.getElementById('pDesc').value.trim(),
        precio: parseInt(document.getElementById('pPrecio').value),
        categoria: document.getElementById('pCategoria').value,
        badge: document.getElementById('pBadge').value,
        en_stock: (document.getElementById('pStock').value === 'true'),
        imagen: document.getElementById('pImagen').value.trim()
    };

    try {
        if (editingId) {
            const { data, error } = await supabaseClient
                .from('productos')
                .update(prodData)
                .eq('id', parseInt(editingId))
                .select();

            if (error) throw error;

            alert("¡Perfume modificado exitosamente!");
            cancelEdit();
        } else {
            const { error } = await supabaseClient
                .from('productos')
                .insert([prodData]);

            if (error) throw error;

            addForm.reset();
            previewImg.style.display = 'none';
            uploadProgress.style.display = 'none';
            uploadLabelText.style.display = 'block';
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

// Inicializar sesión
checkAuth();
