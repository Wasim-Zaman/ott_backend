const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Joi = require('joi');

const CustomError = require('../utils/error');
const response = require('../utils/response');

// Joi validation schema
const enquirySchema = Joi.object({
  enquiry: Joi.string().allow(null, '').optional(),
  phoneNumber: Joi.string().required(),
  formated_date: Joi.string().optional(),
  image: Joi.string().optional(),
  status: Joi.string().optional(),
  remarks: Joi.string().optional(),
  images: Joi.array().items(Joi.string()).optional(),
});

// Create a new enquiry
exports.createEnquiry = async (req, res, next) => {
  try {
    const { error, value } = enquirySchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    // Handle single file upload
    if (req.file) {
      value.image = req.file.path;
    }

    // Handle multiple file uploads
    if (req.files) {
      if (req.files.images) {
        value.images = req.files.images.map((file) => file.path);
      }
    }

    console.log('Validated and processed value:', value);

    const newEnquiry = await prisma.enquiry.create({
      data: value,
    });

    console.log('Created enquiry:', newEnquiry);

    res.status(201).json(response(201, true, 'Enquiry created successfully', newEnquiry));
  } catch (error) {
    next(error);
  }
};

// Get all enquiries with pagination
exports.getEnquiries = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, query = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const enquiries = await prisma.enquiry.findMany({
      where: {
        OR: [{ enquiry: { contains: query } }, { phoneNumber: { contains: query } }, { status: { contains: query } }],
      },
      skip,
      take: Number(limit),
      orderBy: {
        created_at: 'desc',
      },
    });

    const totalEnquiries = await prisma.enquiry.count({
      where: {
        OR: [{ enquiry: { contains: query } }, { phoneNumber: { contains: query } }, { status: { contains: query } }],
      },
    });

    if (!enquiries.length) {
      throw new CustomError('No enquiries found', 404);
    }

    res.status(200).json(
      response(200, true, 'Enquiries retrieved successfully', {
        data: enquiries,
        totalPages: Math.ceil(totalEnquiries / Number(limit)),
        currentPage: Number(page),
        totalEnquiries,
      })
    );
  } catch (error) {
    console.log(`Error in getEnquiries: ${error.message}`);
    next(error);
  }
};

// Get enquiry by ID
exports.getEnquiryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enquiry = await prisma.enquiry.findUnique({ where: { id } });

    if (!enquiry) {
      throw new CustomError('Enquiry not found', 404);
    }

    res.status(200).json(response(200, true, 'Enquiry found successfully', enquiry));
  } catch (error) {
    console.log(`Error in getEnquiryById: ${error.message}`);
    next(error);
  }
};

// Update enquiry by ID
exports.updateEnquiryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = enquirySchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    if (req.file) {
      value.image = req.file.path;
    }

    if (req.files && req.files.images) {
      value.images = req.files.images.map((file) => file.path);
    }

    const updatedEnquiry = await prisma.enquiry.update({
      where: { id },
      data: value,
    });

    res.status(200).json(response(200, true, 'Enquiry updated successfully', updatedEnquiry));
  } catch (error) {
    console.log(`Error in updateEnquiryById: ${error.message}`);
    next(error);
  }
};

// Delete enquiry by ID
exports.deleteEnquiryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.enquiry.delete({ where: { id } });
    res.status(200).json(response(200, true, 'Enquiry deleted successfully'));
  } catch (error) {
    if (error.code === 'P2025') {
      next(new CustomError('Enquiry not found', 404));
    } else {
      console.log(`Error in deleteEnquiryById: ${error.message}`);
      next(error);
    }
  }
};

// Get all enquiries without paginationd
exports.getAllEnquiries = async (req, res, next) => {
  try {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!enquiries.length) {
      throw new CustomError('No enquiries found', 404);
    }

    res.status(200).json(
      response(200, true, 'All enquiries retrieved successfully', {
        data: enquiries,
        totalEnquiries: enquiries.length,
      })
    );
  } catch (error) {
    console.log(`Error in getAllEnquiries: ${error.message}`);
    next(error);
  }
};
