const Joi = require("joi");
const { deleteFile } = require("../utils/file");
const CustomError = require("../utils/error");
const response = require("../utils/response");
const Banner = require("../models/Banner");

const bannerSchema = Joi.object({
  image: Joi.string().required(),
});

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

    const newBanner = await Banner.create(value);

    res
      .status(201)
      .json(response(201, true, "Banner created successfully", newBanner));
  } catch (error) {
    if (imagePath) await deleteFile(imagePath);
    console.log(`Error in createBanner: ${error.message}`);
    next(error);
  }
};

exports.getBanners = async (req, res, next) => {
  try {
    const { length } = req.query;
    let banners;

    if (length) {
      banners = await Banner.find().sort({ _id: -1 }).limit(parseInt(length));
    } else {
      banners = await Banner.find().sort({ _id: -1 });
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

exports.getBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

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

exports.updateBannerById = async (req, res, next) => {
  let imagePath;
  try {
    const { id } = req.params;
    const { error, value } = bannerSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const existingBanner = await Banner.findById(id);
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

    const updatedBanner = await Banner.findByIdAndUpdate(id, value, {
      new: true,
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

exports.deleteBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) {
      throw new CustomError("Banner not found", 404);
    }

    if (banner.image) {
      await deleteFile(banner.image);
    }

    await Banner.findByIdAndDelete(id);
    res.status(200).json(response(200, true, "Banner deleted successfully"));
  } catch (error) {
    console.log(`Error in deleteBannerById: ${error.message}`);
    next(error);
  }
};
