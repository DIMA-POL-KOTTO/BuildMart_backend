async function changeQuantity(id, amount) {
    const token = sessionStorage.getItem("token");
    if (!token) {
        return;
    }
    try {
        const responseQ = await fetch("/api/cart", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const cartData = await responseQ.json();
        const product = cartData.items.find(item => item.id === Number(id));
        if (!product) {
            throw new Error("Cart item product not found");
        }
        const newQuantity = product.quantity + amount;
        if (newQuantity < 0) {
            await deleteProduct(id);
            return;
        }
        const response = await fetch(`api/cart/items/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                quantity: newQuantity
            })
        });
        const data = await response.json();
        await showCartProducts();
    } catch (error) {
        console.log(error);
    }
    showCartProducts();
}

window.changeQuantity = changeQuantity;