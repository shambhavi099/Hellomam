const Customer = require("../models/customers");
const bcrypt = require("bcryptjs");

const registerCustomer = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      mobileNumber,
      address,
    } = req.body;

    // Check required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !mobileNumber ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // Check existing customer
    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Customer
    const customer = await Customer.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      mobileNumber,
      address,
    });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully.",
      customer: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error("Register Customer:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select("-password");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Get Profile:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const {
      firstName,
      lastName,
      mobileNumber,
      address,
    } = req.body;

    if (firstName) customer.firstName = firstName;
    if (lastName) customer.lastName = lastName;
    if (mobileNumber) customer.mobileNumber = mobileNumber;
    if (address) customer.address = address;

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      customer,
    });
  } catch (error) {
    console.error("Update Profile:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    await Customer.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: "Customer account deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Customer:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      customer.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    customer.password = await bcrypt.hash(newPassword, 10);

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change Password:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  registerCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  deleteCustomer,
  changePassword
};