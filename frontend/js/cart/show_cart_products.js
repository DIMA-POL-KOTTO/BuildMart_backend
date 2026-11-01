const emptyCart = document.querySelector(".cart-empty")
const cartContent = document.querySelector(".cart-content")
const cartItems = document.getElementById("cartItems")
const cartCount = document.querySelector(".count-products")
let discountCoef = 0;

async function showCartProducts(){
    const token = sessionStorage.getItem("token");
    if (!token) {
        emptyCart.style.display = "block";
        cartContent.style.display = "none";
        if (cartCount) {
            cartCount.style.display = "none";
        }
        return;
    }
    try {
        const response = await fetch("/api/cart", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to load cart');
        }
        const data = await response.json();
        const cart = data.items || [];
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalCount;
            cartCount.style.display = totalCount > 0 ? "block" : "none"; 
        }
        if (cart.length === 0) {
            emptyCart.style.display = "block";
            cartContent.style.display = "none";
            updateSummary(0);
            return;
        }
        emptyCart.style.display = "none";
        cartContent.style.display = "block";
        cartItems.innerHTML = "";
        let subtotalCost = 0;
        cart.forEach(product => {
            const totalCost = product.price * product.quantity;
            subtotalCost += totalCost;
            let images = product.images;
            cartItems.innerHTML += `
            <div class="cart-item">
                <div class="cart-product">
                    <a href="product.html?id=${encodeURIComponent(product.productId)}"><img src="${images[0]}"></a>
                    <div class="cart-product-info">
                        <a href="product.html?id=${encodeURIComponent(product.productId)}"><h3>${product.title}</h3></a>
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
                    <p>${product.quantity}</p>
                    <button onclick="changeQuantity('${product.id}', +1)"${product.quantity >= product.stockQuantity ? "disabled":""}><i class="fa-solid fa-plus"></i></button>
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
    } catch (error) {
        console.error("Error loading cart: ", error);
    }

    
    
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

showCartProducts();