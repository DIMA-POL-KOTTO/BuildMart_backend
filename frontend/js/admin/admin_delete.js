let adminDeletePendingId = null;

function buildAdminConfirm() {
    if (document.getElementById('adminConfirmOverlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'admin-confirm-overlay';
    overlay.id = 'adminConfirmOverlay';
    overlay.innerHTML = `
        <div class="admin-confirm">
            <p id="adminConfirmText">Delete this product?</p>
            <div class="admin-confirm-actions">
                <button type="button" class="admin-btn-secondary" id="adminConfirmCancel">Cancel</button>
                <button type="button" class="admin-btn-danger" id="adminConfirmDelete">Delete</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#adminConfirmCancel').addEventListener('click', closeAdminConfirm);
    overlay.querySelector('#adminConfirmDelete').addEventListener('click', submitAdminDelete);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeAdminConfirm();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('show')) closeAdminConfirm();
    });
}

function openAdminConfirm(id, name) {
    buildAdminConfirm();
    adminDeletePendingId = id;
    document.getElementById('adminConfirmText').textContent = `Delete "${name}"? This cannot be undone.`;
    document.getElementById('adminConfirmOverlay').classList.add('show');
}

function closeAdminConfirm() {
    document.getElementById('adminConfirmOverlay')?.classList.remove('show');
    adminDeletePendingId = null;
}

async function submitAdminDelete() {
    if (!adminDeletePendingId) return;

    const deleteBtn = document.getElementById('adminConfirmDelete');
    deleteBtn.disabled = true;
    try {
        const response = await fetch(`/api/products/${adminDeletePendingId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json().catch(() => ({}));

        closeAdminConfirm();

        if (response.status === 401) {
            showAdminToast('Session expired. Please sign in again', 'error');
            return;
        }
        if (!response.ok) {
            showAdminToast(data.error || 'Failed to delete product', 'error');
            return;
        }

        showAdminToast('Product deleted', 'success');
        loadProducts(currentParams);
    } catch (error) {
        closeAdminConfirm();
        showAdminToast('Network error. Please try again', 'error');
    } finally {
        deleteBtn.disabled = false;
    }
}

document.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.product-menu-item[data-action="delete"]');
    if (!deleteBtn) return;

    const card = deleteBtn.closest('.product-card');
    if (!card?.dataset.id) return;

    openAdminConfirm(card.dataset.id, card.dataset.name || 'this product');
});
