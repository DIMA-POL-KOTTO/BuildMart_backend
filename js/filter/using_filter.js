const products = document.querySelectorAll('.product-card');
const ratingCheckboxes = document.querySelectorAll('.rating-option input');
const minSlider = document.getElementById("minPrice");
const maxSlider = document.getElementById("maxPrice");
const noProductsMessage = document.getElementById("noProductsMessage");
const clearBtn2 = document.getElementById("clearBtn2");
const productsCount = document.querySelector('.products-count');

function filterProducts(){
    const min = parseInt(minSlider.value);
    const max = parseInt(maxSlider.value);
    const checked = document.querySelector('.rating-option input:checked');
    const rating = checked ? parseFloat(checked.value) : null;
    let count = 0;
    products.forEach(product => {
        const price = parseFloat(product.dataset.price);
        const productRating = parseFloat(product.dataset.rating);
        const priceMatch = price >= min && price <= max;
        const ratingMatch = rating === null || productRating >= rating;
        if (priceMatch && ratingMatch) {
            product.style.display = 'block';
            count++;
        }
        else {
            product.style.display = 'none';
        }
    });
    productsCount.textContent = 'Showing ' + count + ' products';
    if (count === 0){
        noProductsMessage.style.display = 'block';
        const clearBtn2 = document.getElementById("clearBtn2")
        clearBtn2.addEventListener('click', clearFilters)
    }
    else {
        noProductsMessage.style.display = 'none';
    }

}