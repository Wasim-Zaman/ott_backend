const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Joi = require("joi");
const { deleteFile } = require("../utils/file");
const CustomError = require("../utils/error");
const response = require("../utils/response");
const Bcrypt = require("../utils/bcrypt");

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  status: Joi.string().valid("ACTIVE", "INACTIVE", "BLOCKED").default("ACTIVE"),
  image: Joi.string().uri().optional(),
});

exports.createUser = async (req, res, next) => {
  let imagePath;
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    if (req.file) {
      imagePath = req.file.path;
      value.image = imagePath;
    }

    const hashedPassword = await Bcrypt.createPassword(value.password);
    value.password = hashedPassword;

    const newUser = await prisma.user.create({
      data: value,
    });

    const { password, ...userWithoutPassword } = newUser;
    res
      .status(201)
      .json(
        response(201, true, "User created successfully", userWithoutPassword)
      );
  } catch (error) {
    if (imagePath) await deleteFile(imagePath);
    console.log(`Error in createUser: ${error.message}`);
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        image: true,
      },
    });

    if (!users.length) {
      throw new CustomError("No users found", 404);
    }

    res
      .status(200)
      .json(response(200, true, "Users retrieved successfully", users));
  } catch (error) {
    console.log(`Error in getAllUsers: ${error.message}`);
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        image: true,
      },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    res
      .status(200)
      .json(response(200, true, "User retrieved successfully", user));
  } catch (error) {
    console.log(`Error in getUserById: ${error.message}`);
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  let imagePath;
  try {
    const { id } = req.params;
    const { error, value } = userSchema.validate(req.body, {
      stripUnknown: true,
    });
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    if (req.file) {
      imagePath = req.file.path;
      value.image = imagePath;
    }

    if (value.password) {
      value.password = await Bcrypt.createPassword(value.password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: value,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        image: true,
      },
    });

    res
      .status(200)
      .json(response(200, true, "User updated successfully", updatedUser));
  } catch (error) {
    if (imagePath) await deleteFile(imagePath);
    console.log(`Error in updateUser: ${error.message}`);
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (user.image) {
      await deleteFile(user.image);
    }

    await prisma.user.delete({ where: { id } });
    res.status(200).json(response(200, true, "User deleted successfully"));
  } catch (error) {
    console.log(`Error in deleteUser: ${error.message}`);
    next(error);
  }
};
