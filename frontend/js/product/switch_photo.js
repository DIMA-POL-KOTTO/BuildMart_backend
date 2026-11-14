function photoCarousel(images) {
    const mainImage = document.getElementById("productImg");
    const thumbnailContainer = document.querySelector(".other-images");
    const previousButton = document.querySelector(".nav.prev");
    const nextButton = document.querySelector(".nav.next");
    const imageList = Array.isArray(images) ? images : [];
    let current = 0;

    thumbnailContainer.replaceChildren();
    previousButton.hidden = imageList.length < 2;
    nextButton.hidden = imageList.length < 2;

    if (imageList.length === 0) {
        mainImage.removeAttribute("src");
        return;
    }

    const thumbnails = imageList.map((src, index) => {
        const thumbnail = document.createElement("img");
        thumbnail.className = "im";
        thumbnail.src = src;
        thumbnail.alt = `Product image ${index + 1}`;
        thumbnail.addEventListener("click", () => updateImage(index));
        thumbnailContainer.appendChild(thumbnail);
        return thumbnail;
    });

    function updateImage(index) {
        current = (index + imageList.length) % imageList.length;
        mainImage.src = imageList[current];
        thumbnails.forEach(img => img.classList.remove("active"));
        thumbnails[current].classList.add("active");
        thumbnails[current].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }

    nextButton.addEventListener("click", () => updateImage(current + 1));
    previousButton.addEventListener("click", () => updateImage(current - 1));
    updateImage(0);
}