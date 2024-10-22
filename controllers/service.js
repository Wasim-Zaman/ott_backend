const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Joi = require("joi");

const CustomError = require("../utils/error");
const response = require("../utils/response");

// Joi validation schema
const serviceSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string().optional(),
  amount: Joi.number().positive().required(),
  discount: Joi.number().min(0).max(Joi.ref("amount")).optional(),
  fasting_time: Joi.string().optional(),
  result_duration: Joi.string().optional(),
  sample_type: Joi.string().required(),
  age_group: Joi.string().required(),
  home_sample_collection: Joi.string().optional(),
});

// Create a new service
exports.createService = async (req, res, next) => {
  try {
    const { error, value } = serviceSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    if (req.file) {
      value.image = req.file.path;
    }

    const newService = await prisma.service.create({
      data: value,
    });

    res
      .status(201)
      .json(response(201, true, "Service created successfully", newService));
  } catch (error) {
    console.log(`Error in createService: ${error.message}`);
    next(error);
  }
};

// Get all services with pagination
exports.getServices = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, query = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let services;
    let totalServices;

    try {
      services = await prisma.service.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        },
        skip,
        take: Number(limit),
      });

      totalServices = await prisma.service.count({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        },
      });
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      throw new CustomError(
        "Unable to connect to the database. Please try again later.",
        500
      );
    }

    if (!services.length) {
      throw new CustomError("No services found", 404);
    }

    res.status(200).json(
      response(200, true, "Services retrieved successfully", {
        data: services,
        totalPages: Math.ceil(totalServices / Number(limit)),
        currentPage: Number(page),
        totalServices,
      })
    );
  } catch (error) {
    console.log(`Error in getServices: ${error.message}`);
    next(error);
  }
};

// Get service by ID
exports.getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({ where: { id } });

    if (!service) {
      throw new CustomError("Service not found", 404);
    }

    res
      .status(200)
      .json(response(200, true, "Service found successfully", service));
  } catch (error) {
    console.log(`Error in getServiceById: ${error.message}`);
    next(error);
  }
};

// Update service by ID
exports.updateServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = serviceSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    if (req.file) {
      value.image = req.file.path;
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: value,
    });

    res
      .status(200)
      .json(
        response(200, true, "Service updated successfully", updatedService)
      );
  } catch (error) {
    console.log(`Error in updateServiceById: ${error.message}`);
    next(error);
  }
};

// Delete service by ID
exports.deleteServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.service.delete({ where: { id } });
    res.status(200).json(response(200, true, "Service deleted successfully"));
  } catch (error) {
    console.log(`Error in deleteServiceById: ${error.message}`);
    next(error);
  }
};

// Get all services without pagination
exports.getAllServices = async (req, res, next) => {
  try {
    let services;

    try {
      services = await prisma.service.findMany({
        orderBy: {
          name: "asc", // You can change this to sort as needed
        },
      });
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      throw new CustomError(
        "Unable to connect to the database. Please try again later.",
        500
      );
    }

    if (!services.length) {
      throw new CustomError("No services found", 404);
    }

    res
      .status(200)
      .json(
        response(200, true, "All services retrieved successfully", services)
      );
  } catch (error) {
    console.log(`Error in getAllServices: ${error.message}`);
    next(error);
  }
};
