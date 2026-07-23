const jwt = require("jsonwebtoken");
const { getAuth } = require("@clerk/express");

const Seller = require("../models/sellersModel");
const Customer = require("../models/customers");

const authMiddleware = async (req, res, next) => {
  try {
    console.log("AUTH MIDDLEWARE HIT");
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    
    // Customer JWT sirf customer routes ke liye use hoga.
    // Seller routes me Clerk auth hi use hoga.
    if (req.originalUrl.startsWith("/api/customer")) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const customer = await Customer.findById(decoded.id);

        if (!customer) {
          return res.status(401).json({
            success: false,
            message: "Customer not found.",
          });
        }

        customer.role = "customer";
        req.user = customer;

        return next();
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid customer token.",
        });
      }
    }

    const clerkUserId = token;

      console.log("Clerk User ID:", clerkUserId);

      const seller = await Seller.findOne({
        clerkUserId,
      });

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller not found.",
        });
      }

    seller.role = "seller";
req.user = seller;

console.log("Seller Found:", req.user);

return next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = authMiddleware;