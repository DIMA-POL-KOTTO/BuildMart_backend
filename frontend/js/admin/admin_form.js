let adminModalEditingId = null;

function buildAdminModal() {
    if (document.getElementById('adminProductModal')) return;

    const overlay = document.createElement('div');
    overlay.className = 'admin-modal-overlay';
    overlay.id = 'adminProductModal';
    overlay.innerHTML = `
        <div class="admin-modal">
            <div class="admin-modal-header">
                <h3 id="adminModalTitle">Add Product</h3>
                <button type="button" class="admin-modal-close" aria-label="Close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <form id="adminProductForm">
                <label class="admin-field">Title
                    <input type="text" id="adminProductTitle" required>
                </label>
                <label class="admin-field">Category
                    <input type="text" id="adminProductCategory" required>
                </label>
                <label class="admin-field">Description
                    <textarea id="adminProductDescription" rows="3" required></textarea>
                </label>
                <div class="admin-field-row">
                    <label class="admin-field">Price
                        <input type="number" id="adminProductPrice" min="0" step="0.01" required>
                    </label>
                    <label class="admin-field">Stock Quantity
                        <input type="number" id="adminProductStock" min="0" step="1" required>
                    </label>
                </div>
                <label class="admin-field">Images (one URL per line)
                    <textarea id="adminProductImages" rows="2" required></textarea>
                </label>
                <div class="admin-modal-error" id="adminModalError"></div>
                <div class="admin-modal-actions">
                    <button type="button" class="admin-btn-secondary" id="adminModalCancel">Cancel</button>
                    <button type="submit" class="admin-btn-primary" id="adminModalSubmit">Save</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.admin-modal-close').addEventListener('click', closeAdminModal);
    overlay.querySelector('#adminModalCancel').addEventListener('click', closeAdminModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeAdminModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('show')) closeAdminModal();
    });
    overlay.querySelector('#adminProductForm').addEventListener('submit', submitAdminProduct);
}

function openAdminModal(product) {
    buildAdminModal();
    const overlay = document.getElementById('adminProductModal');
    adminModalEditingId = product ? product.id : null;

    document.getElementById('adminModalTitle').textContent = product ? 'Edit Product' : 'Add Product';
    document.getElementById('adminProductTitle').value = product ? product.title : '';
    document.getElementById('adminProductCategory').value = product ? product.category : '';
    document.getElementById('adminProductDescription').value = product ? product.description : '';
    document.getElementById('adminProductPrice').value = product ? Number(product.price) : '';
    document.getElementById('adminProductStock').value = product ? product.stockQuantity : '';
    document.getElementById('adminProductImages').value = product ? product.images.join('\n') : '';

    setAdminModalError('');
    overlay.classList.add('show');
}

function closeAdminModal() {
    document.getElementById('adminProductModal')?.classList.remove('show');
    adminModalEditingId = null;
}

function setAdminModalError(message) {
    const block = document.getElementById('adminModalError');
    block.textContent = message;
    block.classList.toggle('show', message !== '');
}

async function submitAdminProduct(e) {
    e.preventDefault();

    const title = document.getElementById('adminProductTitle').value.trim();
    const category = document.getElementById('adminProductCategory').value.trim();
    const description = document.getElementById('adminProductDescription').value.trim();
    const priceRaw = document.getElementById('adminProductPrice').value;
    const stockRaw = document.getElementById('adminProductStock').value;
    const price = Number(priceRaw);
    const stockQuantity = Number(stockRaw);
    const images = document.getElementById('adminProductImages').value
        .split('\n')
        .map(url => url.trim())
        .filter(url => url !== '');

    if (!title || !category || !description) return setAdminModalError('Title, category and description are required');
    if (priceRaw === '' || !Number.isFinite(price) || price < 0) return setAdminModalError('Price must be a non-negative number');
    if (stockRaw === '' || !Number.isInteger(stockQuantity) || stockQuantity < 0) return setAdminModalError('Stock quantity must be a non-negative integer');
    if (images.length === 0) return setAdminModalError('At least one image URL is required');

    const body = { title, category, description, price, stockQuantity, images };
    const url = adminModalEditingId ? `/api/products/${adminModalEditingId}` : '/api/products';
    const method = adminModalEditingId ? 'PUT' : 'POST';
    const successMessage = adminModalEditingId ? 'Product updated' : 'Product added';

    const submitBtn = document.getElementById('adminModalSubmit');
    submitBtn.disabled = true;
    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(body)
        });
        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
            setAdminModalError('Session expired. Please sign in again');
            return;
        }
        if (!response.ok) {
            setAdminModalError(data.error || 'Failed to save product');
            return;
        }

        closeAdminModal();
        showAdminToast(successMessage, 'success');
        loadProducts(currentParams);
    } catch (error) {
        setAdminModalError('Network error. Please try again');
    } finally {
        submitBtn.disabled = false;
    }
}

function showAdminToast(message, type = 'success') {
    const container = document.querySelector('.toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = type === 'error' ? 'toast error' : 'toast';
    toast.innerHTML = `<p><i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> ${message}</p>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

document.addEventListener('admin:add-product', () => openAdminModal(null));

document.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.product-menu-item[data-action="edit"]');
    if (!editBtn) return;

    const card = editBtn.closest('.product-card');
    if (!card?.dataset.id) return;

    try {
        const response = await fetch(`/api/products/${card.dataset.id}`);
        if (!response.ok) {
            showAdminToast('Failed to load product', 'error');
            return;
        }
        openAdminModal(await response.json());
    } catch (error) {
        showAdminToast('Network error. Please try again', 'error');
    }
});
