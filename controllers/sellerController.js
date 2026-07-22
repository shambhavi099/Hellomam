const Seller = require("../models/sellersModel");
const Product = require("../models/productModel");
const Order = require("../models/order");
const Customer = require("../models/customers");
const bcrypt = require("bcryptjs");


const registerSeller = async (req, res) => {
  try {
   const {
      clerkUserId,
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
      !clerkUserId ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !businessName
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // Check existing seller
    const existingCustomer = await Customer.findOne({ email });
    const existingSeller = await Seller.findOne({ email });

    if (existingCustomer || existingSeller) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    // Hash Password
   // const hashedPassword = await bcrypt.hash(password, 10);

    // Create Seller
    const seller = await Seller.create({
      clerkUserId,
      firstName,
      lastName,
      email,
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

const dashboard = async (req, res) => {
  try {
    const sellerId = req.user?._id ||"6a5a6fa5f1648f9241bcde14";

    const firstDayOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    const sevenMonthsAgo = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 6,
      1
    );

    const [
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      monthlyRevenue,
      monthlySales,
      salesChart,
    ] = await Promise.all([
      Product.countDocuments({
        seller: sellerId,
      }),

      Order.countDocuments({
        "items.seller": sellerId,
      }),

      Order.distinct("customer.customerId", {
        "items.seller": sellerId,
      }),

      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $unwind: "$items",
        },
        {
          $match: {
            "items.seller": sellerId,
          },
        },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: "$items.subtotal",
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: {
              $gte: firstDayOfMonth,
            },
          },
        },
        {
          $unwind: "$items",
        },
        {
          $match: {
            "items.seller": sellerId,
          },
        },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: "$items.subtotal",
            },
          },
        },
      ]),

      Order.countDocuments({
        "items.seller": sellerId,
        createdAt: {
          $gte: firstDayOfMonth,
        },
      }),

      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: {
              $gte: sevenMonthsAgo,
            },
          },
        },
        {
          $unwind: "$items",
        },
        {
          $match: {
            "items.seller": sellerId,
          },
        },
        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },
              month: {
                $month: "$createdAt",
              },
            },
            revenue: {
              $sum: "$items.subtotal",
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),
      Order.aggregate([
        {
          $unwind: "$items",
        },
        {
          $match: {
            "items.seller": sellerId,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$product",
        },
        {
          $lookup: {
            from: "categories",
            localField: "product.category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: "$category",
        },
        {
          $group: {
            _id: "$category.name",
            productsSold: {
              $sum: "$items.quantity",
            },
          },
        },
        {
          $sort: {
            productsSold: -1,
          },
        },
        {
          $limit: 5,
        },
      ]),
      Order.aggregate([
        {
          $unwind: "$items",
        },
        {
          $match: {
            "items.seller": sellerId,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$product",
        },
        {
          $lookup: {
            from: "categories",
            localField: "product.category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: "$category",
        },
        {
          $group: {
            _id: "$category.name",
            revenue: {
              $sum: "$items.subtotal",
            },
          },
        },
        {
          $sort: {
            revenue: -1,
          },
        },
        {
          $limit: 5,
        },
      ]),
      Order.aggregate([
    {
      $match: {
        "items.seller": sellerId,
      },
    },
    {
      $group: {
        _id: "$shippingAddress.city",
        customers: {
          $addToSet: "$customer.customerId",
        },
      },
    },
    {
      $project: {
        _id: 0,
        city: "$_id",
        customers: {
          $size: "$customers",
        },
      },
    },
    {
      $sort: {
        customers: -1,
      },
    },
  ])

    ]);

    const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
    ];

    const formattedSalesChart = salesChart.map((item) => ({
      month: monthNames[item._id.month - 1],
      revenue: item.revenue,
    }));

    res.status(200).json({
      success: true,
      dashboard: {
        totalProducts,
        totalOrders,
        totalUsers: totalUsers.length,
        totalRevenue:
          totalRevenue.length > 0
            ? totalRevenue[0].revenue
            : 0,
        monthlyRevenue:
          monthlyRevenue.length > 0
            ? monthlyRevenue[0].revenue
            : 0,
        monthlySales,
        salesChart: formattedSalesChart,
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

const getUserDetailsByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check Seller
    const seller = await Seller.findOne({ email }).select(
      "_id firstName lastName email clerkUserId"
    );

    if (seller) {
      return res.status(200).json({
        success: true,
        role: "seller",
        data: {
          userId: seller._id,
          clerkUserId: seller.clerkUserId,
          email: seller.email,
          firstName: seller.firstName,
          lastName: seller.lastName,
        },
      });
    }

    // Check Customer
    const customer = await Customer.findOne({ email }).select(
      "_id firstName lastName email"
    );

    if (customer) {
      return res.status(200).json({
        success: true,
        role: "customer",
        data: {
          userId: customer._id,
          clerkUserId: null,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
        },
      });
    }

    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
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
  getUserDetailsByEmail
};