const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Joi = require("joi");

const CustomError = require("../utils/error");
const response = require("../utils/response");

// Joi validation schema
const serviceBookingSchema = Joi.object({
  patientName: Joi.string().required(),
  mobileNumber: Joi.string().required(),
  preference: Joi.string().required(),
  address: Joi.string().optional(),
  date: Joi.date().iso().required(),
  time: Joi.string().required(),
  paymentType: Joi.string().valid("ONLINE", "CASH").required(),
  totalPrice: Joi.number().positive().required(),
  status: Joi.string()
    .valid("COMPLETED", "PENDING", "CANCELLED")
    .default("PENDING"),
  serviceId: Joi.string().required(),
});

// Create a new service booking
exports.createServiceBooking = async (req, res, next) => {
  try {
    const { error, value } = serviceBookingSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    const newServiceBooking = await prisma.serviceBooking.create({
      data: {
        ...value,
        user: user.id,
      },
      include: { service: true },
    });

    res
      .status(201)
      .json(
        response(
          201,
          true,
          "Service booking created successfully",
          newServiceBooking
        )
      );
  } catch (error) {
    console.log(`Error in createServiceBooking: ${error.message}`);
    next(error);
  }
};

// Get all service bookings with pagination
exports.getServiceBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, query = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause = {
      OR: [
        { patientName: { contains: query } },
        { mobileNumber: { contains: query } },
      ],
    };

    // Only add status to the query if it's a valid enum value
    if (["COMPLETED", "PENDING", "CANCELLED"].includes(query)) {
      whereClause.OR.push({ status: query });
    }

    const serviceBookings = await prisma.serviceBooking.findMany({
      where: whereClause,
      skip,
      take: Number(limit),
      orderBy: {
        createdAt: "desc",
      },
      include: { service: true },
    });

    const totalServiceBookings = await prisma.serviceBooking.count({
      where: whereClause,
    });

    if (!serviceBookings.length) {
      throw new CustomError("No service bookings found", 404);
    }

    res.status(200).json(
      response(200, true, "Service bookings retrieved successfully", {
        data: serviceBookings,
        totalPages: Math.ceil(totalServiceBookings / Number(limit)),
        currentPage: Number(page),
        totalServiceBookings,
      })
    );
  } catch (error) {
    console.log(`Error in getServiceBookings: ${error.message}`);
    next(error);
  }
};

// Get service booking by ID
exports.getServiceBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const serviceBooking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!serviceBooking) {
      throw new CustomError("Service booking not found", 404);
    }

    res
      .status(200)
      .json(
        response(
          200,
          true,
          "Service booking found successfully",
          serviceBooking
        )
      );
  } catch (error) {
    console.log(`Error in getServiceBookingById: ${error.message}`);
    next(error);
  }
};

// Update service booking by ID
exports.updateServiceBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = serviceBookingSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const updatedServiceBooking = await prisma.serviceBooking.update({
      where: { id },
      data: value,
      include: { service: true },
    });

    res
      .status(200)
      .json(
        response(
          200,
          true,
          "Service booking updated successfully",
          updatedServiceBooking
        )
      );
  } catch (error) {
    console.log(`Error in updateServiceBookingById: ${error.message}`);
    next(error);
  }
};

// Delete service booking by ID
exports.deleteServiceBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.serviceBooking.delete({ where: { id } });
    res
      .status(200)
      .json(response(200, true, "Service booking deleted successfully"));
  } catch (error) {
    if (error.code === "P2025") {
      next(new CustomError("Service booking not found", 404));
    } else {
      console.log(`Error in deleteServiceBookingById: ${error.message}`);
      next(error);
    }
  }
};

// Update service booking status
exports.updateServiceBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["COMPLETED", "PENDING", "CANCELLED"].includes(status)) {
      throw new CustomError("Invalid status", 400);
    }

    const updatedServiceBooking = await prisma.serviceBooking.update({
      where: { id },
      data: { status },
      include: { service: true },
    });

    res
      .status(200)
      .json(
        response(
          200,
          true,
          "Service booking status updated successfully",
          updatedServiceBooking
        )
      );
  } catch (error) {
    console.log(`Error in updateServiceBookingStatus: ${error.message}`);
    next(error);
  }
};

// Get user service bookings
exports.getUserServiceBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, tab } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let whereClause = { user: req.user.id };

    if (tab === "history") {
      whereClause.status = "COMPLETED";
    } else if (tab === "booked") {
      whereClause.status = { in: ["PENDING", "CANCELLED"] };
    }
    // If no tab is specified, we don't add any status filter, so all bookings will be returned

    const serviceBookings = await prisma.serviceBooking.findMany({
      where: whereClause,
      skip,
      take: Number(limit),
      orderBy: {
        createdAt: "desc",
      },
      include: { service: true },
    });

    const totalServiceBookings = await prisma.serviceBooking.count({
      where: whereClause,
    });

    if (!serviceBookings.length) {
      throw new CustomError("No service bookings found for this user", 404);
    }

    res.status(200).json(
      response(200, true, "User service bookings retrieved successfully", {
        data: serviceBookings,
        totalPages: Math.ceil(totalServiceBookings / Number(limit)),
        currentPage: Number(page),
        totalServiceBookings,
      })
    );
  } catch (error) {
    console.log(`Error in getUserServiceBookings: ${error.message}`);
    next(error);
  }
};
