const Joi = require("joi");
const { deleteFile } = require("../utils/file");
const CustomError = require("../utils/error");
const response = require("../utils/response");
const Category = require("../models/Category");

const categorySchema = Joi.object({
  name: Joi.string().required(),
  imageUrl: Joi.string().uri().optional(),
});

exports.createCategory = async (req, res, next) => {
  let imagePath;
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    if (req.file) {
      imagePath = req.file.path;
      value.imageUrl = imagePath;
    }

    const newCategory = await Category.create(value);

    res
      .status(201)
      .json(response(201, true, "Category created successfully", newCategory));
  } catch (error) {
    if (imagePath) await deleteFile(imagePath);
    console.log(`Error in createCategory: ${error.message}`);
    next(error);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();

    if (!categories.length) {
      throw new CustomError("No categories found", 404);
    }

    res
      .status(200)
      .json(
        response(200, true, "Categories retrieved successfully", categories)
      );
  } catch (error) {
    console.log(`Error in getAllCategories: ${error.message}`);
    next(error);
  }
};

exports.getPaginatedCategories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, query = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const categories = await Category.find({
      name: { $regex: query, $options: "i" },
    })
      .skip(skip)
      .limit(Number(limit))
      .sort({ name: "asc" });

    const totalCategories = await Category.countDocuments({
      name: { $regex: query, $options: "i" },
    });

    if (!categories.length) {
      throw new CustomError("No categories found", 404);
    }

    res.status(200).json(
      response(200, true, "Categories retrieved successfully", {
        data: categories,
        totalPages: Math.ceil(totalCategories / Number(limit)),
        currentPage: Number(page),
        totalCategories,
      })
    );
  } catch (error) {
    console.log(`Error in getPaginatedCategories: ${error.message}`);
    next(error);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      throw new CustomError("Category not found", 404);
    }

    res
      .status(200)
      .json(response(200, true, "Category found successfully", category));
  } catch (error) {
    console.log(`Error in getCategoryById: ${error.message}`);
    next(error);
  }
};

exports.updateCategoryById = async (req, res, next) => {
  let imagePath;
  try {
    const { id } = req.params;
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      throw new CustomError("Category not found", 404);
    }

    if (req.file) {
      imagePath = req.file.path;
      value.imageUrl = imagePath;
      if (existingCategory.imageUrl) {
        await deleteFile(existingCategory.imageUrl);
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, value, {
      new: true,
    });

    res
      .status(200)
      .json(
        response(200, true, "Category updated successfully", updatedCategory)
      );
  } catch (error) {
    if (imagePath) await deleteFile(imagePath);
    console.log(`Error in updateCategoryById: ${error.message}`);
    next(error);
  }
};

exports.deleteCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      throw new CustomError("Category not found", 404);
    }

    if (category.imageUrl) {
      await deleteFile(category.imageUrl);
    }

    await Category.findByIdAndDelete(id);
    res.status(200).json(response(200, true, "Category deleted successfully"));
  } catch (error) {
    console.log(`Error in deleteCategoryById: ${error.message}`);
    next(error);
  }
};
