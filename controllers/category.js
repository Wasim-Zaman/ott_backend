const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Joi = require("joi");
const { deleteFile } = require("../utils/file");

const CustomError = require("../utils/error");
const response = require("../utils/response");

// Joi validation schema
const categorySchema = Joi.object({
  name: Joi.string().required(),
  imageUrl: Joi.string().uri().optional(),
});

// Create a new category
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

    const newCategory = await prisma.category.create({
      data: value,
    });

    res
      .status(201)
      .json(response(201, true, "Category created successfully", newCategory));
  } catch (error) {
    if (imagePath) await deleteFile(imagePath);
    console.log(`Error in createCategory: ${error.message}`);
    next(error);
  }
};

// Get all categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany();

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

// Get paginated categories
exports.getPaginatedCategories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, query = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const categories = await prisma.category.findMany({
      where: {
        name: { contains: query },
      },
      skip,
      take: Number(limit),
      orderBy: {
        name: "asc",
      },
    });

    const totalCategories = await prisma.category.count({
      where: {
        name: { contains: query },
      },
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

// Get category by ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({ where: { id } });

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

// Update category by ID
exports.updateCategoryById = async (req, res, next) => {
  let imagePath;
  try {
    const { id } = req.params;
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });
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

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: value,
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

// Delete category by ID
exports.deleteCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new CustomError("Category not found", 404);
    }

    if (category.imageUrl) {
      await deleteFile(category.imageUrl);
    }

    await prisma.category.delete({ where: { id } });
    res.status(200).json(response(200, true, "Category deleted successfully"));
  } catch (error) {
    console.log(`Error in deleteCategoryById: ${error.message}`);
    next(error);
  }
};
