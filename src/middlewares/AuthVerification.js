// backend/src/middlewares/AuthVerification.js
const { DecodeToken } = require("../utility/TokenHelper");

module.exports = (req, res, next) => {
    // Accept several common ways to send the token
    let token = null;

    // 1) Standard: Authorization: Bearer <token>
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && typeof authHeader === 'string') {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
            token = parts[1];
        }
    }

    // 2) Alternative header some clients use
    if (!token && req.headers['x-access-token']) {
        token = req.headers['x-access-token'];
    }

    // 3) Cookie (if your client stores it)
    if (!token && req.cookies && req.cookies['token']) {
        token = req.cookies['token'];
    }

    if (!token) {
        return res.status(401).json({ status: "fail", message: "No token provided" });
    }

    // Decode the token
    let decoded;
    try {
        decoded = DecodeToken(token);
    } catch (error) {
        return res.status(401).json({ status: "fail", message: "Invalid or expired token" });
    }

    if (!decoded) {
        return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const email = (decoded.email || '').toLowerCase().trim();
    const user_id = decoded.user_id;

    req.user = decoded;
    req.headers.email = email;
    req.headers.user_id = user_id;

    return next();
};
