import express from 'express';

import soalcontroller from '../controller/soal.js';

import verifyToken from '../middleware/verifytoken.js';

const router = express.Router();

router.post('/:id_exams/add-soal', verifyToken, soalcontroller.addSoal)

router.patch('/update/:id_soal', verifyToken, soalcontroller.updateSoal)

router.get('/:id_exams/get-soal', verifyToken, soalcontroller.getAllSoal)

router.delete('/delete-soal/:id_soal', verifyToken, soalcontroller.deleteSoal)

export default router;