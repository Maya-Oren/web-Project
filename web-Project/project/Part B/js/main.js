/* קובץ JS ראשי לאתר */
function getCart() {
  var cart = localStorage.getItem("cart");
  if (cart) {
    return JSON.parse(cart);
  }
  return [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function getUser() {
  var user = localStorage.getItem("currentUser");
  if (user) {
    return JSON.parse(user);
  }
  return null;
}

function getPriceNumber(priceText) {
  var text = String(priceText || "0");
  text = text.replace("₪", "");
  text = text.replace(",", "");
  text = text.trim();
  return Number(text) || 0;
}

function getDisplayPrice(product) {
  if (product.options && product.options.length > 0) {
    return "החל מ־" + product.options[0].price;
  }
  return product.price || "";
}

function createProductCard(id, product) {
  var html = "";
  html += '<div class="product-card">';
  html += '<a href="product.html?id=' + id + '">';
  html += '<div class="image-box"><img src="' + product.image + '" alt="' + product.name + '"></div>';
  html += '</a>';
  html += '<h3>' + product.name + '</h3>';
  html += '<p class="price">' + getDisplayPrice(product) + '</p>';
  html += '<button type="button" onclick="location.href=\'product.html?id=' + id + '\'">צפייה במוצר</button>';
  html += '</div>';
  return html;
}

function updateHeader() {
  var cart = getCart();
  var cartCount = document.getElementById("cartCount");
  var cartPreviewItems = document.getElementById("cartPreviewItems");
  var accountLink = document.getElementById("accountLink");
  var user = getUser();

  if (cartCount) {
    var totalQuantity = 0;
    for (var i = 0; i < cart.length; i++) {
      totalQuantity += Number(cart[i].quantity);
    }
    cartCount.innerText = totalQuantity;
  }

  if (cartPreviewItems) {
    if (cart.length === 0) {
      cartPreviewItems.innerHTML = '<div class="empty-cart-preview">העגלה ריקה</div>';
    } else {
      var previewHtml = "";
      var limit = cart.length;
      if (limit > 3) {
        limit = 3;
      }

      for (var j = 0; j < limit; j++) {
        previewHtml += '<div class="cart-preview-item">';
        previewHtml += '<img src="' + cart[j].image + '" alt="' + cart[j].name + '">';
        previewHtml += '<div>';
        previewHtml += '<div>' + cart[j].name + '</div>';
        previewHtml += '<div>' + (cart[j].option || "") + '</div>';
        previewHtml += '<strong>' + cart[j].total + '</strong>';
        previewHtml += '</div></div>';
      }
      cartPreviewItems.innerHTML = previewHtml;
    }
  }

  if (accountLink) {
    accountLink.href = "account.html";
    if (user) {
      accountLink.innerText = "👤 אזור אישי";
    } else {
      accountLink.innerText = "👤 התחברות / הרשמה";
    }
  }
}

function renderHomePersonalArea() {
  var user = getUser();
  var guestEls = document.getElementsByClassName("guest-only");
  var userEls = document.getElementsByClassName("user-only");
  var helloUser = document.getElementById("helloUser");
  var homeOrdersText = document.getElementById("homeOrdersText");

  if (user) {
    for (var i = 0; i < guestEls.length; i++) {
      guestEls[i].classList.add("hidden");
    }
    for (var j = 0; j < userEls.length; j++) {
      userEls[j].classList.remove("hidden");
    }

    if (helloUser) {
      helloUser.innerText = "שלום " + user.name + " 🌿";
    }

    var ordersText = localStorage.getItem("orders");
    var orders = [];
    if (ordersText) {
      orders = JSON.parse(ordersText);
    }

    var activeOrders = 0;
    for (var k = 0; k < orders.length; k++) {
      if (orders[k].status !== "הושלמה") {
        activeOrders++;
      }
    }

    if (homeOrdersText) {
      if (activeOrders > 0) {
        homeOrdersText.innerText = "יש לך " + activeOrders + " הזמנות פעילות.";
      } else {
        homeOrdersText.innerText = "אין הזמנות פתוחות כרגע.";
      }
    }
  } else {
    for (var a = 0; a < guestEls.length; a++) {
      guestEls[a].classList.remove("hidden");
    }
    for (var b = 0; b < userEls.length; b++) {
      userEls[b].classList.add("hidden");
    }
  }
}

function renderAccountPage() {
  var user = getUser();
  var accountHello = document.getElementById("accountHello");
  var accountDetails = document.getElementById("accountDetails");
  var accountOrdersText = document.getElementById("accountOrdersText");

  if (!accountHello) {
    return;
  }

  if (user) {
    accountHello.innerText = "שלום " + user.name + " 🌿";
    if (accountDetails) {
      accountDetails.innerText = "אימייל מחובר: " + user.email;
    }

    var ordersText = localStorage.getItem("orders");
    var orders = [];
    if (ordersText) {
      orders = JSON.parse(ordersText);
    }

    var activeOrders = 0;
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].status !== "הושלמה") {
        activeOrders++;
      }
    }

    if (accountOrdersText) {
      if (orders.length === 0) {
        accountOrdersText.innerText = "עדיין אין הזמנות בחשבון.";
      } else {
        accountOrdersText.innerText = "יש לך " + activeOrders + " הזמנות פעילות מתוך " + orders.length + " הזמנות.";
      }
    }
  }
}

function initAccountEvents() {
  var logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("currentUser");
      window.location.href = "account.html";
    });
  }
}

function renderCatalog() {
  if (typeof products === "undefined") {
    return;
  }

  var featured = document.getElementById("featured");
  var deals = document.getElementById("deals");
  var productGrid = document.getElementById("productGrid");

  if (featured || deals) {
    for (var id in products) {
      var product = products[id];
      if (featured && product.category === "featured") {
        featured.innerHTML += createProductCard(id, product);
      }
      if (deals && product.category === "sale") {
        deals.innerHTML += createProductCard(id, product);
      }
    }
  }

  if (productGrid) {
    var type = productGrid.getAttribute("data-type");
    var kind = productGrid.getAttribute("data-kind");

    for (var productId in products) {
      var item = products[productId];
      var showProduct = true;

      if (type && item.type !== type) {
        showProduct = false;
      }
      if (kind && item.kind !== kind) {
        showProduct = false;
      }

      if (showProduct) {
        productGrid.innerHTML += createProductCard(productId, item);
      }
    }

    if (productGrid.innerHTML.trim() === "") {
      productGrid.innerHTML = '<p class="empty">לא נמצאו מוצרים בקטגוריה זו.</p>';
    }
  }
}

function initCatalogEvents() {
  var featured = document.getElementById("featured");
  var deals = document.getElementById("deals");
  var searchInput = document.getElementById("catalogSearch");
  var searchBtn = document.getElementById("catalogSearchBtn");

  var featuredRight = document.getElementById("featuredRight");
  var featuredLeft = document.getElementById("featuredLeft");
  var dealsRight = document.getElementById("dealsRight");
  var dealsLeft = document.getElementById("dealsLeft");

  if (featuredRight && featured) {
    featuredRight.addEventListener("click", function () {
      featured.scrollBy(300, 0);
    });
  }
  if (featuredLeft && featured) {
    featuredLeft.addEventListener("click", function () {
      featured.scrollBy(-300, 0);
    });
  }
  if (dealsRight && deals) {
    dealsRight.addEventListener("click", function () {
      deals.scrollBy(300, 0);
    });
  }
  if (dealsLeft && deals) {
    dealsLeft.addEventListener("click", function () {
      deals.scrollBy(-300, 0);
    });
  }

  function runSearch() {
    if (!searchInput) {
      return;
    }
    var value = searchInput.value.trim().toLowerCase();
    var cards = document.querySelectorAll(".product-card");
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].innerText.toLowerCase().indexOf(value) !== -1) {
        cards[i].style.display = "block";
      } else {
        cards[i].style.display = "none";
      }
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", runSearch);
  }
  if (searchBtn) {
    searchBtn.addEventListener("click", runSearch);
  }
}

function getProductIdFromUrl() {
  var url = window.location.href;
  var parts = url.split("id=");
  if (parts.length > 1) {
    return parts[1].split("&")[0];
  }
  return null;
}

function renderProductPage() {
  if (typeof products === "undefined") {
    return;
  }

  var productName = document.getElementById("productName");
  if (!productName) {
    return;
  }

  var id = getProductIdFromUrl();
  var product = products[id];

  if (!product) {
    document.body.innerHTML = "<h1 style='text-align:center; margin-top:80px;'>המוצר לא נמצא</h1>";
    return;
  }

  var selectedProduct;
  var productImage = document.getElementById("productImage");
  var productDesc = document.getElementById("productDesc");
  var productPrice = document.getElementById("productPrice");
  var optionBox = document.getElementById("optionBox");
  var productOption = document.getElementById("productOption");
  var quantityInput = document.getElementById("quantity");
  var addToCartBtn = document.getElementById("addToCartBtn");
  var message = document.getElementById("message");

  productName.innerText = product.name;
  productImage.src = product.image;
  productImage.alt = product.name;
  productDesc.innerText = product.desc || "";

  if (product.options && product.options.length > 0) {
    optionBox.style.display = "block";
    for (var i = 0; i < product.options.length; i++) {
      productOption.innerHTML += '<option value="' + i + '">' + product.options[i].size + ' - ' + product.options[i].price + '</option>';
    }
    selectedProduct = product.options[0];

    productOption.addEventListener("change", function () {
      selectedProduct = product.options[this.value];
      updateProductPrice();
    });
  } else {
    selectedProduct = { size: "", price: product.price };
  }

  function updateProductPrice() {
    var quantity = Number(quantityInput.value);
    if (quantity < 1 || isNaN(quantity)) {
      quantity = 1;
      quantityInput.value = 1;
    }
    var total = getPriceNumber(selectedProduct.price) * quantity;
    productPrice.innerText = "₪" + total;
  }

  quantityInput.addEventListener("input", updateProductPrice);

  addToCartBtn.addEventListener("click", function () {
    var quantity = Number(quantityInput.value);
    if (quantity < 1 || isNaN(quantity)) {
      quantity = 1;
    }

    var total = getPriceNumber(selectedProduct.price) * quantity;
    var cart = getCart();
    var found = false;

    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id && cart[i].option === (selectedProduct.size || "")) {
        cart[i].quantity = Number(cart[i].quantity) + quantity;
        cart[i].total = "₪" + (getPriceNumber(cart[i].unitPrice) * cart[i].quantity);
        found = true;
      }
    }

    if (!found) {
      var cartItem = {
        id: id,
        name: product.name,
        image: product.image,
        option: selectedProduct.size || "",
        unitPrice: selectedProduct.price,
        quantity: quantity,
        total: "₪" + total
      };
      cart.push(cartItem);
    }

    saveCart(cart);
    updateHeader();
    message.style.display = "block";

    setTimeout(function () {
      message.style.display = "none";
    }, 1800);
  });

  updateProductPrice();
}

function renderCart() {
  var container = document.getElementById("cartContainer");
  var totalBox = document.getElementById("totalPrice");

  if (!container || !totalBox) {
    return;
  }

  var cart = getCart();
  var total = 0;
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = '<div class="empty">העגלה ריקה</div>';
    totalBox.innerText = "סה״כ לתשלום: ₪0";
    updateHeader();
    return;
  }

  for (var i = 0; i < cart.length; i++) {
    var unitPrice = getPriceNumber(cart[i].unitPrice);
    var itemTotal = unitPrice * Number(cart[i].quantity);
    cart[i].total = "₪" + itemTotal;
    total += itemTotal;

    var html = "";
    html += '<div class="cart-item">';
    html += '<img src="' + cart[i].image + '" alt="' + cart[i].name + '">';
    html += '<div class="cart-details">';
    html += '<h3>' + cart[i].name + '</h3>';
    html += '<div>' + (cart[i].option || "") + '</div>';
    html += '<div class="price">מחיר יחידה: ' + cart[i].unitPrice + '</div>';
    html += '<div class="qty-controls">';
    html += '<button type="button" class="qty-minus" data-index="' + i + '">-</button>';
    html += '<span>כמות: ' + cart[i].quantity + '</span>';
    html += '<button type="button" class="qty-plus" data-index="' + i + '">+</button>';
    html += '</div>';
    html += '<div class="price">סה״כ מוצר: ' + cart[i].total + '</div>';
    html += '</div>';
    html += '<button type="button" class="danger-btn remove-item" data-index="' + i + '">הסר</button>';
    html += '</div>';

    container.innerHTML += html;
  }

  saveCart(cart);
  totalBox.innerText = "סה״כ מוצרים: ₪" + total;
  updateHeader();
}

function initCartEvents() {
  var container = document.getElementById("cartContainer");
  var clearCartBtn = document.getElementById("clearCartBtn");
  var shipping = document.getElementById("shipping");

  if (container) {
    container.addEventListener("click", function (event) {
      var index = Number(event.target.getAttribute("data-index"));

      if (event.target.classList.contains("qty-plus")) {
        changeQty(index, 1);
      }
      if (event.target.classList.contains("qty-minus")) {
        changeQty(index, -1);
      }
      if (event.target.classList.contains("remove-item")) {
        removeItem(index);
      }
    });
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", function () {
      localStorage.removeItem("cart");
      renderCart();
      updateCartTotalWithShipping();
    });
  }

  if (shipping) {
    shipping.addEventListener("change", updateCartTotalWithShipping);
  }
}

function updateCartTotalWithShipping() {
  var totalBox = document.getElementById("totalPrice");
  var shipping = document.getElementById("shipping");

  if (!totalBox) {
    return;
  }

  var cart = getCart();
  var total = 0;

  for (var i = 0; i < cart.length; i++) {
    total += getPriceNumber(cart[i].unitPrice) * Number(cart[i].quantity);
  }

  var shippingCost = 0;
  if (shipping && shipping.value === "שליח עד הבית") {
    shippingCost = 30;
  }

  var finalTotal = total + shippingCost;
  totalBox.innerHTML = "סה״כ מוצרים: ₪" + total + "<br>משלוח: ₪" + shippingCost + "<br>סה״כ לתשלום: ₪" + finalTotal;
}

function changeQty(index, change) {
  var cart = getCart();
  cart[index].quantity = Number(cart[index].quantity) + change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart(cart);
  renderCart();
  updateCartTotalWithShipping();
}

function removeItem(index) {
  var cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
  updateCartTotalWithShipping();
}

function renderOrders(tab) {
  var list = document.getElementById("ordersList");
  if (!list) {
    return;
  }

  if (!tab) {
    tab = "active";
  }

  var ordersText = localStorage.getItem("orders");
  var orders = [];
  if (ordersText) {
    orders = JSON.parse(ordersText);
  }

  var html = "";
  var counter = 0;

  for (var i = 0; i < orders.length; i++) {
    var isPast = orders[i].status === "הושלמה";

    if ((tab === "past" && isPast) || (tab === "active" && !isPast)) {
      counter++;
      html += '<div class="order-card">';
      html += '<h3>הזמנה מספר ' + orders[i].id + '</h3>';
      html += '<p><strong>תאריך:</strong> ' + orders[i].date + '</p>';
      html += '<p><strong>סטטוס:</strong> ' + orders[i].status + '</p>';
      html += '<p><strong>משלוח:</strong> ' + orders[i].customer.shipping + '</p>';
      html += '<p><strong>סה״כ:</strong> ₪' + orders[i].totals.final + '</p>';
      html += '<ul class="order-items">';

      for (var j = 0; j < orders[i].cart.length; j++) {
        html += '<li>' + orders[i].cart[j].name + ' ' + (orders[i].cart[j].option || "") + ' × ' + orders[i].cart[j].quantity + '</li>';
      }

      html += '</ul></div>';
    }
  }

  if (counter === 0) {
    list.innerHTML = '<div class="empty">אין הזמנות להצגה.</div>';
  } else {
    list.innerHTML = html;
  }
}

function initOrdersEvents() {
  var tabButtons = document.querySelectorAll(".tab-btn");

  for (var i = 0; i < tabButtons.length; i++) {
    tabButtons[i].addEventListener("click", function () {
      for (var j = 0; j < tabButtons.length; j++) {
        tabButtons[j].classList.remove("active");
      }
      this.classList.add("active");
      renderOrders(this.getAttribute("data-order-tab"));
    });
  }
}

function renderSuccess() {
  var box = document.getElementById("successOrderDetails");
  if (!box) {
    return;
  }

  var orderText = localStorage.getItem("lastOrder");
  if (!orderText) {
    box.innerHTML = "<p>לא נמצאה הזמנה אחרונה.</p>";
    return;
  }

  var order = JSON.parse(orderText);
  var html = "";
  html += "<p><strong>מספר הזמנה:</strong> " + order.id + "</p>";
  html += "<p><strong>שם:</strong> " + order.customer.fullName + "</p>";
  html += "<p><strong>סה״כ לתשלום:</strong> ₪" + order.totals.final + "</p>";
  box.innerHTML = html;
}

window.onload = function () {
  updateHeader();
  renderHomePersonalArea();
  renderAccountPage();
  initAccountEvents();
  renderCatalog();
  initCatalogEvents();
  renderProductPage();
  renderCart();
  initCartEvents();
  updateCartTotalWithShipping();
  initOrdersEvents();
  renderOrders("active");
  renderSuccess();
};
