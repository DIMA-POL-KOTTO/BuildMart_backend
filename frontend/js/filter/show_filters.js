const button = document.getElementById('toggleFilter');
const panel = document.getElementById('panelFilters');

button.addEventListener('click', () => {
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) {
        button.innerHTML = '<i class="fa-solid fa-sliders"></i> Hide Filters';
    }
    else {
        button.innerHTML = '<i class="fa-solid fa-sliders"></i> Show Filters';
    }
});





