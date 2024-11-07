const bcrypt = require("bcryptjs");

class Bcrypt {
  static async comparePassword(inputPassword, hashedPassword) {
    const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
    console.log(
      `Comparing passwords: ${inputPassword} vs ${hashedPassword} -> ${isMatch}`
    );
    return isMatch;
  }

  static async createPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log(`Created hashed password: ${hashedPassword}`);
    return hashedPassword;
  }
}

module.exports = Bcrypt;
