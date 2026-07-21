const jwt = require("jsonwebtoken");
const { getAuth } = require("@clerk/express");

const Seller = require("../models/sellersModel");
const Customer = require("../models/customers");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // ==========================
    // Try Customer JWT first
    // ==========================

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const customer = await Customer.findById(decoded.id);

      if (customer) {
        req.user = customer;
        return next();
      }
    } catch (err) {
      // Ignore and try Clerk
    }

    // ==========================
    // Try Seller Clerk
    // ==========================

    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication.",
      });
    }

    const seller = await Seller.findOne({
      clerkUserId: userId,
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found.",
      });
    }

    req.user = seller;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = authMiddleware;