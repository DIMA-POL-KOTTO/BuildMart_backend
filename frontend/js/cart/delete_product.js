const productInfo = document.querySelector(".product-info")

async function deleteProduct(id) {
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch(`api/cart/items/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await response.json();
        await showCartProducts();
    }
    catch(error) {
        console.log(error);
    }
}

