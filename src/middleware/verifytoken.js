import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token not provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        console.log('Decoded token data:', decoded);

        req.user = decoded;

        if (decoded && decoded.id) {
            req.user.id = decoded.id;
        }
        next();
    });
};


export default verifyToken;