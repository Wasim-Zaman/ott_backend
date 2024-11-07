const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    videoType: {
      type: String,
      enum: ["UPLOAD", "LINK"],
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PUBLISHED", "PENDING"],
      default: "PENDING",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Movie", movieSchema);
