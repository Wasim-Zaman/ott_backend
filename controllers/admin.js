const { PrismaClient } = require('@prisma/client');

const CustomError = require('../utils/error');
const response = require('../utils/response');
const JWT = require('../utils/jwt');
const Bcrypt = require('../utils/bcrypt');

const prisma = new PrismaClient();

exports.createAdmin = async (req, res, next) => {
  const EMAIL = process.env.ADMIN_EMAIL;
  const PASSWORD = process.env.ADMIN_PASSWORD;

  try {
    console.log(`Attempting to create admin with email: ${EMAIL}`);
    const admin = await prisma.admin.findUnique({
      where: { email: EMAIL },
    });
    if (!admin) {
      const hashedPassword = await Bcrypt.createPassword(PASSWORD);
      await prisma.admin.create({
        data: {
          email: EMAIL,
          password: hashedPassword,
        },
      });
      console.log(`Admin created with email: ${EMAIL}`);
    } else {
      console.log(`Admin already exists with email: ${EMAIL}`);
    }
    next();
  } catch (error) {
    console.log(`Error in createAdmin: ${error.message}`);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError('Email and password are required', 400);
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });
    if (!admin) {
      throw new CustomError('No admin found with entered email', 401);
    }

    const isPasswordValid = await Bcrypt.comparePassword(password, admin.password);
    if (!isPasswordValid) {
      throw new CustomError('Invalid password entered', 401);
    }

    const token = JWT.createToken(admin);

    res.status(200).json(
      response(200, true, 'Login successful', {
        admin: {
          id: admin.id,
          email: admin.email,
        },
        token,
      })
    );
  } catch (error) {
    console.log(`Error in login: ${error.message}`);
    next(error);
  }
};
