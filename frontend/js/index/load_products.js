let currentPage = 1;
const pageLimit = 12;

async function loadProducts(params = {}) {
    const productsGrid = document.querySelector(".products-grid");
    const productsCount = document.querySelector(".products-count");
    const noProductsMessage = document.getElementById("noProductsMessage");
    const query = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageLimit),
        ...params
    })
    productsGrid.innerHTML = "";
    try {
        const response = await fetch(`/api/products?${query}`);
        const data = await response.json();
        data.items.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.dataset.id = product.id;
            card.dataset.name = product.title;
            card.dataset.price = product.price;
            card.dataset.rating = product.rating;
            card.innerHTML = `
                <div class="product-image">
                    <a href="product.html?id=${product.id}">
                        <img src="${product.images[0]}" alt="${product.title}">
                    </a>
                </div>
                <div class="product-info">
                    <a href="products?id=${product.id}"><h3>${product.title}</h3></a>
                    <div class="rating">
                        ${renderStars(product.rating)}
                        <span>(${product.rating})</span>
                    </div>
                    <div class="price">$${product.price}</div>
                    <div class="category">Заглушка</div>
                    <button class="add-to-cart"><i class="fa-solid fa-cart-shopping"></i> Add to Cart</button>
                </div>
            `;
            productsGrid.appendChild(card);
        });
        if (productsCount) {
            productsCount.textContent = `Showing ${data.meta.total_items} products`;
        }
        if (noProductsMessage) {
            noProductsMessage.style.display = data.items.length === 0 ? "block" : "none";
        }
        return data.meta;
    } catch (error) {
        console.error("Error loading products:", error);
         productsGrid.innerHTML =
            "<p>Failed to load products. Please try again.</p>";
        if (productsCount) {
            productsCount.textContent = "Unable to load products";
        }
        return null;
    }
    
    
    
    
}

function renderStars (rating){
    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - halfStar;
    for (let i=0; i < fullStars; i++) {
        starsHtml += '<i class="fa-solid fa-star"></i>'
    }
    if (halfStar) {
        starsHtml += '<i class="fa-solid fa-star-half"></i>'
    }
    for (let i=0; i < emptyStars; i++) {
        starsHtml += '<i class="fa-regular fa-star" style="color: #ccc;"></i>'
    }
    return starsHtml;
}

loadProducts();
