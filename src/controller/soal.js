import soalModel from "../models/soal.js";
import ErrorHandler from '../util/error.js';

const { BadRequestError, InternalServerError } = ErrorHandler;

const addSoal = async (req, res) => {
    const { body, params, user } = req;

    try {
        if (user && user.role === 'Guru') {
            // Pastikan model Anda dapat menangani data dari req.body tanpa perlu mengonversi JSON
            const result = await soalModel.addSoal(params.id_exams, body, user.id_users);
            if (result.success) {
                res.status(201).json({ success: true, message: 'Soal telah ditambahkan', result });
            } else {
                res.status(400).json({ success: false, message: 'Gagal menambahkan soal', error: result.message });
                console.log(result.message);
            }
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    } catch (error) {
        console.error(error);

        if (error instanceof BadRequestError) {
            res.status(400).json({ success: false, message: 'Bad Request', error: error.message });
        } else if (error instanceof InternalServerError) {
            res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Gagal menambahkan soal', error: error.message });
        }
    }
};

const getAllSoal = async (req, res) => {
    const { params, user} = req;

    try {
        if (user && user.role === 'Guru') {
            const result = await soalModel.getAllSoal(params.id_exams);
            res.status(201).json({ success: true, message: 'Berhasil mendapatkan data soal', result });
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
            res.status(500).json({ success: false, message: 'Gagal mendapatkan data soal', error: error.message });
        }
    }
};

const updateSoal = async (req, res) => {
    const { body, params, user } = req;

    try {
        if (user && user.role === 'Guru') {
            // Pastikan model Anda dapat menangani data dari req.body tanpa perlu mengonversi JSON
            const result = await soalModel.updateSoal(params.id_soal, body, user.id_users);
            if (result.success) {
                res.status(201).json({ success: true, message: 'Soal telah diperbarui', result });
            } else {
                res.status(400).json({ success: false, message: 'Gagal memperbarui soal', error: result.message });
                console.log(result.message);
            }
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    } catch (error) {
        console.error(error);

        if (error instanceof TypeError && error.message.includes("Cannot read properties of undefined")) {
            res.status(400).json({ success: false, message: "Terjadi kesalahan pada data yang diberikan." });
        } else if (error instanceof BadRequestError) {
            res.status(400).json({ success: false, message: 'Bad Request', error: error.message });
        } else if (error instanceof InternalServerError) {
            res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Gagal memperbarui soal', error: error.message });
        }
    }
};

const deleteSoal = async (req, res) => {
    const { id_soal } = req.params;
    const { user } = req;

    try {
        if (user && user.role === 'Guru') {
            // Panggil fungsi deleteSoal dengan id_soal yang diberikan
            await soalModel.deleteSoal(id_soal, user.id_users);
            // Berikan respons sukses jika tidak ada kesalahan
            res.status(200).json({ success: true, message: 'Soal berhasil dihapus.' });
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    } catch (error) {
        // Tangani kesalahan dan kirim respons dengan status error
        console.error(error);

        if (error instanceof InternalServerError) {
            res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus soal.', error: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Gagal menghapus soal.', error: error.message });
        }
    }
};


export default {
    addSoal,
    updateSoal,
    getAllSoal,
    deleteSoal,
}