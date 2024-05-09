import usersModel from '../models/users.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
const { scrypt } = crypto;
import dotenv from 'dotenv';
dotenv.config();