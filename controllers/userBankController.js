const UserBank = require("../models/userBankModel");
const Bank = require("../models/bankModel");

// ======================================
// CREATE USER BANK
// ======================================

const createUserBank = async (req, res) => {
  try {
    const {
      bank,
      accountHolderName,
      accountNumber,
      ifscCode,
      branchName,
      accountType,
      isPrimary,
    } = req.body;

    if (
      !bank ||
      !accountHolderName ||
      !accountNumber ||
      !ifscCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const bankExists = await Bank.findById(bank);

    if (!bankExists) {
      return res.status(404).json({
        success: false,
        message: "Bank not found.",
      });
    }

    const accountExists = await UserBank.findOne({
      accountNumber,
    });

    if (accountExists) {
      return res.status(400).json({
        success: false,
        message: "Account number already exists.",
      });
    }

    if (isPrimary) {
      await UserBank.updateMany(
        { seller: req.user.id },
        {
          isPrimary: false,
        }
      );
    }

    const userBank = await UserBank.create({
      seller: req.user.id,
      bank,
      accountHolderName,
      accountNumber,
      ifscCode: ifscCode.toUpperCase(),
      branchName,
      accountType,
      isPrimary,
    });

    const result = await UserBank.findById(userBank._id)
      .populate("seller", "firstName lastName email")
      .populate("bank", "bankName bankId");

    res.status(201).json({
      success: true,
      message: "User bank added successfully.",
      userBank: result,
    });
  } catch (error) {
    console.error("Create User Bank:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// GET USER BANKS
// ======================================

const getUserBanks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      accountType,
      status,
      isPrimary,
      fromDate,
      toDate,
      sort,
    } = req.query;

    const query = {
      seller: req.user.id,
    };

    if (search) {
      query.$or = [
        {
          accountHolderName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          accountNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          ifscCode: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (accountType) {
      query.accountType = accountType;
    }

    if (status) {
      query.status = status;
    }

    if (isPrimary !== undefined) {
      query.isPrimary = isPrimary === "true";
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
      case "name":
        sortOption = {
          accountHolderName: 1,
        };
        break;

      case "-name":
        sortOption = {
          accountHolderName: -1,
        };
        break;

      case "createdAt":
        sortOption = {
          createdAt: 1,
        };
        break;

      default:
        sortOption = {
          createdAt: -1,
        };
    }

    const total = await UserBank.countDocuments(query);

    const userBanks = await UserBank.find(query)
      .populate("bank", "bankName bankId")
      .populate(
        "seller",
        "firstName lastName email phone"
      )
      .sort(sortOption)
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      userBanks,
    });
  } catch (error) {
    console.error("Get User Banks:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// GET SINGLE USER BANK
// ======================================

const getUserBankById = async (req, res) => {
  try {
    const userBank = await UserBank.findOne({
      _id: req.params.id,
      seller: req.user.id,
    })
      .populate("seller", "firstName lastName email")
      .populate("bank");

    if (!userBank) {
      return res.status(404).json({
        success: false,
        message: "User bank not found.",
      });
    }

    res.status(200).json({
      success: true,
      userBank,
    });
  } catch (error) {
    console.error("Get User Bank:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ======================================
// UPDATE USER BANK
// ======================================

const updateUserBank = async (req, res) => {
  try {
    const { id } = req.params;

    const userBank = await UserBank.findOne({
      _id: id,
      seller: req.user.id,
    });

    if (!userBank) {
      return res.status(404).json({
        success: false,
        message: "User bank not found.",
      });
    }

    const {
      bank,
      accountHolderName,
      accountNumber,
      ifscCode,
      branchName,
      accountType,
      isPrimary,
      status,
    } = req.body;

    if (accountNumber) {
      const existing = await UserBank.findOne({
        accountNumber,
        _id: { $ne: id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Account number already exists.",
        });
      }
    }

    if (bank) {
      const bankExists = await Bank.findById(bank);

      if (!bankExists) {
        return res.status(404).json({
          success: false,
          message: "Bank not found.",
        });
      }

      userBank.bank = bank;
    }

    if (isPrimary === true) {
      await UserBank.updateMany(
        {
          seller: req.user.id,
          _id: { $ne: id },
        },
        {
          isPrimary: false,
        }
      );
    }

    userBank.accountHolderName =
      accountHolderName || userBank.accountHolderName;

    userBank.accountNumber =
      accountNumber || userBank.accountNumber;

    userBank.ifscCode = ifscCode
      ? ifscCode.toUpperCase()
      : userBank.ifscCode;

    userBank.branchName =
      branchName || userBank.branchName;

    userBank.accountType =
      accountType || userBank.accountType;

    if (typeof isPrimary !== "undefined") {
      userBank.isPrimary = isPrimary;
    }

    if (status) {
      userBank.status = status;
    }

    await userBank.save();

    const updated = await UserBank.findById(userBank._id)
      .populate("seller", "firstName lastName email")
      .populate("bank", "bankName bankId");

    res.status(200).json({
      success: true,
      message: "User bank updated successfully.",
      userBank: updated,
    });
  } catch (error) {
    console.error("Update User Bank:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// DELETE USER BANK
// ======================================

const deleteUserBank = async (req, res) => {
  try {
    const userBank = await UserBank.findOne({
      _id: req.params.id,
      seller: req.user.id,
    });

    if (!userBank) {
      return res.status(404).json({
        success: false,
        message: "User bank not found.",
      });
    }

    await userBank.deleteOne();

    res.status(200).json({
      success: true,
      message: "User bank deleted successfully.",
    });
  } catch (error) {
    console.error("Delete User Bank:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// UPDATE USER BANK STATUS
// ======================================

const updateUserBankStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const userBank = await UserBank.findOne({
      _id: req.params.id,
      seller: req.user.id,
    });

    if (!userBank) {
      return res.status(404).json({
        success: false,
        message: "User bank not found.",
      });
    }

    userBank.status = status;

    await userBank.save();

    res.status(200).json({
      success: true,
      message: `User bank ${
        status === "Active"
          ? "activated"
          : "deactivated"
      } successfully.`,
      userBank,
    });
  } catch (error) {
    console.error("Update User Bank Status:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// MAKE PRIMARY BANK
// ======================================

const makePrimaryBank = async (req, res) => {
  try {
    const userBank = await UserBank.findOne({
      _id: req.params.id,
      seller: req.user.id,
    });

    if (!userBank) {
      return res.status(404).json({
        success: false,
        message: "User bank not found.",
      });
    }

    await UserBank.updateMany(
      {
        seller: req.user.id,
      },
      {
        isPrimary: false,
      }
    );

    userBank.isPrimary = true;

    await userBank.save();

    res.status(200).json({
      success: true,
      message: "Primary bank updated successfully.",
      userBank,
    });
  } catch (error) {
    console.error("Make Primary Bank:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createUserBank,
  getUserBanks,
  getUserBankById,
  updateUserBank,
  deleteUserBank,
  updateUserBankStatus,
  makePrimaryBank,
};