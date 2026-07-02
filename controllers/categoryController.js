const Category = require("../models/category");
const slugify = require("slugify");

// ==========================
// Create Category
// ==========================
const createCategory = async (req, res) => {
  try {
    console.log(req.user);
    const {
      name,
      description,
      parentCategory,
      displayOrder,
      isFeatured,
    } = req.body;

    // Validate Input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    // Generate Slug
    const slug = slugify(name, {
      lower: true,
      strict: true,
    });

    // Check Duplicate
    const existingCategory = await Category.findOne({ slug });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists.",
      });
    }

    // Create Category
    const category = await Category.create({
      name,
      slug,
      description,
      parentCategory: parentCategory || null,
      displayOrder: displayOrder || 0,
      isFeatured: isFeatured || false,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: category,
    });

  } catch (error) {
    console.error("Create Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ==========================
// Get All Categories
// ==========================
const getAllCategories = async (req, res) => {
  try {

    const categories = await Category.find({ isActive: true })
      .populate("parentCategory", "name slug")
      .populate("createdBy", "storeName")
      .sort({
        displayOrder: 1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });

  } catch (error) {
    console.error("Get Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};
// ==========================
// Get Category By ID
// ==========================
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id)
      .populate("parentCategory", "name slug")
      .populate("createdBy", "storeName");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });

  } catch (error) {
    console.error("Get Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ==========================
// Update Category
// ==========================
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      parentCategory,
      displayOrder,
      isFeatured,
      isActive,
    } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    // If name changes, regenerate slug
    if (name && name !== category.name) {

      const slug = slugify(name, {
        lower: true,
        strict: true,
      });

      const existingCategory = await Category.findOne({
        slug,
        _id: { $ne: id },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists.",
        });
      }

      category.name = name;
      category.slug = slug;
    }

    if (description !== undefined)
      category.description = description;

    if (parentCategory !== undefined)
      category.parentCategory = parentCategory;

    if (displayOrder !== undefined)
      category.displayOrder = displayOrder;

    if (isFeatured !== undefined)
      category.isFeatured = isFeatured;

    if (isActive !== undefined)
      category.isActive = isActive;

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: category,
    });

  } catch (error) {
    console.error("Update Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory
};