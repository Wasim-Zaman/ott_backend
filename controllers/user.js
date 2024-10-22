const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const Joi = require("joi");

const CustomError = require("../utils/error");
const response = require("../utils/response");
const JWT = require("../utils/jwt");
const Bcrypt = require("../utils/bcrypt");

// Joi validation schemas
const registerSchema = Joi.object({
  fullName: Joi.string().required(),
  mobileNumber: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Mobile number must be in international format (e.g., +923005447070)",
    }),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  age: Joi.number().integer().min(18).required(),
  gender: Joi.string().valid("MALE", "FEMALE", "OTHER").required(),
  image: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateUserSchema = Joi.object({
  fullName: Joi.string(),
  mobileNumber: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Mobile number must be in international format (e.g., +923005447070)",
    }),
  email: Joi.string().email(),
  age: Joi.number().integer().min(18),
  gender: Joi.string().valid("MALE", "FEMALE", "OTHER"),
  image: Joi.string(),
}).min(1);

// New reset password schema
const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  newPassword: Joi.string().min(6).required(),
});

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const { fullName, mobileNumber, email, password, age, gender, image } =
      value;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new CustomError("Email is already registered", 400);
    }

    // Hash the password
    const hashedPassword = await Bcrypt.createPassword(password);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        fullName,
        mobileNumber,
        email,
        password: hashedPassword,
        age,
        gender,
        image,
      },
    });

    // Create a JWT token for the newly registered user
    const token = JWT.createToken(newUser);

    res.status(201).json(
      response(201, true, "User registered successfully", {
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
        },
        token,
      })
    );
  } catch (error) {
    console.log(`Error in register: ${error.message}`);
    next(error);
  }
};

// Login a user
exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const { email, password } = value;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new CustomError("No user found with the entered email", 401);
    }

    // Compare provided password with stored hashed password
    const isPasswordValid = await Bcrypt.comparePassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new CustomError("Invalid password entered", 401);
    }

    // Create a JWT token for the authenticated user
    const token = JWT.createToken(user);

    res.status(200).json(
      response(200, true, "Login successful", {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
        token,
      })
    );
  } catch (error) {
    console.log(`Error in login: ${error.message}`);
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id: id } });
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    res.status(200).json(response(200, true, "User found successfully", user));
  } catch (error) {
    console.log(`Error in getUserById: ${error.message}`);
    next(error);
  }
};

// Get User
exports.getUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    res.status(200).json(response(200, true, "User found successfully", user));
  } catch (error) {
    console.log(`Error in getUser: ${error.message}`);
    next(error);
  }
};

// Update a user by ID
exports.updateUserById = async (req, res, next) => {
  try {
    let id;
    if (!req.user.id) {
      id = req.params.id;
    } else {
      id = req.user.id;
    }

    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    if (req.file) {
      value.image = req.file.path;
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: value,
    });

    res
      .status(200)
      .json(response(200, true, "User updated successfully", updatedUser));
  } catch (error) {
    console.log(`Error in updateUserById: ${error.message}`);
    next(error);
  }
};

// Delete a user by ID
exports.deleteUserById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedUser = await prisma.user.delete({
      where: { id: id },
    });

    if (!deletedUser) {
      throw new CustomError("User not found", 404);
    }

    res.status(200).json(response(200, true, "User deleted successfully"));
  } catch (error) {
    if (error.code === "P2025") {
      // Prisma error code for record not found
      next(new CustomError("User not found", 404));
    } else {
      console.log(`Error in deleteUserById: ${error.message}`);
      next(error);
    }
  }
};

// Get all users with pagination
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, query = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const users = await prisma.user.findMany({
      where: {
        OR: [{ fullName: { contains: query } }, { email: { contains: query } }],
      },
      skip,
      take: Number(limit),
    });

    const totalUsers = await prisma.user.count({
      where: {
        OR: [{ fullName: { contains: query } }, { email: { contains: query } }],
      },
    });

    if (!users.length) {
      throw new CustomError("No users found", 404);
    }

    res.status(200).json(
      response(200, true, "Users retrieved successfully", {
        data: users,
        totalPages: Math.ceil(totalUsers / Number(limit)),
        currentPage: Number(page),
        totalUsers,
      })
    );
  } catch (error) {
    console.log(`Error in getUsers: ${error.message}`);
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const { email, newPassword } = value;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new CustomError("No user found with the entered email", 404);
    }

    const hashedPassword = await Bcrypt.createPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json(response(200, true, "Password reset successfully"));
  } catch (error) {
    console.log(`Error in resetPassword: ${error.message}`);
    next(error);
  }
};
