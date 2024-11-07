const jwt = require("jsonwebtoken");
require("dotenv").config();

const CustomError = require("../utils/error");

module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    throw new CustomError("You are not authenticated.", 401);
  }

  const token = authHeader.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      next(
        new CustomError("Your session has expired. Please log in again.", 401)
      );
    } else {
      err.statusCode = 500;
      err.message = "Could not decode token.";
      next(err);
    }
    return;
  }

  if (!decodedToken) {
    throw new CustomError("You are not authenticated.", 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
    });
    if (!user) {
      throw new CustomError("User not found.", 404);
    }

    req.user = {
      id: user.id,
      email: user.email,
      mobileNumber: user.mobileNumber,
    };

    next();
  } catch (error) {
    next(error);
  }
};
