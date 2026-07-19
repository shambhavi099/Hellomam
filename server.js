const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const productRoutes = require("./routes/productRoutes.js");
const sellerRoutes = require("./routes/sellerRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const bulkUploadRoutes = require("./routes/bulkUploadRoutes");
const bankRoutes = require("./routes/bankRoutes");
const userBankRoutes = require("./routes/userBankRoutes");
const vendorPaymentRoutes = require("./routes/vendorPaymentRoutes");
const vendorCommissionRoutes = require("./routes/vendorCommissionRoutes");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "E-Commerce Backend is running" });
});

console.log("EMAIL:", process.env.EMAIL_USER);


app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/bulk-upload", bulkUploadRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/user-banks", userBankRoutes);
app.use("/api/vendor-payments", vendorPaymentRoutes);
app.use("/api/vendor-commissions", vendorCommissionRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});