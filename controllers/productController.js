const Product = require("../models/productModel");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const slugify = require("slugify");

// CREATE PRODUCT
 const createProduct = async (req, res) => {
  try {
    const images = [];

    for (const file of req.files) {
    const result = await uploadToCloudinary(file.buffer);

      images.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    const thumbnail = images.length > 0 ? images[0] : {};

    const {
      name,
      description,
      shortDescription,
      category,
      brand,
      price,
      discountPrice,
      stock,
      sku,
      specifications,
      tags,
      isFeatured,
    } = req.body;

    const specificationsData = specifications
      ? JSON.parse(specifications)
      : {};

    const tagsData = tags ? JSON.parse(tags) : [];

    const featured = isFeatured === "true";

    const existing = await Product.findOne({ sku });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists",
      });
    }

    const slug = slugify(name, { lower: true });

    const existingSlug = await Product.findOne({ slug });

    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: "Product with this name already exists",
      });
    }

    const product = await Product.create({
      name,
      slug: slugify(name, { lower: true }),
      description,
      shortDescription,
      category: category.trim(),
      brand,
      seller: req.user.id,
      price,
      discountPrice,
      stock,
      sku,
      images,
      thumbnail,
     specifications: specificationsData,
     tags: tagsData,
     isFeatured: featured,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL PRODUCTS
 const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      subCategory,
      brand,
      minPrice,
      maxPrice,
      featured,
      sort,
    } = req.query;

    const query = {
      isActive: true,
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    if (category) query.category = category;

    if (subCategory) query.subCategory = subCategory;

    if (brand) query.brand = brand;

    if (featured === "true") query.isFeatured = true;

    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) query.price.$gte = Number(minPrice);

      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };

    switch (sort) {
      case "price":
        sortOption = { price: 1 };
        break;

      case "-price":
        sortOption = { price: -1 };
        break;

      case "name":
        sortOption = { name: 1 };
        break;

      case "-createdAt":
        sortOption = { createdAt: -1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE PRODUCT
  const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
        _id: req.params.id,
        isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE PRODUCT
  const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      seller: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updateData = { ...req.body };

    // Update slug if name changes
    if (updateData.name) {
      updateData.slug = slugify(updateData.name, { lower: true });
    }

    // Check duplicate SKU
    if (updateData.sku) {
      const existingSku = await Product.findOne({
        sku: updateData.sku,
        _id: { $ne: id },
      });

      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: "SKU already exists",
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE PRODUCT
  const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      seller: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// TOGGLE PRODUCT STATUS
  const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const product = await Product.findOne({
      _id: id,
      seller: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = isActive;

    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET FEATURED PRODUCTS
  const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isFeatured: true,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET RELATED PRODUCTS
  const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const currentProduct = await Product.findById(id);

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const products = await Product.find({
      category: currentProduct.category,
      _id: { $ne: id },
      isActive: true,
    }).limit(8);

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE STOCK
  const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const product = await Product.findOne({
      _id: id,
      seller: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.stock = stock;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getFeaturedProducts,
  getRelatedProducts,
  getMyProducts,
  updateStock,
};