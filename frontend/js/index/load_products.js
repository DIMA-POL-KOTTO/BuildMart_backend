async function loadProducts() {
    const response = await fetch("/api/products");
    const products = await response.json();
    const productsGrid = document.querySelector(".products-grid");
    products.forEach(product => {
        
    });
}