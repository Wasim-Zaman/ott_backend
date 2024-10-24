const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Joi = require("joi");
const { deleteFile } = require("../utils/file");

const CustomError = require("../utils/error");
const response = require("../utils/response");

// Joi validation schema
const bannerSchema = Joi.object({
  image: Joi.string().required(),
});

// Create a new banner
exports.createBanner = async (req, res, next) => {
  let imagePath;
  try {
    const { error, value } = bannerSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    if (req.file) {
      imagePath = req.file.path;
      value.image = imagePath;
    }

    const newBanner = await prisma.banner.create({
      data: value,
    });

    res
      .status(201)
      .json(response(201, true, "Banner created successfully", newBanner));
  } catch (error) {
    if (imagePath) await deleteFile(imagePath);
    console.log(`Error in createBanner: ${error.message}`);
    next(error);
  }
};

// Get all banners
exports.getBanners = async (req, res, next) => {
  try {
    const { length } = req.query;
    let banners;

    if (length) {
      banners = await prisma.banner.findMany({
        take: parseInt(length),
        orderBy: { id: "desc" },
      });
    } else {
      banners = await prisma.banner.findMany({
        orderBy: { id: "desc" },
      });
    }

    if (!banners.length) {
      throw new CustomError("No banners found", 404);
    }

    res
      .status(200)
      .json(response(200, true, "Banners retrieved successfully", banners));
  } catch (error) {
    console.log(`Error in getBanners: ${error.message}`);
    next(error);
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
      orderBy: { id: "desc" },
    });

    const totalBanners = await prisma.banner.count();

    if (!banners.length) {
      throw new CustomError("No banners found", 404);
    }

    res.status(200).json(
      response(200, true, "Banners retrieved successfully", {
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

// Get banner by ID
exports.getBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await prisma.banner.findUnique({ where: { id } });

    if (!banner) {
      throw new CustomError("Banner not found", 404);
    }

    res
      .status(200)
      .json(response(200, true, "Banner found successfully", banner));
  } catch (error) {
    console.log(`Error in getBannerById: ${error.message}`);
    next(error);
  }
};

// Update banner by ID
exports.updateBannerById = async (req, res, next) => {
  let imagePath;
  try {
    const { id } = req.params;
    const { error, value } = bannerSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const existingBanner = await prisma.banner.findUnique({ where: { id } });
    if (!existingBanner) {
      throw new CustomError("Banner not found", 404);
    }

    if (req.file) {
      imagePath = req.file.path;
      value.image = imagePath;
      if (existingBanner.image) {
        await deleteFile(existingBanner.image);
      }
    }

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: value,
    });

    res
      .status(200)
      .json(response(200, true, "Banner updated successfully", updatedBanner));
  } catch (error) {
    if (imagePath) await deleteFile(imagePath);
    console.log(`Error in updateBannerById: ${error.message}`);
    next(error);
  }
};

// Delete banner by ID
exports.deleteBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new CustomError("Banner not found", 404);
    }

    if (banner.image) {
      await deleteFile(banner.image);
    }

    await prisma.banner.delete({ where: { id } });
    res.status(200).json(response(200, true, "Banner deleted successfully"));
  } catch (error) {
    console.log(`Error in deleteBannerById: ${error.message}`);
    next(error);
  }
};
