let currentPage = 1;
const pageLimit = 3;
let currentParams = {};

async function loadProducts(params = {}) {
    currentParams = {...params};
    const productsGrid = document.querySelector(".products-grid");
    const productsCount = document.querySelector(".products-count");
    const noProductsMessage = document.getElementById("noProductsMessage");
    const query = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageLimit),
        ...currentParams
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
        renderPagination(data.meta);
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

function renderPagination(meta) {
    const pagination = document.getElementById("productsPagination");
    pagination.replaceChildren();

    const totalPages = Number(meta?.total_pages ?? 0);
    currentPage = Number(meta?.current_page ?? currentPage);
    if (totalPages <= 1) return;

    function addPageButton(label, targetPage, { active = false, disabled = false, ariaLabel } = {}) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `pagination-button${active ? " active" : ""}`;
        button.disabled = disabled;
        button.innerHTML = label;
        if (active) button.setAttribute("aria-current", "page");
        if (ariaLabel) button.setAttribute("aria-label", ariaLabel);
        button.addEventListener("click", async () => {
            currentPage = targetPage;
            const meta = await loadProducts(currentParams);
            if (meta) {
                document.querySelector(".products-grid").scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        });
        pagination.appendChild(button);
    }

    function addEllipsis() {
        const ellipsis = document.createElement("span");
        ellipsis.className = "pagination-ellipsis";
        ellipsis.textContent = "…";
        pagination.appendChild(ellipsis);
    }

    addPageButton('<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>', currentPage - 1, {
        disabled: currentPage === 1,
        ariaLabel: "Previous page",
    });

    const visiblePages = new Set([1, totalPages]);
    for (let page = Math.max(1, currentPage - 2); page <= Math.min(totalPages, currentPage + 2); page++) {
        visiblePages.add(page);
    }

    let previousPage;
    [...visiblePages].sort((a, b) => a - b).forEach(page => {
        if (previousPage && page - previousPage > 1) addEllipsis();
        addPageButton(String(page), page, { active: page === currentPage });
        previousPage = page;
    });

    addPageButton('<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>', currentPage + 1, {
        disabled: currentPage === totalPages,
        ariaLabel: "Next page",
    });
}

loadProducts();
