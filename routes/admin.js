const express = require("express");
const { login, createAdmin } = require("../_controllers/admin");

const router = express.Router();

router.use(createAdmin);

router.post("/v1/login", login);

module.exports = router;
