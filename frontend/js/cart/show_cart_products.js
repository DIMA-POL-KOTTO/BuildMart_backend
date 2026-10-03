const emptyCart = document.querySelector(".cart-empty")
const cartContent = document.querySelector(".cart-content")
const cartItems = document.getElementById("cartItems")
let cart = JSON.parse(localStorage.getItem("cart")) || []
const cartCount = document.querySelector(".count-products")
let discountCoef = 0;
if (cart.length === 0){
    emptyCart.style.display = "block";
    cartContent.style.display = "none";
    cartCount.style.display = "none";
}
else {
    emptyCart.style.display = "none";
    cartContent.style.display = "block";
    showCartProducts();
}

function showCartProducts(){
    let cart = JSON.parse(localStorage.getItem("cart")) || []
    const totalCount = cart.reduce((sum, item) => sum + item.count, 0);
    if (totalCount > 0){
        cartCount.textContent = totalCount;
    }
    if (cart.length === 0){
        emptyCart.style.display = "block";
        cartContent.style.display = "none";
        cartCount.style.display = "none"; 
        return;
    }
    cartItems.innerHTML = "";
    let subtotalCost = 0;
    cart.forEach(product => {
        const totalCost = product.price * product.count;
        subtotalCost += totalCost;
        cartItems.innerHTML += `
        <div class="cart-item">
            <div class="cart-product">
                <a href="product.html?id=${product.id}"><img src="${product.img}"></a>
                <div class="cart-product-info">
                    <a href="product.html?id=${product.id}"><h3>${product.name}</h3></a>
                    <p>${product.category}</p>
                    <button class="remove-btn-mobile" onclick="deleteProduct('${product.id}')"> 
                        <i class="fa-regular fa-trash-can"></i> Remove
                    </button>
                </div>
            </div>
            <div class="cart-price-container">
                <p class="price-mobile">Price:</p>
                <div class="cart-price">$${product.price}</div>
            </div>
            <div class="cart-quantity">
                <button onclick="changeQuantity('${product.id}', -1)"><i class="fa-solid fa-minus"></i></button>
                <p>${product.count}</p>
                <button onclick="changeQuantity('${product.id}', +1)"><i class="fa-solid fa-plus"></i></button>
            </div>
            <div class="total-container">
                <p class="price-mobile total-mobile">Total:</p>
                <div class="cart-total">
                    <p>$${totalCost.toFixed(2)}</p>
                    <button onclick="deleteProduct('${product.id}')"><i class="fa-regular fa-trash-can"></i></button>
                </div>
            </div>
        </div>
        `;
    });
    updateSummary(subtotalCost)
}

function updateSummary(subtotal) {
    const tax = subtotal * 0.08;
    const discount = subtotal * discountCoef;
    const total = subtotal + tax - discount;
    document.getElementById("subtotal").textContent = "$" + subtotal.toFixed(2);
    document.getElementById("tax").textContent = "$" + tax.toFixed(2);
    document.getElementById("total").textContent = "$" + total.toFixed(2);
    document.getElementById("discount").textContent = "-$" + discount.toFixed(2);
    const discountLine = document.querySelector(".discount-line");
    if (discountLine) {
        discountLine.style.display = discountCoef > 0 ? "flex" : "none";
    }
}

window.applyPromo = function() {
    discountCoef = 0.1;
    const subtotal = parseFloat(document.getElementById("subtotal").textContent.replace(/[^0-9.]/g, ''));
    updateSummary(subtotal);
}
