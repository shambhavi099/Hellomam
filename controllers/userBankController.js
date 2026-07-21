const UserBank = require("../models/userBankModel");
//const roleMiddleware = require("../middlewares/roleMiddleware");

const createUserBank = async (req, res) => {
  try {
    const {
      bankName,
      accountHolderName,
      accountNumber,
      ifscCode,
      branchName,
      accountType,
      isPrimary,
    } = req.body;

    if (
      !bankName ||
      !accountHolderName ||
      !accountNumber ||
      !ifscCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
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
       { customer: req.user._id },
        {
          isPrimary: false,
        }
      );
    }

   const userBank = await UserBank.create({
      customer: req.user._id,
      bankName,
      accountHolderName,
      accountNumber,
      ifscCode: ifscCode.toUpperCase(),
      branchName,
      accountType,
      isPrimary,
    });

      const result = await UserBank.findById(userBank._id)
      .populate("customer", "firstName lastName email");

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

const getUserBanks = async (req, res) => {
  try {
    console.log("REQ USER =>", req.user);
console.log("AUTH HEADER =>", req.headers.authorization);
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
      customer: req.user._id,
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
      .populate("customer", "firstName lastName email phone")
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

const getUserBankById = async (req, res) => {
  try {
    const userBank = await UserBank.findOne({
      _id: req.params.id,
      customer: req.user._id,
    })
    .populate("customer", "firstName lastName email phone")

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

const updateUserBank = async (req, res) => {
  try {
    const { id } = req.params;

    const userBank = await UserBank.findOne({
      _id: id,
      customer: req.user._id,
    });

    if (!userBank) {
      return res.status(404).json({
        success: false,
        message: "User bank not found.",
      });
    }

    const {
      bankName,
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

    if (isPrimary === true) {
      await UserBank.updateMany(
        {
          customer: req.user._id,
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

      if (bankName) {
  userBank.bankName = bankName;
}

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
      .populate("customer", "firstName lastName email");

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

const deleteUserBank = async (req, res) => {
  try {
    const userBank = await UserBank.findOne({
      _id: req.params.id,
      customer: req.user._id,
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

const updateUserBankStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const userBank = await UserBank.findOne({
      _id: req.params.id,
      customer: req.user._id,
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

const makePrimaryBank = async (req, res) => {
  try {
    const userBank = await UserBank.findOne({
      _id: req.params.id,
      customer: req.user._id,
    });

    if (!userBank) {
      return res.status(404).json({
        success: false,
        message: "User bank not found.",
      });
    }

    await UserBank.updateMany(
      {
        customer: req.user._id,
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

const getCustomerBankDetails = async (req, res) => {
   const bank = await UserBank.findOne({
      customer: req.params.customerId,
   }).populate("customer","firstName lastName email");

   if (!bank) {
      return res.status(404).json({
         success:false,
         message:"Bank details not found."
      });
   }

   res.status(200).json({
      success:true,
      bank,
   });
};

const removeCustomerBankFromSeller = async (req, res) => {
  try {
    const userBank = await UserBank.findById(req.params.id);

    if (!userBank) {
      return res.status(404).json({
        success: false,
        message: "User bank not found.",
      });
    }

    // Hide from this seller's dashboard only
    if (!userBank.hiddenForSellers.includes(req.user._id)) {
      userBank.hiddenForSellers.push(req.user._id);
      await userBank.save();
    }

    return res.status(200).json({
      success: true,
      message: "User bank removed from seller dashboard.",
    });

  } catch (error) {
    console.error("Remove Customer Bank:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllUserBanks = async (req, res) => {
  try {
    const userBanks = await UserBank.find()
      .populate("customer", "firstName lastName email mobileNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      userBanks,
    });

  } catch (error) {
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
  getCustomerBankDetails,
  removeCustomerBankFromSeller,
  getAllUserBanks,
};