import express from 'express';

import listexams from '../controller/exams.js';

import verifyToken from '../middleware/verifytoken.js';

const router = express.Router();

router.get('/get-exams', verifyToken, listexams.getExams);

router.get('/get-exams-score/:id_exams', verifyToken, listexams.getExamsScores);

router.post('/add-exams', verifyToken, listexams.createNewExams);

router.patch('/update/:id_exams', verifyToken, listexams.updateExams);

router.delete('/delete/:id_exams', verifyToken, listexams.deleteExams);

export default router;
