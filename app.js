import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3000;
import cors from 'cors';
import express from 'express';
const app = express();

import middleware from './src/middleware/logs.js';
import userRoutes from './src/routes/users.js'
import examsRoutes from './src/routes/exams.js'
import soalRoutes from './src/routes/soal.js'
import examSiswaRoutes from './src/routes/examSiswa.js'

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(middleware);

app.use('/users', userRoutes);
app.use('/exams', examsRoutes);
app.use('/soal', soalRoutes);
app.use('/ujiansiswa', examSiswaRoutes);

app.listen(PORT, () => {
    console.log(`Berhasil Running Server ${PORT}!`);
});