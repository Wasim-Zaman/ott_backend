const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Joi = require('joi');

const CustomError = require('../utils/error');
const response = require('../utils/response');

// Update the Joi validation schema
const packageSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().positive().required(),
  discount: Joi.number().min(0).max(100).optional(),
  image: Joi.string().optional(),
  includes: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        items: Joi.array().items(Joi.string()).required(),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'Includes must be an array',
      'array.min': 'Includes must contain at least one item',
    }),
  faqs: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().required(),
        answer: Joi.string().required(),
      })
    )
    .optional()
    .messages({
      'array.base': 'FAQs must be an array',
    }),
  serviceId: Joi.string().required(),
});

// Create a new package
exports.createPackage = async (req, res, next) => {
  try {
    console.log('Raw request body:', req.body);
    console.log('Type of includes:', typeof req.body.includes);
    console.log('Includes value:', req.body.includes);
    console.log('Type of faqs:', typeof req.body.faqs);
    console.log('FAQs value:', req.body.faqs);

    // Parse includes if it's a string
    if (typeof req.body.includes === 'string') {
      try {
        req.body.includes = JSON.parse(req.body.includes);
      } catch (parseError) {
        console.error('Error parsing includes:', parseError);
        throw new CustomError('Invalid JSON format for includes', 400);
      }
    }

    // Parse faqs if it's a string
    if (typeof req.body.faqs === 'string') {
      try {
        req.body.faqs = JSON.parse(req.body.faqs);
      } catch (parseError) {
        console.error('Error parsing faqs:', parseError);
        throw new CustomError('Invalid JSON format for faqs', 400);
      }
    }

    // Ensure includes is an array
    if (!Array.isArray(req.body.includes)) {
      throw new CustomError('Includes must be an array', 400);
    }

    // Ensure faqs is an array if it exists
    if (req.body.faqs && !Array.isArray(req.body.faqs)) {
      throw new CustomError('FAQs must be an array', 400);
    }

    // Convert price and discount to numbers
    if (typeof req.body.price === 'string') {
      req.body.price = parseFloat(req.body.price);
    }
    if (typeof req.body.discount === 'string') {
      req.body.discount = parseFloat(req.body.discount);
    }

    const { error, value } = packageSchema.validate(req.body);
    if (error) {
      console.error('Validation error:', error.details);
      throw new CustomError(error.details[0].message, 400);
    }

    const { serviceId, ...packageData } = value;

    if (req.file) {
      packageData.image = req.file.path;
    }

    // Check if the service ID exists before creating the package
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      throw new CustomError('The specified service ID does not exist', 400);
    }

    const newPackage = await prisma.package.create({
      data: {
        ...packageData,
        serviceId,
      },
      include: { service: true },
    });

    res.status(201).json(response(201, true, 'Package created successfully', newPackage));
  } catch (error) {
    console.error(`Error in createPackage: ${error.message}`);
    next(error);
  }
};

// Get all packages with pagination
exports.getPackages = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, query = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const packages = await prisma.package.findMany({
      where: {
        OR: [{ name: { contains: query } }, { description: { contains: query } }],
      },
      skip,
      take: Number(limit),
      include: { service: true },
    });

    const totalPackages = await prisma.package.count({
      where: {
        OR: [{ name: { contains: query } }, { description: { contains: query } }],
      },
    });

    if (!packages.length) {
      throw new CustomError('No packages found', 404);
    }

    res.status(200).json(
      response(200, true, 'Packages retrieved successfully', {
        data: packages,
        totalPages: Math.ceil(totalPackages / Number(limit)),
        currentPage: Number(page),
        totalPackages,
      })
    );
  } catch (error) {
    console.log(`Error in getPackages: ${error.message}`);
    next(error);
  }
};

// Get package by ID
exports.getPackageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const package = await prisma.package.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!package) {
      throw new CustomError('Package not found', 404);
    }

    res.status(200).json(response(200, true, 'Package found successfully', package));
  } catch (error) {
    console.log(`Error in getPackageById: ${error.message}`);
    next(error);
  }
};

// Update package by ID
exports.updatePackageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = packageSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const { serviceId, ...packageData } = value;

    if (req.file) {
      packageData.image = req.file.path;
    }

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        ...packageData,
        serviceId,
      },
      include: { service: true },
    });

    res.status(200).json(response(200, true, 'Package updated successfully', updatedPackage));
  } catch (error) {
    console.log(`Error in updatePackageById: ${error.message}`);
    next(error);
  }
};

// Delete package by ID
exports.deletePackageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.package.delete({ where: { id } });
    res.status(200).json(response(200, true, 'Package deleted successfully'));
  } catch (error) {
    console.log(`Error in deletePackageById: ${error.message}`);
    next(error);
  }
};
