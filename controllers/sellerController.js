const Seller = require("../models/sellersModel");
const Product = require("../models/productModel");
const bcrypt = require("bcryptjs");


const registerSeller = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      businessName,
      businessType,
      gstNumber,
      panNumber,
      address,
      bankDetails,
    } = req.body;

    // Check required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phone ||
      !businessName
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // Check existing seller
    const existingSeller = await Seller.findOne({ email });

    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Seller
    const seller = await Seller.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      businessName,
      businessType,
      gstNumber,
      panNumber,
      address,
      bankDetails,
    });

    res.status(201).json({
      success: true,
      message: "Seller registered successfully.",
      seller: {
        id: seller._id,
        firstName: seller.firstName,
        lastName: seller.lastName,
        email: seller.email,
        businessName: seller.businessName,
      },
    });
  } catch (error) {
    console.error("Register Seller:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// Get Seller Profile
// ======================================
const getProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.id).select("-password");

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found.",
      });
    }

    res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    console.error("Get Seller Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ======================================
// Update Seller Profile
// ======================================
const updateProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found.",
      });
    }

    seller.firstName = req.body.firstName || seller.firstName;
    seller.lastName = req.body.lastName || seller.lastName;
    seller.phone = req.body.phone || seller.phone;

    seller.businessName =
      req.body.businessName || seller.businessName;

    seller.businessType =
      req.body.businessType || seller.businessType;

    seller.gstNumber =
      req.body.gstNumber || seller.gstNumber;

    seller.panNumber =
      req.body.panNumber || seller.panNumber;

    if (req.body.address) {
      seller.address = {
        ...seller.address,
        ...req.body.address,
      };
    }

    if (req.body.bankDetails) {
      seller.bankDetails = {
        ...seller.bankDetails,
        ...req.body.bankDetails,
      };
    }

    await seller.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      seller,
    });
  } catch (error) {
    console.error("Update Seller Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ======================================
// Change Password
// ======================================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const seller = await Seller.findById(req.user.id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found.",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      seller.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const salt = await bcrypt.genSalt(10);

    seller.password = await bcrypt.hash(
      newPassword,
      salt
    );

    await seller.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ======================================
// Dashboard
// ======================================
const dashboard = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const totalProducts = await Product.countDocuments({
      seller: sellerId,
    });

    const activeProducts = await Product.countDocuments({
      seller: sellerId,
      isActive: true,
    });

    const inactiveProducts = await Product.countDocuments({
      seller: sellerId,
      isActive: false,
    });

    const totalStock = await Product.aggregate([
      {
        $match: {
          seller: seller._id,
        },
      },
      {
        $group: {
          _id: null,
          stock: {
            $sum: "$stock",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      dashboard: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        totalStock:
          totalStock.length > 0
            ? totalStock[0].stock
            : 0,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ======================================
// Soft Delete Seller
// ======================================
const deactivateSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found.",
      });
    }

    seller.isActive = false;

    await seller.save();

    res.status(200).json({
      success: true,
      message: "Seller account deactivated.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

module.exports = {
  registerSeller,
  getProfile,
  updateProfile,
  changePassword,
  dashboard,
  deactivateSeller,
};