import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3000;
import cors from 'cors';
import express from 'express';
const app = express();

import userRoutes from ''