const menuToggle = document.querySelector(".menu-mobile")
const menuMobile = document.getElementById("menuMobile")

menuToggle.addEventListener("click", () => {
    menuMobile.classList.toggle("active");
})

window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
        menuMobile.classList.remove('active');
    }
})