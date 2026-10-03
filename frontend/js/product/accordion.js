const accordionBtn = document.querySelector(".accordion-btn");
const accordion = document.querySelector(".accordion");

accordionBtn.onclick = () => {
    accordion.classList.toggle("open");
}