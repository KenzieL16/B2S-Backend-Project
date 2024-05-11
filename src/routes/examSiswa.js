import express from 'express';

import ujiancontroller from '../controller/examSiswa.js';

import verifyToken from '../middleware/verifytoken.js';

const router = express.Router();

router.get('/:id_exams/get-all-soal', verifyToken, ujiancontroller.getAllSoal)

router.post('/:id_exams/submit-jawaban', verifyToken, ujiancontroller.submitJawaban)

router.post('/:id_exams/enrollment', verifyToken, ujiancontroller.enrollment)

router.post('/:id_exams/nilai', verifyToken, ujiancontroller.countNilai)

router.get('/:id_exams/finish', verifyToken, ujiancontroller.doneUjian)

export default router;