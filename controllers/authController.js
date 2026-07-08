const Customer = require("../models/customers");
const Seller = require("../models/sellersModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign(
    {
      id,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ==========================
// Login
// ==========================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required.",
      });
    }

    // 1. Try Seller
    let user = await Seller.findOne({ email });
    let role = "seller";

    // 2. If not found, try Customer
    if (!user) {
      user = await Customer.findOne({ email });
      role = "customer";
    }

    // 3. User not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 4. Seller active check
    if (role === "seller" && !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    // 5. Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 6. Generate token
    const token = generateToken(user._id, role);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role,
        businessName: role === "seller" ? user.businessName : undefined,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;


    let user = await Seller.findOne({ email });


    if (!user) {
      user = await Customer.findOne({ email });
    }


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }


    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");


    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");


    user.resetPasswordExpire =
      Date.now() + 10 * 60 * 1000;


    await user.save();


    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;


    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message: `Reset your password here:\n\n${resetUrl}\n\nLink expires in 10 minutes.`,
    });


    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });


  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// Reset Password
const resetPassword = async (req, res) => {

  try {

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");



    let user = await Seller.findOne({

      resetPasswordToken,

      resetPasswordExpire: {
        $gt: Date.now(),
      },

    });



    if (!user) {

      user = await Customer.findOne({

        resetPasswordToken,

        resetPasswordExpire: {
          $gt: Date.now(),
        },

      });

    }



    if (!user) {

      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });

    }



    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
      req.body.password,
      salt
    );



    user.resetPasswordToken = undefined;

    user.resetPasswordExpire = undefined;



    await user.save();



    res.status(200).json({

      success: true,

      message: "Password reset successful",

    });



  } catch (error) {

    res.status(500).json({

      success:false,

      message:error.message,

    });

  }
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
};