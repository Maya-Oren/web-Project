/* קובץ של בדיקות הטפסים */

function setError(id, message) {
  var field = document.getElementById(id);
  var error = document.querySelector('[data-error-for="' + id + '"]');

  if (field) {
    if (message !== "") {
      field.classList.add("invalid");
    } else {
      field.classList.remove("invalid");
    }
  }

  if (error) {
    error.innerText = message;
  }
}

function checkEmail(value) {
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value);
}

function checkPhone(value) {
  var phonePattern = /^0\d{9}$/;
  return phonePattern.test(value);
}

function required(id, message) {
  var field = document.getElementById(id);
  var value = field.value.trim();

  if (value === "") {
    setError(id, message);
    return false;
  }

  setError(id, "");
  return true;
}

function validateEmailField(id) {
  var value = document.getElementById(id).value.trim();

  if (value === "") {
    setError(id, "שדה חובה");
    return false;
  }

  if (!checkEmail(value)) {
    setError(id, "נא להזין אימייל תקין");
    return false;
  }

  setError(id, "");
  return true;
}

function validatePhoneField(id) {
  var value = document.getElementById(id).value.trim();

  if (value === "") {
    setError(id, "שדה חובה");
    return false;
  }

  if (!checkPhone(value)) {
    setError(id, "טלפון חייב להתחיל ב־0 ולהכיל 10 ספרות");
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

function initRegisterForm() {
  var form = document.getElementById("registerForm");
  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var validName = required("regName", "נא להזין שם מלא");
    var validEmail = validateEmailField("regEmail");
    var password = document.getElementById("regPassword").value;
    var confirm = document.getElementById("regConfirm").value;
    var validPassword = true;

    if (password.length < 6) {
      setError("regPassword", "סיסמה חייבת להכיל לפחות 6 תווים");
      validPassword = false;
    } else {
      setError("regPassword", "");
    }

    if (confirm !== password || confirm === "") {
      setError("regConfirm", "הסיסמאות לא תואמות");
      validPassword = false;
    } else {
      setError("regConfirm", "");
    }

    if (!validName || !validEmail || !validPassword) {
      return;
    }

    var user = {
      name: document.getElementById("regName").value.trim(),
      email: document.getElementById("regEmail").value.trim(),
      password: password
    };

    localStorage.setItem("floraUser", JSON.stringify(user));
    localStorage.setItem("currentUser", JSON.stringify({ name: user.name, email: user.email }));

    showSuccess("registerSuccess", "נרשמת בהצלחה! מעבר לאזור האישי...");

    setTimeout(function () {
      window.location.href = "orders.html";
    }, 900);
  });
}

function initLoginForm() {
  var form = document.getElementById("loginForm");
  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var validEmail = validateEmailField("loginEmail");
    var passwordOk = required("loginPassword", "נא להזין סיסמה");

    if (!validEmail || !passwordOk) {
      return;
    }

    var savedText = localStorage.getItem("floraUser");
    var savedUser = null;
    if (savedText) {
      savedUser = JSON.parse(savedText);
    }

    var email = document.getElementById("loginEmail").value.trim();
    var password = document.getElementById("loginPassword").value;

    if (savedUser && savedUser.email === email && savedUser.password !== password) {
      setError("loginPassword", "הסיסמה אינה תואמת למשתמש שנרשם");
      return;
    }

    var name = email.split("@")[0];
    if (savedUser && savedUser.email === email) {
      name = savedUser.name;
    }

    localStorage.setItem("currentUser", JSON.stringify({ name: name, email: email }));
    showSuccess("loginSuccess", "התחברת בהצלחה! מעבר לאזור האישי...");

    setTimeout(function () {
      window.location.href = "orders.html";
    }, 900);
  });
}

function initForgotForm() {
  var form = document.getElementById("forgotForm");
  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (validateEmailField("forgotEmail")) {
      showSuccess("forgotSuccess", "נשלחה הודעת שחזור לדוגמה.");
    }
  });
}

function initContactForm() {
  var form = document.getElementById("contactForm");
  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var ok = true;

    if (!required("contactName", "נא להזין שם מלא")) {
      ok = false;
    }
    if (!validateEmailField("contactEmail")) {
      ok = false;
    }
    if (!validatePhoneField("contactPhone")) {
      ok = false;
    }
    if (!required("contactMsg", "נא להזין הודעה")) {
      ok = false;
    }

    if (!ok) {
      return;
    }

    showSuccess("contactSuccess", "ההודעה נשלחה בהצלחה 🌱");
    form.reset();
  });
}

function initCheckoutForm() {
  var form = document.getElementById("checkoutForm");
  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var cartText = localStorage.getItem("cart");
    var cart = [];
    if (cartText) {
      cart = JSON.parse(cartText);
    }

    if (cart.length === 0) {
      alert("העגלה ריקה");
      return;
    }

    var valid = true;

    if (!required("fullName", "נא להזין שם מלא")) {
      valid = false;
    }
    if (!validatePhoneField("phone")) {
      valid = false;
    }
    if (!validateEmailField("email")) {
      valid = false;
    }
    if (!required("city", "נא להזין עיר")) {
      valid = false;
    }
    if (!required("address", "נא להזין כתובת")) {
      valid = false;
    }
    if (!required("shipping", "נא לבחור שיטת משלוח")) {
      valid = false;
    }
    if (!required("payment", "נא לבחור אמצעי תשלום")) {
      valid = false;
    }

    var zip = document.getElementById("zip").value.trim();
    if (zip !== "" && !/^\d{5,7}$/.test(zip)) {
      setError("zip", "מיקוד צריך להכיל 5 עד 7 ספרות");
      valid = false;
    } else {
      setError("zip", "");
    }

    if (!valid) {
      return;
    }

    var productsTotal = 0;
    for (var i = 0; i < cart.length; i++) {
      var itemTotal = String(cart[i].total).replace("₪", "");
      productsTotal += Number(itemTotal) || 0;
    }

    var shippingMethod = document.getElementById("shipping").value;
    var shippingCost = 0;
    if (shippingMethod === "שליח עד הבית") {
      shippingCost = 30;
    }

    var finalTotal = productsTotal + shippingCost;
    var now = new Date();

    var order = {
      id: "F" + now.getTime(),
      date: now.toLocaleDateString("he-IL"),
      status: "בטיפול",
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
      cart: cart,
      totals: {
        products: productsTotal,
        shipping: shippingCost,
        final: finalTotal
      }
    };

    var ordersText = localStorage.getItem("orders");
    var orders = [];
    if (ordersText) {
      orders = JSON.parse(ordersText);
    }

    orders.unshift(order);
    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem("lastOrder", JSON.stringify(order));
    localStorage.removeItem("cart");

    window.location.href = "success.html";
  });
}

window.addEventListener("load", function () {
  initRegisterForm();
  initLoginForm();
  initForgotForm();
  initContactForm();
  initCheckoutForm();
});
