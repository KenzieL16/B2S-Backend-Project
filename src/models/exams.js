import dbpool from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();
import ErrorHandler from '../util/error.js';
const { BadRequestError, InternalServerError } = ErrorHandler;

const createNewExam = async (nama_exams, kelas, start_at, end_at, id_usersfk, durasi) => {
    try {
        if (nama_exams.length < 5) {
            throw new BadRequestError('Format tidak valid, minimal terdiri dari 5 karakter');
        }

        // Validasi panjang durasi
        if (durasi.length > 3) {
            throw new BadRequestError('Format tidak valid, maksimal terdiri dari 3 karakter');
        }

        const query = 'INSERT INTO exams (nama_exams, kelas, start_at, end_at, id_usersfk, durasi, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())';
        const [result] = await dbpool.execute(query, [nama_exams, kelas, start_at, end_at, id_usersfk, durasi]);
        return result;
    } catch (error) {
        throw error;
    }
};

const getExams = async (id_users) => {
    try {
        const query = `
            SELECT 
                id_exams, 
                nama_exams, 
                kelas, 
                start_at, 
                end_at, 
                durasi, 
                createdAt, 
                (id_usersfk = ?) AS owner
            FROM exams
            WHERE deleted IS NULL
        `;
        const [rows] = await dbpool.execute(query, [id_users]);
        return rows;
    } catch (error) {
        throw error;
    }
}

const updateExams = async (id_exams, nama_exams, kelas, start_at, end_at, id_usersfk, durasi) => {
    try {
        const query = `
            UPDATE exams 
            SET 
                nama_exams = ?, 
                kelas = ?, 
                start_at = ?, 
                end_at = ?, 
                durasi = ?,
                createdAt = NOW()
            WHERE 
                id_exams = ? AND id_usersfk = ?
        `;
        const [result] = await dbpool.execute(query, [nama_exams, kelas, start_at, end_at, durasi, id_exams, id_usersfk]);
        return result;
    } catch (error) {
        throw error;
    }
};

const deleteExams = async (id_usersfk, id_exams) => {
    try {
        const query = `
            UPDATE exams 
            SET 
                deleted = NOW()
            WHERE 
                id_exams = ? AND id_usersfk = ?
        `;
        const [result] = await dbpool.execute(query, [id_exams, id_usersfk]);
        return result;
    } catch (error) {
        throw error;
    }
};

export default {
    createNewExam,
    getExams,
    updateExams,
    deleteExams,
};