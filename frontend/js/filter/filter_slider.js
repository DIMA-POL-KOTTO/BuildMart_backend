const range = document.getElementById("sliderRange")
const minValue = document.getElementById("minValue")
const maxValue = document.getElementById("maxValue")
const maxPrice = 400;

function updateSlider(){
    let min = parseInt(minSlider.value)
    let max = parseInt(maxSlider.value)
    if (min > max - 10){
        max = max+10;
    }
    if (max < min + 10){
        min = min-10;
    }
    minSlider.value = min;
    maxSlider.value = max;
    minValue.textContent = "$" + min;
    maxValue.textContent = "$" + max;
    const percentMin = (min/(maxPrice+5)) * 100;
    const percentMax = (max/(maxPrice+10)) * 100;
    range.style.left = percentMin + "%";
    range.style.width = (percentMax - percentMin+2.5) + "%";
    filterProducts();
}

minSlider.addEventListener("input", updateSlider)
maxSlider.addEventListener("input", updateSlider)
updateSlider();


