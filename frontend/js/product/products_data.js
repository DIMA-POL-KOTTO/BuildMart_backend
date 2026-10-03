const productsData = [
    {
        id: "1",
        name: "Exterior Paint Set",
        category: "Paint & Coatings",
        price: 45.99,
        img: "img/product_1.jfif",
        description: "Professional-grade exterior paint set designed to withstand harsh weather conditions. This premium paint offers excellent coverage, durability, and color retention. Perfect for residential and commercial exterior surfaces.",
        rating: 3.5,
        spec_t1: "VOLUME",
        spec_d1: "5 gallons total",
        spec_t2: "TYPE", 
        spec_d2: "100% Acrylic Latex",
        spec_t3: "COVERAGE",
        spec_d3: "400 sq ft per gallon",
        spec_t4: "FINISH",
        spec_d4: "Satin",
        spec_t5: "DRY TIME",
        spec_d5: "2-4 hours",
        spec_t6: "COLORS",
        spec_d6: "Assorted neutral tones",
    },
    {
        id: "2",
        name: "Plywood Sheets",
        category: "Wood & Lumber",
        price: 52.99,
        img: "img/product_2.jfif",
        description: "Versatile construction-grade plywood sheets suitable for a wide range of applications. These sheets are engineered for strength and dimensional stability, perfect for subfloors, roofing, walls, and general construction.",
        rating: 4.5,
        spec_t1: "DIMENSIONS",
        spec_d1: "4' x 8'",
        spec_t2: "THICKNESS", 
        spec_d2: "3/4 inch",
        spec_t3: "GRADE",
        spec_d3: "CDX",
        spec_t4: "PLIES",
        spec_d4: "7-ply construction",
        spec_t5: "EXPOSURE",
        spec_d5: "Exterior grade",
        spec_t6: "VENEER",
        spec_d6: "Softwood",
    },
    {
        id: "3",
        name: "Premium Cement Bags",
        category: "Cement & Concrete",
        price: 24.99,
        img: "img/product_3.jfif",
        description: "High-quality Portland cement bags designed for heavy-duty construction projects. Our premium cement offers exceptional strength, durability, and workability. Ideal for foundations, structural work, and general concrete applications. Each bag contains precisely measured and tested cement that meets international quality standards.",
        rating: 5.0,
        spec_t1: "Weight",
        spec_d1: "50 lbs per bag",
        spec_t2: "TYPE",
        spec_d2: "Portland Cement Type I/II",
        spec_t3: "COMPRESSIVE STRENGTH",
        spec_d3: "3500 PSI at 28 days",
        spec_t4: "SETTING TIME",
        spec_d4: "2-4 hours initial set",
        spec_t5: "COVERAGE",
        spec_d5: "Approximately 0.45 cubic feet",
        spec_t6: "STORAGE LIFE",
        spec_d6: "6 months in sealed bag"
    },
    {
        id: "4",
        name: "Premium Lumber Planks",
        category: "Wood & Lumber",
        price: 89.99,
        img: "img/product_4.jfif",
        description: "Premium kiln-dried lumber planks perfect for all your woodworking and construction needs. These high-grade wooden planks are carefully selected for strength and appearance. Suitable for framing, decking, furniture making, and various carpentry projects.",
        rating: 4.5,
        spec_t1: "DIMENSIONS",
        spec_d1: `2" x 6" x 8'`,
        spec_t2: "WOOD TYPE",
        spec_d2: "Douglas Fir",
        spec_t3: "GRADE",
        spec_d3: "Premium Select",
        spec_t4: "MOISTURE CONTENT",
        spec_d4: "15% kiln-dried",
        spec_t5: "TREATMENT",
        spec_d5: "Pressure-treated option available",
        spec_t6: "QUANTITY",
        spec_d6: "Sold individually"
    },
    {
        id: "5",
        name: "Red Clay Bricks",
        category: "Bricks & Blocks",
        price: 0.89,
        img: "img/product_5.jfif",
        description: "Traditional red clay bricks manufactured to the highest standards. These durable bricks are perfect for walls, patios, pathways, and architectural features. Fire-hardened for exceptional strength and weather resistance.",
        rating: 4.0,
        spec_t1: "DIMENSIONS",
        spec_d1: `8" x 4" x 2.25"`,
        spec_t2: "MATERIAL",
        spec_d2: "Fire-hardened clay",
        spec_t3: "COMPRESSIVE STRENGTH",
        spec_d3: "3000+ PSI",
        spec_t4: "WATER ABSORPTION",
        spec_d4: "Less than 8%",
        spec_t5: "COLOR",
        spec_d5: "Classic red",
        spec_t6: "WEIGHT",
        spec_d6: "4.5 lbs per brick"
    },
    {
        id: "6",
        name: "Steel I-Beams",
        category: "Steel & Metal",
        price: 349.99,
        img: "img/product_6.jfif",
        description: "Heavy-duty structural steel I-beams engineered for maximum load-bearing capacity. These professional-grade beams are essential for large construction projects, building frames, and structural support applications.",
        rating: 5.0,
        spec_t1: "LENGTH",
        spec_d1: "20 feet",
        spec_t2: "PROFILE",
        spec_d2: "W10x49",
        spec_t3: "MATERIAL",
        spec_d3: "ASTM A992 Grade 50 Steel",
        spec_t4: "WEIGHT",
        spec_d4: "980 lbs",
        spec_t5: "YIELD STRENGTH",
        spec_d5: "50 ksi",
        spec_t6: "FINISH",
        spec_d6: "Mill finish"
    }
];

function loadProduct() {
    const id = new URLSearchParams(window.location.search).get("id");
    const product = productsData.find(p => p.id === id);
    const deleteBtnSecondary = document.getElementById("deleteBtnSecondary");
    if (!product) return;
    document.getElementById("productImg").src = product.img;
    document.getElementById("productImg1").src = product.img;
    document.getElementById("productImg2").src = product.img;
    document.getElementById("productImg3").src = product.img;
    document.getElementById("productName").textContent = product.name;
    document.getElementById("productName1").textContent = product.name;
    document.getElementById("productPrice").textContent = "$" + product.price;
    document.getElementById("productDescription").textContent = product.description;
    document.getElementById("productCategory").textContent = product.category;
    if (deleteBtnSecondary){
        deleteBtnSecondary.dataset.id = id;
    }
    for (let i=1; i <= 6; i++) {
        document.getElementById(`spec_t${i}`).textContent = product[`spec_t${i}`];
        document.getElementById(`spec_d${i}`).textContent = product[`spec_d${i}`];
    }
    const relatedProducts = productsData.filter(p => p.category === product.category && p.id != product.id);
    const relatedGrid = document.querySelector(".products-grid");
    relatedProducts.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <a href="product.html?id=${p.id}">
                <div class="product-image">
                    <img src="${p.img}" alt="product">
                <div class="product-info" style="padding: 20px 20px 10px 15px">
                    <h3 style="margin: 10px 0">${p.name}</h3>
                    <div class="rating">
                        ${renderStars(p.rating)}
                        <span>(${p.rating})</span>
                    </div>
                    <div class="price">$${p.price}</div>
                </div>
            </a>
        `;
        relatedGrid.appendChild(card);
    });
}

loadProduct();
showDeleteBtn();

function renderStars (rating){
    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - halfStar;
    for (let i=0; i < fullStars; i++) {
        starsHtml += '<i class="fa-solid fa-star"></i>'
    }
    if (halfStar) {
        starsHtml += '<i class="fa-solid fa-star-half"></i>'
    }
    for (let i=0; i < emptyStars; i++) {
        starsHtml += '<i class="fa-regular fa-star" style="color: #ccc;"></i>'
    }
    return starsHtml;
}