ratingCheckboxes.forEach(cb => {
    cb.addEventListener('click', () => {
        ratingCheckboxes.forEach(other => {
            if (other !== cb) other.checked = false;
        });
        filterProducts();
    });
});