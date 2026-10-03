const quan = document.getElementById("quan")
document.getElementById("minus").onclick = () => {
    if (quan.value > 1) {
        quan.value--;
    }
};

document.getElementById("plus").onclick = () => {
    quan.value++;
}