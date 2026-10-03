document.addEventListener('DOMContentLoaded', () => {
    const sortSelect = document.querySelector('.sort select');
    const productsGrid = document.querySelector('.products-grid');

    function sortProducts(crit) {
        const products = Array.from(productsGrid.querySelectorAll('.product-card'));
        products.sort((a,b) => {
            switch(crit) {
                case 'name-az':
                    const nameA = a.dataset.name.toLowerCase();
                    const nameB = b.dataset.name.toLowerCase();
                    return nameA.localeCompare(nameB);
                case 'name-za':
                    return b.dataset.name.toLowerCase().localeCompare(a.dataset.name.toLowerCase());
                case 'price-low':
                    return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                case 'price-high':
                    return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
                default:
                    return 0;
            }
        });
        products.forEach(product => productsGrid.appendChild(product));
    }
    sortSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        sortProducts(value);
    });
})