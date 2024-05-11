import examsModel from "../models/exams.js";
import ErrorHandler from '../util/error.js';  // Sesuaikan path dengan struktur proyek Anda

const { CustomError, BadRequestError, InternalServerError, DUPLICATE_NAME } = ErrorHandler;

const createNewExams = async (req, res, next) => { 
    const { body, user } = req;
    try {
        if (user && user.role === 'Guru') {
            const result = await examsModel.createNewExam(body.nama_exams, body.kelas, body.start_at, body.end_at, user.id_users, body.durasi);
            res.status(201).json({ success: true, message: 'Ujian baru telah ditambahkan', result });
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    } catch (error) {
        console.error(error);

        if (error instanceof BadRequestError) {
            res.status(400).json({ success: false, message: error.message });
        } else if (error instanceof CustomError) {
            // Kesalahan kustom lainnya yang telah dihandle
            res.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            // Kesalahan internal server atau kesalahan lain yang tidak terduga
            res.status(500).json({ success: false, message: 'Gagal menambahkan Ujian Baru', error: error.message });
        }
    }
};

const updateExams = async(req, res, next) => {
    const {user, body, params} = req;
    
    try {
        if (user && user.role === 'Guru') {
            const result = await examsModel.updateExams(params.id_exams, body.nama_exams, body.kelas, body.start_at, body.end_at, user.id_users, body.durasi);
            res.status(201).json({ success: true, message: 'Ujian telah diupdate', result });
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    } catch (error) {
        console.error(error);

        if (error instanceof BadRequestError) {
            res.status(400).json({ success: false, message: error.message });
        } else if (error instanceof CustomError) {
            // Kesalahan kustom lainnya yang telah dihandle
            res.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            // Kesalahan internal server atau kesalahan lain yang tidak terduga
            res.status(500).json({ success: false, message: 'Gagal menambahkan Ujian Baru', error: error.message });
        }
    }
};

const getExams = async(req, res, next) => {
    const { user } = req;

    try {
        if (user && user.role === 'Guru') {
            const result = await examsModel.getExams(user.id_users);
            res.status(201).json({ success: true, message: 'Berhasil mendapatkan data ujian', result });
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    } catch (error) {
        console.error(error);

        if (error instanceof BadRequestError) {
            res.status(400).json({ success: false, message: error.message });
        } else if (error instanceof CustomError) {
            // Kesalahan kustom lainnya yang telah dihandle
            res.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            // Kesalahan internal server atau kesalahan lain yang tidak terduga
            res.status(500).json({ success: false, message: 'Gagal mendapatkan data Ujian', error: error.message });
        }
    }

};

const deleteExams = async (req, res, next) => {
    const { user, params } = req;

    try {
        if (user && user.role === 'Guru') {
            const result = await examsModel.deleteExams(user.id_users, params.id_exams);
            res.status(201).json({ success: true, message: 'Berhasil menghapus ujian', result });
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    } catch (error) {
        console.error(error);

        if (error instanceof BadRequestError) {
            res.status(400).json({ success: false, message: error.message });
        } else if (error instanceof CustomError) {
            // Kesalahan kustom lainnya yang telah dihandle
            res.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            // Kesalahan internal server atau kesalahan lain yang tidak terduga
            res.status(500).json({ success: false, message: 'Gagal menghapus Ujian', error: error.message });
        }
    }

};



export default {
    createNewExams,
    getExams,
    updateExams,
    deleteExams
};
