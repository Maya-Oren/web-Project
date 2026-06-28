const sql = require("./db.js");

function isEmail(email) {
  return /^\S+@\S+\.\S+$/.test(String(email || "").trim());
}
function isPhone(phone) {
  return /^0\d{8,9}$/.test(String(phone || "").replace(/-/g, ""));
}
function required(value) {
  return String(value || "").trim().length > 0;
}
function sendSqlError(res, action, err) {
  console.log("error in " + action + ": ", err);
  res.status(400).send({ message: "error in " + action + ": " + err });
}

const createUser = function(req, res) {
  if (!req.body || !required(req.body.name) || !isEmail(req.body.email) || !required(req.body.password)) {
    return res.status(400).send({ message: "נא למלא שם, אימייל תקין וסיסמה" });
  }
  const newUser = {
    name: req.body.name.trim(),
    email: req.body.email.trim(),
    password: req.body.password
  };
  sql.query("INSERT INTO users SET ?", newUser, (err, mysqlres) => {
    if (err) return sendSqlError(res, "creating user", err);
    res.send({ message: "user created successfully", user: { id: mysqlres.insertId, name: newUser.name, email: newUser.email } });
  });
};

const loginUser = function(req, res) {
  if (!req.body || !isEmail(req.body.email) || !required(req.body.password)) {
    return res.status(400).send({ message: "נא להזין אימייל וסיסמה" });
  }
  sql.query("SELECT id, name, email FROM users WHERE email = ? AND password = ?", [req.body.email.trim(), req.body.password], (err, results) => {
    if (err) return sendSqlError(res, "login", err);
    if (!results.length) return res.status(404).send({ message: "משתמש לא נמצא או שהסיסמה לא נכונה" });
    res.send({ message: "login successfully", user: results[0] });
  });
};

const saveForgotPasswordRequest = function(req, res) {
  if (!req.body || !isEmail(req.body.email)) return res.status(400).send({ message: "נא להזין אימייל תקין" });
  sql.query("INSERT INTO password_requests SET ?", { email: req.body.email.trim() }, (err) => {
    if (err) return sendSqlError(res, "saving password request", err);
    res.send({ message: "password request saved successfully" });
  });
};

const createContactMessage = function(req, res) {
  if (!req.body || !required(req.body.name) || !isEmail(req.body.email) || !isPhone(req.body.phone) || !required(req.body.message)) {
    return res.status(400).send({ message: "נא למלא שם, אימייל, טלפון והודעה תקינים" });
  }
  const message = {
    name: req.body.name.trim(),
    email: req.body.email.trim(),
    phone: req.body.phone.trim(),
    message: req.body.message.trim()
  };
  sql.query("INSERT INTO contact_messages SET ?", message, (err, mysqlres) => {
    if (err) return sendSqlError(res, "creating contact message", err);
    res.send({ message: "contact message created successfully", id: mysqlres.insertId });
  });
};

const getAllContactMessages = function(req, res) {
  sql.query("SELECT * FROM contact_messages ORDER BY created_at DESC", (err, results) => {
    if (err) return sendSqlError(res, "getting contact messages", err);
    res.send(results);
  });
};

const createOrder = function(req, res) {
  const body = req.body || {};
  const customer = body.customer || {};
  const cart = body.cart || [];
  const totals = body.totals || {};
  if (!required(customer.fullName) || !isPhone(customer.phone) || !isEmail(customer.email) || !required(customer.city) || !required(customer.address) || !required(customer.shipping) || !required(customer.payment)) {
    return res.status(400).send({ message: "חסרים פרטי לקוח/משלוח חובה או שהם לא תקינים" });
  }
  if (!Array.isArray(cart) || cart.length === 0) return res.status(400).send({ message: "אי אפשר ליצור הזמנה עם עגלה ריקה" });

  const orderNumber = "F" + Date.now();
  const orderRow = {
    order_number: orderNumber,
    full_name: customer.fullName.trim(),
    phone: customer.phone.trim(),
    email: customer.email.trim(),
    city: customer.city.trim(),
    address: customer.address.trim(),
    zip: customer.zip || "",
    shipping_method: customer.shipping,
    payment_method: customer.payment,
    notes: customer.notes || "",
    products_total: Number(totals.productsTotal || 0),
    shipping_price: Number(totals.shipping || 0),
    final_total: Number(totals.final || 0),
    status: "בטיפול"
  };

  sql.query("INSERT INTO orders SET ?", orderRow, (err, mysqlres) => {
    if (err) return sendSqlError(res, "creating order", err);
    const orderId = mysqlres.insertId;
    let inserted = 0;
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      const itemRow = {
        order_id: orderId,
        product_id: item.id || null,
        product_name: item.name,
        product_option: item.option || "",
        image: item.image || "",
        unit_price: Number(String(item.unitPrice || "0").replace(/[^0-9.]/g, "")),
        quantity: Number(item.quantity || 1),
        total_price: Number(String(item.total || "0").replace(/[^0-9.]/g, ""))
      };
      sql.query("INSERT INTO order_items SET ?", itemRow, (itemErr) => {
        if (itemErr) console.log("error in creating order item: ", itemErr);
        inserted++;
        if (inserted === cart.length) {
          res.send({ message: "order created successfully", order: { id: orderNumber, date: new Date().toLocaleDateString("he-IL"), status: "בטיפול" } });
        }
      });
    }
  });
};

const getOrders = function(req, res) {
  const email = req.query.email;
  let query = "SELECT * FROM orders";
  let params = [];
  if (email) { query += " WHERE email = ?"; params.push(email); }
  query += " ORDER BY created_at DESC";
  sql.query(query, params, (err, orders) => {
    if (err) return sendSqlError(res, "getting orders", err);
    if (!orders.length) return res.send([]);
    const ids = orders.map(o => o.id);
    sql.query("SELECT * FROM order_items WHERE order_id IN (?)", [ids], (itemsErr, items) => {
      if (itemsErr) return sendSqlError(res, "getting order items", itemsErr);
      const result = orders.map(o => ({
        id: o.order_number,
        date: new Date(o.created_at).toLocaleDateString("he-IL"),
        status: o.status,
        customer: { fullName: o.full_name, phone: o.phone, email: o.email, city: o.city, address: o.address, zip: o.zip, shipping: o.shipping_method, payment: o.payment_method, notes: o.notes },
        cart: items.filter(it => it.order_id === o.id).map(it => ({ id: it.product_id, name: it.product_name, option: it.product_option, image: it.image, unitPrice: "₪" + it.unit_price, quantity: it.quantity, total: "₪" + it.total_price })),
        totals: { productsTotal: o.products_total, shipping: o.shipping_price, final: o.final_total }
      }));
      res.send(result);
    });
  });
};

const updateOrderStatus = function(req, res) {
  if (!required(req.body.status)) return res.status(400).send({ message: "נא לשלוח סטטוס לעדכון" });
  sql.query("UPDATE orders SET status = ? WHERE order_number = ?", [req.body.status, req.params.orderNumber], (err, mysqlres) => {
    if (err) return sendSqlError(res, "updating order", err);
    if (mysqlres.affectedRows === 0) return res.status(404).send({ message: "הזמנה לא נמצאה" });
    res.send({ message: "order updated successfully" });
  });
};

const deleteOrder = function(req, res) {
  sql.query("DELETE FROM orders WHERE order_number = ?", [req.params.orderNumber], (err, mysqlres) => {
    if (err) return sendSqlError(res, "deleting order", err);
    if (mysqlres.affectedRows === 0) return res.status(404).send({ message: "הזמנה לא נמצאה" });
    res.send({ message: "order deleted successfully" });
  });
};

module.exports = { createUser, loginUser, saveForgotPasswordRequest, createContactMessage, getAllContactMessages, createOrder, getOrders, updateOrderStatus, deleteOrder };
