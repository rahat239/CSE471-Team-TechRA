const jwt = require('jsonwebtoken');

// Function to encode token with email, user_id, and role
exports.EncodeToken = (email, user_id, role) => {
    const KEY = "123-ABC-XYZ";  // Secret key for JWT
    const EXPIRE = { expiresIn: '24h' };  // Token expiry time

    // Payload including email, user_id, and role
    const PAYLOAD = {
        email: email,
        user_id: user_id,
        role: role,  // Include role field here
    };

    return jwt.sign(PAYLOAD, KEY, EXPIRE);
};

// Function to decode token and extract the payload
exports.DecodeToken = (token) => {
    try {
        const KEY = "123-ABC-XYZ";  // Secret key for JWT
        // Decode the token and return the payload
        return jwt.verify(token, KEY);
    } catch (e) {
        return null;  // If token is invalid or expired, return null
    }
};
