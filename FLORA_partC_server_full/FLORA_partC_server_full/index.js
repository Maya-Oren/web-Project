const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const CRUD_operations = require("./CRUD_functions.js");

const app = express();
const port = 3000;

// parse requests of content-type: application/json
app.use(bodyParser.json());
// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static HTML, CSS, JS and images from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Home page route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home-page.html"));
});

// User routes
app.post("/api/users/register", CRUD_operations.createUser);
app.post("/api/users/login", CRUD_operations.loginUser);
app.post("/api/users/forgot-password", CRUD_operations.saveForgotPasswordRequest);

// Contact routes
app.post("/api/contact", CRUD_operations.createContactMessage);
app.get("/api/contact", CRUD_operations.getAllContactMessages);

// Order routes
app.post("/api/orders", CRUD_operations.createOrder);
app.get("/api/orders", CRUD_operations.getOrders);
app.put("/api/orders/:orderNumber", CRUD_operations.updateOrderStatus);
app.delete("/api/orders/:orderNumber", CRUD_operations.deleteOrder);

// 404 for undefined requests
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
