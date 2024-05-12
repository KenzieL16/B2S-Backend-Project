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

async function getExamsScores(id_users, id_exams) {
    try {
        // Periksa apakah id_users dan id_exams sesuai dengan data di tabel exams
        const checkExamsQuery = 'SELECT * FROM exams WHERE id_exams = ? AND id_usersfk = ?';
        const [examsResult] = await dbpool.execute(checkExamsQuery, [id_exams, id_users]);

        if (examsResult.length === 0) {
            throw new Error('ID exams atau ID users tidak valid');
        }

        // Ambil semua nilai dari tabel nilai_akhir berdasarkan id_exams
        const getScoresQuery = `
            SELECT na.konten_nilai, na.jumlah_benar, na.jumlah_salah, u.username
            FROM nilai_akhir na
            INNER JOIN users u ON na.id_users = u.id_users
            WHERE na.id_exams = ?
        `;
        const [scoresResult] = await dbpool.execute(getScoresQuery, [id_exams]);

        if (scoresResult.length === 0) {
            throw new Error('Belum ada nilai');
        }

        return scoresResult;
    } catch (error) {
        throw error;
    }
};

export default {
    createNewExam,
    getExams,
    updateExams,
    deleteExams,
    getExamsScores
};