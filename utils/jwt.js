const jwt = require("jsonwebtoken");
require("dotenv").config();

class JWT {
  /**
   * Create a JWT token
   * @param {Object} payload - The payload to encode in the token
   * @param {string} secret - The secret key to sign the token
   * @param {Object} options - Additional options for the token
   * @returns {string} - The generated JWT token
   */
  static createToken(
    payload,
    options = {
      expiresIn: "12h",
      algorithm: "HS256",
    }
  ) {
    return jwt.sign(payload, process.env.JWT_SECRET, options);
  }
}

module.exports = JWT;
