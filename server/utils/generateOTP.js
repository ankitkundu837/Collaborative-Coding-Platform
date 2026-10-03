const crypto = require("crypto");

/**
 * Generate a cryptographically secure 6-digit numeric OTP.
 * Uses Node's crypto.randomInt to prevent predictable pseudorandom number generation.
 */
const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

module.exports = generateOTP;