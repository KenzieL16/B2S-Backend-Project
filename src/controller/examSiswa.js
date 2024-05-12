import ujianModel from "../models/examSiswa.js";

const getAllSoal = async (req, res) => {
    const { params, user } = req;

    try {
        if (user.id_users === undefined || params.id_exams === undefined) {
            throw new Error('Parameter id_user, id_latihan_soal tidak valid');
        }

        let result;

        // Cek apakah siswa sudah pernah mengerjakan ujian
        const doneUjianResult = await ujianModel.checkNilaiAkhir(user.id_users, params.id_exams);
        console.log(doneUjianResult);
        if (doneUjianResult === 0) {
            // Jika sudah pernah mengerjakan ujian, maka gunakan hasil ujian tersebut
            const result = await ujianModel.doneUjian(user.id_users, params.id_exams);
            res.status(200).json({ success: true, data: result });
        } else {
            // Jika belum pernah mengerjakan ujian, panggil fungsi getAllSoal
            const result = await ujianModel.getAllSoal(params.id_exams);
            res.status(200).json({ success: true, data: result });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal mendapatkan soal', error: error.message });
    }
};

const enrollment = async (req, res) => {
    const { params, user } = req;

    try {
        
        if (user.id_users === undefined || params.id_exams === undefined) {
            throw new Error('Parameter id_user atau id_latihan_soal tidak valid');
        }

        const result = await ujianModel.enrollment(user.id_users, params.id_exams);
        res.status(200).json({ success: true, message: 'Data Disimpan', data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
    }
};

const submitJawaban = async (req, res) => {
    const { user, params, body  } = req;
    

    try {
        if (user.id_users === undefined || params.id_exams === undefined || body.id_jawaban === undefined) {
            throw new Error('Parameter id_user, id_exams, id_jawaban tidak valid');
        }
        // Panggil fungsi submitJawaban dari model
        await ujianModel.submitJawaban(user.id_users, body.id_jawaban, params.id_exams);

        res.status(200).json({
            success: true,
            message: 'Jawaban berhasil disubmit',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
            error: error.message,
        });
    }
};

const countNilai = async (req, res) => {
    const { params, user } = req;
    
    try {
        if (user.id_users === undefined) {
            throw new Error('You must login');
        }

        // Hitung nilai dan simpan ke tabel nilai_akhir
        const result = await ujianModel.countNilai(user.id_users, params.id_exams);

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
    }
};

const doneUjian = async (req, res) => {
    const { params, user } = req;
    

    try {
        if (user.id_users === undefined || params.id_exams === undefined) {
            throw new Error('Parameter id_user atau id_exams tidak valid');
        }
        // Panggil fungsi submitJawaban dari model
        const result = await ujianModel.doneUjian(user.id_users, params.id_exams);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
            error: error.message,
        });
    }
};

const getListExams = async (req, res, next) => {
    const { user, params } = req;

    try {
        if (user.id_users === undefined) {
            throw new Error('Anda Harus Login');
        }
        const result = await ujianModel.getListExams(params.kelas);
        res.status(200).json({ success: true, data: result });
    } catch (error) {

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

export default {
    getAllSoal,
    submitJawaban,
    enrollment,
    countNilai,
    doneUjian,
    getListExams
};