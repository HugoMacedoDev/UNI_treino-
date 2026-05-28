require("dotenv").config();
const jwt = require("jsonwebtoken");
const SECRET = process.env.NODE_API_KEY;
const jwtExppirySeconds = 86400;

const getToken = (payload) => {
    const token = jwt.sign(payload, SECRET, {
        algorithm: "HS256",
        expiresIn: jwtExppirySeconds,
    });
    return token;
};

const verifyJWT = (req, res, next) => {
    let token = req.headers["authorization"] || req.query.token;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    // Remove o "Bearer " caso o front-end envie o token nesse padrão
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    try {
        // Valida e decodifica o token
        const decoded = jwt.verify(token, SECRET);

        // Adiciona o usuário na requisição para ser usado nos controllers
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

const optionalJWT = (req, _res, next) => {
    let token = req.headers["authorization"] || req.query.token;

    if (!token) {
        return next();
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    try {
        req.user = jwt.verify(token, SECRET);
    } catch {
        req.user = null;
    }

    return next();
};

module.exports = { getToken, verifyJWT, optionalJWT };