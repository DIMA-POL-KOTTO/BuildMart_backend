const buttons = document.querySelectorAll(".add-to-cart")
let toastQueue = [];
const MAX_TOASTS = 3;

buttons.forEach(button => {
    button.addEventListener("click", () => {
        let quantity = 1;
        const quanInput = document.getElementById("quan");
        if (quanInput) {
            quantity = +quanInput.value;
        }
        const card = button.closest(".product-card");
        let product;
        if (!card) {
            const productId = new URLSearchParams(window.location.search).get("id");
            product = {
                id: productId,
                name: document.getElementById("productName").textContent,
                category: document.getElementById("productCategory").textContent,
                price: parseFloat(document.getElementById("productPrice").textContent.replace("$", '')),
                img: document.getElementById("productImg").src,
                count: quantity
            }
        }
        else {
            product = {
                id: card.dataset.id,
                name: card.dataset.name,
                category: card.dataset.category,
                price: parseFloat(card.dataset.price),
                img: card.dataset.img,
                count: 1
            };
        }
        
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.count += quantity;
        }
        else {
            cart.push(product);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCounter();
        if (!card) {
            showToast(`Added ${quantity} ${productName.textContent} to cart`);
            showDeleteBtn();
        }
        else {
            showToast(`Added ${card.dataset.name} to cart`);
        }
    });
});

function updateCartCounter() {
    const cartCount = document.querySelector(".count-products");
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalCount = cart.reduce((sum, item) => sum + item.count, 0);
    if (cartCount) {
        if (totalCount > 0) {
            cartCount.textContent = totalCount;
            cartCount.style.display = "block";
        }
        else {
            cartCount.style.display = "none";
        }
    }
}

function showToast(mes){
    const container = document.querySelector(".toast-container");
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <p><i class="fa-solid fa-circle-check"></i> ${mes}</p>
    `;
    toast.addEventListener("click", () => {
        window.location.href = "cart.html";
    })
    container.appendChild(toast);
    toastQueue.unshift(toast);
    if(toastQueue.length > MAX_TOASTS){
        const oldToast = toastQueue.pop();
        removeToast(oldToast);
    }
    updatePos();
    setTimeout(()=>{
        toast.classList.add("show");
    }, 10);
    setTimeout(() => {
        removeToast(toast);
    }, 3000);
}

function removeToast(toast) {
    if(!toast || !toast.parentNode){
        return;
    }
    toast.classList.add('hide');
    toast.classList.remove('show');
    setTimeout(()=>{
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
        toastQueue = toastQueue.filter(item => item!== toast);
        updatePos();
    }, 400);
}

function updatePos(){
    toastQueue.forEach((toast, index) => {
        if(index < MAX_TOASTS) {
            toast.setAttribute('data-position', index);
        }
    })
}

document.addEventListener('DOMContentLoaded', updateCartCounter);