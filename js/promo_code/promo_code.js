const promoInput = document.getElementById("promoInput")
const promoHint = document.querySelector(".promoHint")
let isApplied = false;

promoInput.addEventListener("input", () => {
    if (!isApplied){
        if (promoInput.value){
            promoHint.style.display = "block";
            promoHint.style.color = "#6b6a6a";
            promoHint.textContent = "Try code: BUILD10 for 10% off";
        }
        else {
            promoHint.style.display = "none";
        }
        if (promoInput.value === "BUILD10") {
            promoHint.style.display = "none";
        }
    }
    else {
        promoHint.style.display = "block";
    }
})

const promoBtn = document.getElementById("promoBtn")
const discountLine = document.querySelector(".discount-line")

promoBtn.addEventListener("click", () => {
    if (promoInput.value.length === 0) return;
    if (promoInput.value === "BUILD10"){
        isApplied = true;        
        window.applyPromo();
        promoHint.style.color = "green";
        promoHint.textContent = "✓ Promo code applied! You saved 10%";
        promoHint.style.display = "block";
    }
    else if (!isApplied) {
        promoHint.style.color = "red";
        promoHint.textContent = "X Promo code is incorrect!";
        promoHint.style.display = "block";
    }
})
