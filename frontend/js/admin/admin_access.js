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

    const controls = document.querySelector('.products-controls');
    if (!controls) return;

    const button = document.createElement('button');
    button.className = 'admin-add-btn';
    button.id = 'addProductBtn';
    button.innerHTML = '<i class="fa-solid fa-plus"></i> Add Product';
    button.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('admin:add-product'));
    });
    controls.insertBefore(button, controls.querySelector('.sort'));
}

function hideAddProductButton() {
    document.getElementById('addProductBtn')?.remove();
}

document.addEventListener('auth:changed', (e) => {
    setAdminState(e.detail?.user?.role === 'admin');
});

document.addEventListener('click', (e) => {
    const menuBtn = e.target.closest('.product-menu-btn');

    document.querySelectorAll('.product-menu-dropdown.show').forEach(dropdown => {
        const isOwn = menuBtn && dropdown.parentElement.contains(menuBtn);
        if (!isOwn) dropdown.classList.remove('show');
    });

    if (menuBtn) {
        menuBtn.parentElement.querySelector('.product-menu-dropdown')?.classList.toggle('show');
    }
});
