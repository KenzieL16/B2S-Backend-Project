import usersModel from '../models/users.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
const { scrypt } = crypto;
import dotenv from 'dotenv';
dotenv.config();

const register = async (req, res) => {
    const { username, email, password } = req.body;

    // Validasi setiap kolom harus diisi
    if (!username || !email || !password) {
        return res.status(400).json({ msg: "All fields are required" });
    }

    let role;
    if (email.endsWith('@mejakita.com')) {
        role = 'Kontributor';
    } else {
        role = 'User';
    }

    try {
        await usersModel.createNewUsers({
            username: username,
            email: email,
            password: password,
            role: role
        });
        res.json({
            message: 'Create users Successfully',
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({
            message: "Server Error",
            serverMessage: error.message  // Menggunakan pesan error untuk memberikan informasi yang lebih spesifik
        });
    }
};

const Deleteusers = async (req, res) => {
    const { idUser } = req.params;
    const { body } = req;
    try {
        await usersModel.deleteUsers(idUser);
        res.json({
            message: 'Delete users Successfully',
            data: body
        })
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            serverMessage: error
        })
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Ambil data pengguna berdasarkan email
        const user = await usersModel.getUserByEmailAndPassword(email);

        // Validasi apakah pengguna ditemukan
        if (!user) {
            return res.status(401).json({ msg: "Email Salah" });
        }

        console.log('Debugging output:');
        console.log('Password from request:', password);
        console.log('Combined password from database:', user.combinedPassword);

        // Validasi password
        const isPasswordMatch = comparePassword(password, user.combinedPassword);
        console.log('Is password match:', isPasswordMatch);
        if (!isPasswordMatch) {
            return res.status(401).json({ msg: "Password Salah" });
        }

        // Jika password cocok, buat token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token akan kadaluwarsa dalam 1 hari
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error', error);
        res.status(500).json({
            message: "Server Error",
            serverMessage: error
        });
    }
};
const comparePassword = (password, combinedPassword) => {
    if (!combinedPassword) {
        console.error('Combined password is undefined');
        return false;
    }

    const [hashedPassword, salt] = combinedPassword.split(':');

    if (!salt) {
        console.error('Salt is undefined');
        return false;
    }

    const hashedBuffer = Buffer.from(hashedPassword, 'hex');

    // Log hashed password and salt from the database
    // console.log('Database hashed password:', hashedPassword);
    // console.log('Extracted salt:', salt);

    const key = crypto.scryptSync(password, salt, 64);

    // Log the key buffer generated during login
    const keyBuffer = Buffer.from(key);
    //console.log('Generated key buffer:', keyBuffer.toString('hex'));

    // Compare the hashedBuffer with the keyBuffer
    const isPasswordMatch = crypto.timingSafeEqual(hashedBuffer, keyBuffer);

    return isPasswordMatch;
};
export default {
    register,
    Deleteusers,
    login,
};