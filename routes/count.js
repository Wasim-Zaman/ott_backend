const express = require("express");
const router = express.Router();
const { getCounts } = require("../controllers/count");
const verifyToken = require("../middleware/isAdmin");

router.get("/", verifyToken, getCounts);

module.exports = router;
