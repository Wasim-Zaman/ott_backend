const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Joi = require('joi');

const CustomError = require('../utils/error');
const response = require('../utils/response');

// Joi validation schemas
const createBannerSchema = Joi.object({
  status: Joi.number().integer().min(0).max(1).required(),
});

const updateBannerSchema = Joi.object({
  status: Joi.number().integer().min(0).max(1),
}).min(1);

// Create a new banner
exports.createBanner = async (req, res, next) => {
  try {
    const { error, value } = createBannerSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const { status } = value;
    const image = req.file ? req.file.path : null;

    if (!image) {
      throw new CustomError('Image is required', 400);
    }

    const newBanner = await prisma.banner.create({
      data: { image, status },
    });

    res.status(201).json(response(201, true, 'Banner created successfully', newBanner));
  } catch (error) {
    console.log(`Error in createBanner: ${error.message}`);
    next(error);
  }
};

// Get all banners
exports.getBanners = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany();

    if (!banners.length) {
      throw new CustomError('No banners found', 404);
    }

    res.status(200).json(response(200, true, 'Banners retrieved successfully', banners));
  } catch (error) {
    console.log(`Error in getBanners: ${error.message}`);
    next(error);
  }
};

// Get banner by ID
exports.getBannerById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new CustomError('Banner not found', 404);
    }
    res.status(200).json(response(200, true, 'Banner found successfully', banner));
  } catch (error) {
    console.log(`Error in getBannerById: ${error.message}`);
    next(error);
  }
};

// Update a banner by ID
exports.updateBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateBannerSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const updateData = { ...value };
    if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(response(200, true, 'Banner updated successfully', updatedBanner));
  } catch (error) {
    console.log(`Error in updateBannerById: ${error.message}`);
    next(error);
  }
};

// Delete a banner by ID
exports.deleteBannerById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedBanner = await prisma.banner.delete({
      where: { id },
    });

    if (!deletedBanner) {
      throw new CustomError('Banner not found', 404);
    }

    res.status(200).json(response(200, true, 'Banner deleted successfully'));
  } catch (error) {
    if (error.code === 'P2025') {
      // Prisma error code for record not found
      next(new CustomError('Banner not found', 404));
    } else {
      console.log(`Error in deleteBannerById: ${error.message}`);
      next(error);
    }
  }
};

// Get paginated banners
exports.getPaginatedBanners = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const banners = await prisma.banner.findMany({
      skip,
      take: Number(limit),
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalBanners = await prisma.banner.count();

    if (!banners.length) {
      throw new CustomError('No banners found', 404);
    }

    res.status(200).json(
      response(200, true, 'Banners retrieved successfully', {
        data: banners,
        totalPages: Math.ceil(totalBanners / Number(limit)),
        currentPage: Number(page),
        totalBanners,
      })
    );
  } catch (error) {
    console.log(`Error in getPaginatedBanners: ${error.message}`);
    next(error);
  }
};

// Get active banners
exports.getActiveBanners = async (req, res, next) => {
  try {
    const activeBanners = await prisma.banner.findMany({
      where: {
        status: 1,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!activeBanners.length) {
      throw new CustomError('No active banners found', 404);
    }

    res.status(200).json(response(200, true, 'Active banners retrieved successfully', activeBanners));
  } catch (error) {
    console.log(`Error in getActiveBanners: ${error.message}`);
    next(error);
  }
};
