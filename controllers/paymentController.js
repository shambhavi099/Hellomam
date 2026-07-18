const Payment = require("../models/Payment");
const Order = require("../models/order");


// @desc Process demo payment
// @route POST /api/payments/process
// @access Customer

const processPayment = async (req, res) => {
  try {
    const {
      orderId,
      paymentMethod,
    } = req.body;


    const order = await Order.findById(orderId);
console.log("========== PAYMENT DEBUG ==========");
console.log("Request Body:", req.body);
console.log("User ID:", req.user.id);

console.log("Order Found:", !!order);

if (order) {
  console.log("Order ID:", order._id.toString());
  console.log("Order Customer:", order.customer);
  console.log("Order Customer ID:", order.customer?.customerId?.toString());
  console.log("Payment Status:", order.paymentStatus);
}
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
console.log(
  "Match:",
  order.customer.customerId.toString() === req.user.id
);

    if (
        order.customer.customerId.toString() !== req.user.id
        ) {
        return res.status(403).json({
            success: false,
            message: "Not authorized",
        });
    }


    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order already paid",
      });
    }


    // demo gateway simulation
    const isSuccess = Math.random() > 0.1;


    const payment = await Payment.create({
      order: order._id,
      customer: req.user.id,
      amount: order.pricing.total,
      paymentMethod,

      transactionId:
        "TXN-" + Date.now(),

      status: isSuccess
        ? "success"
        : "failed",

      paidAt: isSuccess
        ? new Date()
        : null,
    });



    order.payment = payment._id;

    order.paymentStatus = isSuccess
      ? "paid"
      : "failed";


    if (isSuccess) {
     order.orderStatus = "CONFIRMED";
    }


    await order.save();


    res.status(200).json({
      success: true,
      message: isSuccess
        ? "Payment successful"
        : "Payment failed",

      payment,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


//route GET /api/payments/:id

const getPaymentDetails = async (req, res) => {

  try {

    const payment =
      await Payment.findById(req.params.id)
        .populate("order");


    if (!payment) {
      return res.status(404).json({
        success:false,
        message:"Payment not found",
      });
    }


    res.status(200).json({
      success:true,
      payment,
    });


  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }

};




module.exports = {
  processPayment,
  getPaymentDetails,
};