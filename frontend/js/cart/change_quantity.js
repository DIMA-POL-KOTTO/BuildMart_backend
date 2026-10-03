function changeQuantity(id, amount) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const product = cart.find(item => item.id === id);
    if (!product) return;
    product.count += amount;
    if (product.count <= 0) {
        cart = cart.filter(item => item.id !== id);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    showCartProducts();
}