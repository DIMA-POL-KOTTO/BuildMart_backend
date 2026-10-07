

async function loadProduct() {
    const id = new URLSearchParams(window.location.search).get("id");
    if(!id) {
        console.error("Product ID not found in URL");
        return;
    }
    try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
            throw new Error("Product not found");
        }
        const product = await response.json();
        const deleteBtnSecondary = document.getElementById("deleteBtnSecondary");
        document.getElementById("productImg").src = product.images[0];
        document.getElementById("productImg1").src = product.images[0];
        document.getElementById("productImg2").src = product.images[1];
        document.getElementById("productImg3").src = product.images[2];
        document.getElementById("productName").textContent = product.title;
        document.getElementById("productName1").textContent = product.title;
        document.getElementById("productPrice").textContent = "$" + product.price;
        document.getElementById("productDescription").textContent = product.description;
        document.getElementById("productRating").innerHTML = `${renderStars(product.rating)} <span>(${product.rating})</span>`;
        document.getElementById("productCategory").textContent = "Заглушка";
        if (deleteBtnSecondary){
            deleteBtnSecondary.dataset.id = id;
        }
        for (let i=1; i <= 6; i++) {
            document.getElementById(`spec_t${i}`).textContent = "Заглушка"; //product[`spec_t${i}`]
            document.getElementById(`spec_d${i}`).textContent = "Заглушка";
        }
        /*const relatedProducts = productsData.filter(p => p.category === product.category && p.id != product.id);
        const relatedGrid = document.querySelector(".products-grid");
        relatedProducts.forEach(p => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <a href="product.html?id=${p.id}">
                    <div class="product-image">
                        <img src="${p.img}" alt="product">
                    <div class="product-info" style="padding: 20px 20px 10px 15px">
                        <h3 style="margin: 10px 0">${p.name}</h3>
                        <div class="rating">
                            ${renderStars(p.rating)}
                            <span>(${p.rating})</span>
                        </div>
                        <div class="price">$${p.price}</div>
                    </div>
                </a>
            `;
            relatedGrid.appendChild(card);
        });*/
    } catch (error) {
        console.error(error);
    }
}



loadProduct();
showDeleteBtn();

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