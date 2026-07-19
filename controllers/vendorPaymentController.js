const VendorPayment = require("../models/vendorPaymentModel");
const Order = require("../models/order");

const createVendorPayment = async (req, res) => {
  try {
    const {
      order,
      grossAmount,
      commission,
      gst,
      paymentMode,
      transactionId,
      remarks,
    } = req.body;

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order is required.",
      });
    }

    const orderExists = await Order.findById(order);

    if (!orderExists) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const existingPayment = await VendorPayment.findOne({
      order,
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already exists for this order.",
      });
    }

    const netAmount =
      Number(grossAmount || 0) -
      Number(commission || 0) -
      Number(gst || 0);

    const payment = await VendorPayment.create({
      seller: req.user.id,
      order,
      grossAmount,
      commission,
      gst,
      netAmount,
      paymentMode,
      transactionId,
      remarks,
    });

    const result = await VendorPayment.findById(payment._id)
      .populate("seller", "firstName lastName email")
      .populate("order");

    res.status(201).json({
      success: true,
      message: "Vendor payment created successfully.",
      payment: result,
    });
  } catch (error) {
    console.error("Create Vendor Payment:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getVendorPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      paymentStatus,
      paymentMode,
      search,
      fromDate,
      toDate,
      sort,
    } = req.query;

    const query = {
      seller: req.user.id,
    };

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (paymentMode) {
      query.paymentMode = paymentMode;
    }

    if (search) {
      query.$or = [
        {
          paymentId: {
            $regex: search,
            $options: "i",
          },
        },
        {
          transactionId: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (fromDate || toDate) {
      query.createdAt = {};

      if (fromDate) {
        query.createdAt.$gte = new Date(fromDate);
      }

      if (toDate) {
        query.createdAt.$lte = new Date(toDate);
      }
    }

    let sortOption = {
      createdAt: -1,
    };

    switch (sort) {
      case "amount":
        sortOption = {
          netAmount: 1,
        };
        break;

      case "-amount":
        sortOption = {
          netAmount: -1,
        };
        break;

      default:
        sortOption = {
          createdAt: -1,
        };
    }

    const total = await VendorPayment.countDocuments(query);

    const payments = await VendorPayment.find(query)
      .populate("seller", "firstName lastName email")
      .populate("order")
      .sort(sortOption)
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      payments,
    });
  } catch (error) {
    console.error("Get Vendor Payments:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getVendorPaymentById = async (req, res) => {
  try {
    const payment = await VendorPayment.findOne({
      _id: req.params.id,
      seller: req.user.id,
    })
      .populate("seller", "firstName lastName email")
      .populate("order");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Vendor payment not found.",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get Vendor Payment:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateVendorPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await VendorPayment.findOne({
      _id: id,
      seller: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Vendor payment not found.",
      });
    }

    const {
      grossAmount,
      commission,
      gst,
      paymentMode,
      paymentStatus,
      transactionId,
      remarks,
    } = req.body;

    if (grossAmount !== undefined)
      payment.grossAmount = grossAmount;

    if (commission !== undefined)
      payment.commission = commission;

    if (gst !== undefined)
      payment.gst = gst;

    payment.netAmount =
      Number(payment.grossAmount) -
      Number(payment.commission) -
      Number(payment.gst);

    if (paymentMode)
      payment.paymentMode = paymentMode;

    if (paymentStatus)
      payment.paymentStatus = paymentStatus;

    if (transactionId)
      payment.transactionId = transactionId;

    if (remarks)
      payment.remarks = remarks;

    await payment.save();

    const updatedPayment = await VendorPayment.findById(payment._id)
      .populate("seller", "firstName lastName email")
      .populate("order");

    res.status(200).json({
      success: true,
      message: "Vendor payment updated successfully.",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Update Vendor Payment:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteVendorPayment = async (req, res) => {
  try {
    const payment = await VendorPayment.findOne({
      _id: req.params.id,
      seller: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Vendor payment not found.",
      });
    }

    await payment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Vendor payment deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Vendor Payment:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateVendorPaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const payment = await VendorPayment.findOne({
      _id: req.params.id,
      seller: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Vendor payment not found.",
      });
    }

    payment.paymentStatus = paymentStatus;

    if (paymentStatus === "Paid") {
      payment.paidAt = new Date();
    }

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully.",
      payment,
    });
  } catch (error) {
    console.error("Update Payment Status:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createVendorPayment,
  getVendorPayments,
  getVendorPaymentById,
  updateVendorPayment,
  deleteVendorPayment,
  updateVendorPaymentStatus,
};