function showDeleteBtn(){
    const deleteBtnSecondary = document.getElementById("deleteBtnSecondary");
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!deleteBtnSecondary) return;
    const productId = deleteBtnSecondary.dataset.id;
    if (cart.some(p => p.id === productId)) {
        deleteBtnSecondary.style.display = 'block';
    }
    else {
        deleteBtnSecondary.style.display = 'none';
    }
}


