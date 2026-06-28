/* validations.js - טפסים, ולידציות, ושליחה לצד השרת */

function setError(id, message) {
  var error = document.querySelector('[data-error-for="' + id + '"]');
  if (error) error.innerText = message || "";
}

function required(id, message) {
  var el = document.getElementById(id);
  if (!el || !String(el.value || "").trim()) {
    setError(id, message);
    return false;
  }
  setError(id, "");
  return true;
}

function validateEmailField(id) {
  var el = document.getElementById(id);
  var value = el ? el.value.trim() : "";
  if (!/^\S+@\S+\.\S+$/.test(value)) {
    setError(id, "נא להזין אימייל תקין");
    return false;
  }
  setError(id, "");
  return true;
}

function validatePhoneField(id) {
  var el = document.getElementById(id);
  var value = el ? el.value.trim() : "";
  if (!/^0\d{8,9}$/.test(value.replace(/-/g, ""))) {
    setError(id, "נא להזין טלפון תקין");
    return false;
  }
  setError(id, "");
  return true;
}

function showSuccess(id, message) {
  var box = document.getElementById(id);
  if (box) {
    box.innerText = message;
    box.style.display = "block";
  }
}

async function sendToServer(url, data) {
  var response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  var result = await response.json().catch(function () { return {}; });
  if (!response.ok) throw new Error(result.message || "שגיאה בשליחת הנתונים לשרת");
  return result;
}

function initRegisterForm() {
  var form = document.getElementById("registerForm");
  if (!form) return;
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    var ok = required("regName", "נא להזין שם") & validateEmailField("regEmail") & required("regPassword", "נא להזין סיסמה") & required("regConfirm", "נא לאמת סיסמה");
    if (document.getElementById("regPassword").value !== document.getElementById("regConfirm").value) {
      setError("regConfirm", "הסיסמאות אינן זהות");
      ok = false;
    }
    if (!ok) return;
    try {
      var data = {
        name: document.getElementById("regName").value.trim(),
        email: document.getElementById("regEmail").value.trim(),
        password: document.getElementById("regPassword").value
      };
      var result = await sendToServer("/api/users/register", data);
      localStorage.setItem("currentUser", JSON.stringify(result.user));
      window.location.href = "account.html";
    } catch (err) {
      showSuccess("registerSuccess", err.message);
    }
  });
}

function initLoginForm() {
  var form = document.getElementById("loginForm");
  if (!form) return;
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    var ok = validateEmailField("loginEmail") & required("loginPassword", "נא להזין סיסמה");
    if (!ok) return;
    try {
      var result = await sendToServer("/api/users/login", {
        email: document.getElementById("loginEmail").value.trim(),
        password: document.getElementById("loginPassword").value
      });
      localStorage.setItem("currentUser", JSON.stringify(result.user));
      window.location.href = "account.html";
    } catch (err) {
      showSuccess("loginSuccess", err.message);
    }
  });
}

function initForgotForm() {
  var form = document.getElementById("forgotForm");
  if (!form) return;
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!validateEmailField("forgotEmail")) return;
    try {
      await sendToServer("/api/users/forgot-password", { email: document.getElementById("forgotEmail").value.trim() });
      showSuccess("forgotSuccess", "הבקשה לאיפוס סיסמה נשמרה במערכת 🌿");
    } catch (err) {
      showSuccess("forgotSuccess", err.message);
    }
  });
}

function initContactForm() {
  var form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    var ok = required("contactName", "נא להזין שם") & validateEmailField("contactEmail") & validatePhoneField("contactPhone") & required("contactMsg", "נא להזין הודעה");
    if (!ok) return;
    try {
      await sendToServer("/api/contact", {
        name: document.getElementById("contactName").value.trim(),
        email: document.getElementById("contactEmail").value.trim(),
        phone: document.getElementById("contactPhone").value.trim(),
        message: document.getElementById("contactMsg").value.trim()
      });
      showSuccess("contactSuccess", "ההודעה נשמרה בבסיס הנתונים ונשלחה בהצלחה 🌱");
      form.reset();
    } catch (err) {
      showSuccess("contactSuccess", err.message);
    }
  });
}

function getCurrentUserForCheckout() {
  try {
    var raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function prefillCheckoutFromUser() {
  var form = document.getElementById("checkoutForm");
  if (!form) return;
  var user = getCurrentUserForCheckout();
  if (!user) return;
  var nameInput = document.getElementById("fullName");
  var emailInput = document.getElementById("email");
  if (nameInput && !nameInput.value && user.name) nameInput.value = user.name;
  if (emailInput && user.email) {
    emailInput.value = user.email;
    emailInput.readOnly = true;
    emailInput.classList.add("readonly-input");
  }
}

function initCheckoutForm() {
  var form = document.getElementById("checkoutForm");
  if (!form) return;
  prefillCheckoutFromUser();
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    var cart = getCart();
    if (!cart.length) { alert("העגלה ריקה"); return; }

    var valid = true;
    if (!required("fullName", "נא להזין שם מלא")) valid = false;
    if (!validatePhoneField("phone")) valid = false;
    if (!validateEmailField("email")) valid = false;
    if (!required("city", "נא להזין עיר")) valid = false;
    if (!required("address", "נא להזין כתובת")) valid = false;
    if (!required("shipping", "נא לבחור שיטת משלוח")) valid = false;
    if (!required("payment", "נא לבחור אמצעי תשלום")) valid = false;
    var zip = document.getElementById("zip").value.trim();
    if (zip !== "" && !/^\d{5,7}$/.test(zip)) { setError("zip", "מיקוד צריך להכיל 5 עד 7 ספרות"); valid = false; } else { setError("zip", ""); }
    if (!valid) return;

    var shippingMethod = document.getElementById("shipping").value;
    var totals = calculateCartTotals(cart, shippingMethod);
    for (var i = 0; i < cart.length; i++) {
      cart[i].total = formatPrice(getPriceNumber(cart[i].unitPrice) * Number(cart[i].quantity || 0));
    }

    var order = {
      customer: {
        fullName: document.getElementById("fullName").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        city: document.getElementById("city").value.trim(),
        address: document.getElementById("address").value.trim(),
        zip: zip,
        shipping: shippingMethod,
        payment: document.getElementById("payment").value,
        notes: document.getElementById("notes").value.trim()
      },
      cart: JSON.parse(JSON.stringify(cart)),
      totals: totals
    };

    try {
      var result = await sendToServer("/api/orders", order);
      order.id = result.order.id;
      order.date = result.order.date;
      order.status = result.order.status;
      var orders = getOrders();
      orders.unshift(order);
      saveOrders(orders);
      localStorage.setItem("lastOrder", JSON.stringify(order));
      localStorage.removeItem("cart");
      window.location.href = "success.html";
    } catch (err) {
      showSuccess("cartSuccessMsg", err.message);
    }
  });
}

window.addEventListener("load", function () {
  initRegisterForm();
  initLoginForm();
  initForgotForm();
  initContactForm();
  initCheckoutForm();
});
