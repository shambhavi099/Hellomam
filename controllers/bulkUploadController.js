const ExcelJS = require("exceljs");
const slugify = require("slugify");

const Product = require("../models/productModel");
const Category = require("../models/category");
const UploadHistory = require("../models/UploadHistory");

exports.bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file.",
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty.",
      });
    }

    const headers = [];

    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber] = String(cell.value).trim();
    });

    const rows = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowData = {};

      row.eachCell((cell, colNumber) => {
        rowData[headers[colNumber]] = cell.value ?? "";
      });

      rows.push(rowData);
    });

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty.",
      });
    }

    let products = [];
    let successCount = 0;
    let failedCount = 0;
    let failedRows = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];

      try {
        const {
          Name,
          Description,
          ShortDescription,
          Category,
          Brand,
          Price,
          DiscountPrice,
          MRP,
          CostPrice,
          GST,
          TaxType,
          Stock,
          SKU,
          Barcode,
          Warehouse,
          MinimumStockAlert,
        } = row;

        if (!Name || !Category || !Price || !SKU) {
          failedCount++;

          failedRows.push({
            row: index + 2,
            product: Name || "",
            reason: "Required fields are missing.",
          });

          continue;
        }

        const category = await Category.findOne({
          name: {
            $regex: new RegExp(`^${Category.trim()}$`, "i"),
          },
          isActive: true,
        });

        if (!category) {
          failedCount++;

          failedRows.push({
            row: index + 2,
            product: Name,
            reason: `Category "${Category}" not found.`,
          });

          continue;
        }

        const existingProduct = await Product.findOne({
          sku: SKU,
        });

        if (existingProduct) {
          failedCount++;

          failedRows.push({
            row: index + 2,
            product: Name,
            reason: `SKU "${SKU}" already exists.`,
          });

          continue;
        }

        products.push({
          name: Name,
          slug: slugify(Name, {
            lower: true,
            strict: true,
          }),
          description: Description,
          shortDescription: ShortDescription,
          category: category._id,
          brand: Brand,
          seller: req.user.id,
          price: Number(Price),
          discountPrice: Number(DiscountPrice) || 0,
          mrp: Number(MRP) || 0,
          costPrice: Number(CostPrice) || 0,
          gst: Number(GST) || 0,
          taxType: TaxType || "Inclusive",
          stock: Number(Stock) || 0,
          sku: SKU,
          barcode: Barcode,
          warehouse: Warehouse,
          minimumStockAlert: Number(MinimumStockAlert) || 5,
          stockStatus: Number(Stock) > 0 ? "In Stock" : "Out of Stock",
        });

        successCount++;
      } catch (error) {
        failedCount++;

        failedRows.push({
          row: index + 2,
          product: row.Name || "",
          reason: error.message,
        });
      }
    }

    if (products.length) {
      await Product.insertMany(products);
    }

    let status = "Success";

    if (failedCount > 0 && successCount > 0) {
      status = "Partial";
    } else if (failedCount === rows.length) {
      status = "Failed";
    }

    await UploadHistory.create({
      seller: req.user.id,
      fileName: req.file.originalname,
      totalProducts: rows.length,
      successCount,
      failedCount,
      status,
      failedRows,
    });

    return res.status(201).json({
      success: true,
      message: `${successCount} products uploaded successfully.`,
      data: {
        totalProducts: rows.length,
        successCount,
        failedCount,
        status,
        failedRows,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Bulk upload failed.",
      error: error.message,
    });
  }
};

exports.getUploadHistory = async (req, res) => {
  try {
    const history = await UploadHistory.find({
      seller: req.user.id,
    })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch upload history.",
      error: error.message,
    });
  }
};

exports.downloadSampleFile = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Products");

    worksheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Description", key: "description", width: 40 },
      { header: "ShortDescription", key: "shortDescription", width: 30 },
      { header: "Category", key: "category", width: 25 },
      { header: "Brand", key: "brand", width: 20 },
      { header: "Price", key: "price", width: 15 },
      { header: "DiscountPrice", key: "discountPrice", width: 18 },
      { header: "MRP", key: "mrp", width: 15 },
      { header: "CostPrice", key: "costPrice", width: 15 },
      { header: "GST", key: "gst", width: 10 },
      { header: "TaxType", key: "taxType", width: 15 },
      { header: "Stock", key: "stock", width: 15 },
      { header: "SKU", key: "sku", width: 20 },
      { header: "Barcode", key: "barcode", width: 20 },
      { header: "Warehouse", key: "warehouse", width: 20 },
      { header: "MinimumStockAlert", key: "minimumStockAlert", width: 20 },
    ];

    worksheet.addRow({
      name: "Apple iPhone 16",
      description: "Latest Apple smartphone",
      shortDescription: "iPhone 16",
      category: "Mobiles",
      brand: "Apple",
      price: 79999,
      discountPrice: 74999,
      mrp: 79999,
      costPrice: 70000,
      gst: 18,
      taxType: "Inclusive",
      stock: 20,
      sku: "APL-IP16-001",
      barcode: "1234567890123",
      warehouse: "Warehouse A",
      minimumStockAlert: 5,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="sample-products.xlsx"'
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to download sample file.",
      error: error.message,
    });
  }
};