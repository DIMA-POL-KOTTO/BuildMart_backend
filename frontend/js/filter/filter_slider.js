const range = document.getElementById("sliderRange")
const minValue = document.getElementById("minValue")
const maxValue = document.getElementById("maxValue")
const minSlider = document.getElementById("minPrice");
const maxSlider = document.getElementById("maxPrice");

function updateSlider(){
    let min = parseInt(minSlider.value);
    let max = parseInt(maxSlider.value);
    const minBound = Number(minSlider.min);
    const maxBound = Number(maxSlider.max);

    if (min >= max){
        if (document.activeElement === minSlider) {
            min = Math.max(minBound, max - 10);
        } else {
            max = Math.min(maxBound, min + 10);
        }
    }
    minSlider.value = min;
    maxSlider.value = max;
    minValue.textContent = "$" + min;
    maxValue.textContent = "$" + max;
    const percentMin = ((min - minBound) / (Number(minSlider.max) - minBound)) * 100;
    const percentMax = ((max - minBound) / (Number(maxSlider.max) - minBound)) * 100;
    range.style.left = percentMin + "%";
    range.style.width = (percentMax - percentMin) + "%";
}

minSlider.addEventListener("input", updateSlider)
maxSlider.addEventListener("input", updateSlider)
updateSlider();


