document.addEventListener("DOMContentLoaded", () => {
    const ratingCheckboxes = document.querySelectorAll('.rating-option input');
    const minSlider = document.getElementById("minPrice");
    const maxSlider = document.getElementById("maxPrice");
    const searchInputs = document.querySelectorAll(".search-bar input");
    const sortSelect = document.querySelector(".sort select");
    const clearButtons = [document.getElementById("clearBtn"), document.getElementById("clearBtn2")].filter(Boolean);
    let searchTimeout;

    async function applyFilters() {
        const min = parseInt(minSlider.value);
        const max = parseInt(maxSlider.value);
        const checked = document.querySelector('.rating-option input:checked');
        const params = {min_price: String(min), max_price: String(max)};
        if (checked) {
            params.min_rating = checked.value;
        }
        const search = searchInputs[0]?.value.trim();
        if (search) {
            params.search = search;
        }
        const sort = sortSelect?.value;
        if (sort === "price-low") {
            params.sort_by = "up";
        } else if (sort === "price-high") {
            params.sort_by = "down";
        } else if (sort === "name-az" || sort === "name-za") {
            params.sort_by = sort;
        }
        currentPage = 1;
        await loadProducts(params);
    }

    function clearFilters() {
        ratingCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        minSlider.value = minSlider.min || 0;
        maxSlider.value = maxSlider.max || 400;
        searchInputs.forEach(input => {
            input.value = "";
        });
        if (sortSelect) {
            sortSelect.value = "name-az";
        }
        updateSlider();
        applyFilters();
    }
    minSlider.addEventListener("change", applyFilters);
    maxSlider.addEventListener("change", applyFilters);
    ratingCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            ratingCheckboxes.forEach(other => {
                if (other !== checkbox) {
                    other.checked = false;
                }
            });
            applyFilters();
        });
    });
    searchInputs.forEach(input => {
        input.addEventListener("input", () => {
            searchInputs.forEach(other => {
                if (other !== input) {
                    other.value = input.value;
                }
            });
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(applyFilters, 300);
        });
    });
    if (sortSelect) {
        sortSelect.addEventListener("change", applyFilters);
    }
    clearButtons.forEach(button => {
        button.addEventListener("click", clearFilters);
    })
})


function filterProducts(){
   
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