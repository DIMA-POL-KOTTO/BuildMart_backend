const productInfo = document.querySelector(".product-info")

function deleteProduct(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(product => product.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    if (productInfo) {
        updateCartCounter();
        showDeleteBtn();
    }
    showCartProducts();
}

