let current = 0
const mainImage = document.getElementById("productImg")
const otherImages = document.querySelectorAll(".im")
const srcList = Array.from(otherImages).map(img => img.src)

function updateImage(index) {
    current = index;
    mainImage.src = srcList[index];
    otherImages.forEach(img => img.classList.remove("active"));
    otherImages[index].classList.add("active");
}

otherImages.forEach((img, index) => {
    img.addEventListener("click", () => {
        updateImage(index);
    });
});

document.querySelector(".next").addEventListener("click", () => {
    updateImage((current + 1) % otherImages.length);
})

document.querySelector(".prev").addEventListener("click", () => {
    updateImage((current - 1 + otherImages.length) % otherImages.length);
})