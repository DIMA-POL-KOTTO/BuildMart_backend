const buttons = document.querySelectorAll(".add-to-cart")
let toastQueue = [];
const MAX_TOASTS = 3;

buttons.forEach(button => {
    button.addEventListener("click", async () => {
        let quantity = 1;
        const quanInput = document.getElementById("quan");
        if (quanInput) {
            quantity = +quanInput.value;
        }
        const card = button.closest(".product-card");
        let productId;
        let productName;
        if (!card) {
            productId = Number(new URLSearchParams(window.location.search).get("id"));
            productName = document.getElementById("productName").textContent;
        }
        else {
            productId = Number(card.dataset.id);
            productName = card.dataset.name;
        }
        const token = sessionStorage.getItem("token");
        if (!token) {
            showToast("Please log in to add products");
            return;
        }
        
        try {
            const response = await fetch("/api/cart/items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: productId,
                    quantity: quantity
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error("Failed to add prduct");
            }
            await updateCartCounter();
            showToast(`Added ${quantity} ${productName} to cart`);
            if (!card) {
                showDeleteBtn();
            }

        } catch (error){
            console.error(error);
            showToast("Failed to add product")
        }
    });
});

async function updateCartCounter() {
    const cartCount = document.querySelector(".count-products");
    const token = sessionStorage.getItem("token");
    try {
        const response = await fetch("/api/cart", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error("Failed to load cart");
        }
        const data = await response.json();
        const totalCount = data.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalCount;
        cartCount.style.display = totalCount > 0 ? "block" : "none";
    } catch (error) {
        console.log(error);
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