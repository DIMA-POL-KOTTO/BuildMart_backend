const clearBtn = document.getElementById("clearBtn")

function clearFilters(){
    ratingCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    minSlider.value = 0;
    maxSlider.value = 400;
    updateSlider();
    products.forEach(product => {
        product.style.display = 'block';
    });
};

clearBtn.addEventListener('click', clearFilters)
