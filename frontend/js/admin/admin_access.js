window.adminState = { isAdmin: false };

function getAuthHeaders() {
    const token = sessionStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function setAdminState(isAdmin) {
    if (window.adminState.isAdmin === isAdmin) return;
    window.adminState.isAdmin = isAdmin;

    if (isAdmin) {
        showAddProductButton();
    } else {
        hideAddProductButton();
    }

    if (typeof loadProducts === 'function' && typeof currentParams !== 'undefined') {
        loadProducts(currentParams);
    }
}

function showAddProductButton() {
    if (document.getElementById('addProductBtn')) return;

    const filters = document.querySelector('.products-controls .filters');
    if (!filters) return;

    const button = document.createElement('button');
    button.className = 'admin-add-btn';
    button.id = 'addProductBtn';
    button.innerHTML = '<i class="fa-solid fa-plus"></i> Add Product';
    button.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('admin:add-product'));
    });
    filters.appendChild(button);
}

function hideAddProductButton() {
    document.getElementById('addProductBtn')?.remove();
}

document.addEventListener('auth:changed', (e) => {
    setAdminState(e.detail?.user?.role === 'admin');
});
