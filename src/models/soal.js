import dbpool from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

async function addSoal(id_exams, body) {
    const { soal } = body;

    // Pemeriksaan keberadaan dan nilai properti 'soal'
    if (!soal || typeof soal !== 'object') {
        return { success: false, message: "Properti 'soal' harus berupa objek.", statusCode: 400 };
    }

    // Validasi konten_soal
    if (!soal.konten_soal || typeof soal.konten_soal !== 'string' || soal.konten_soal.trim() === '') {
        return { success: false, message: "Konten Soal tidak boleh kosong.", statusCode: 400 };
    }

    const connection = await dbpool;

    try {
        console.log('Transaksi dimulai');
        await connection.query('START TRANSACTION');

        // Tambahkan data ke tabel soal
        const createSoalQuery = 'INSERT INTO soal (konten_soal, id_examfk) VALUES (?, ?)';
        const [soalResult] = await connection.execute(createSoalQuery, [soal.konten_soal, id_exams]);
        const id_soal = soalResult.insertId;
        
        // Loop untuk menambahkan jawaban
        for (let j = 0; j < soal.jawaban.length; j++) {
            const { konten_jawaban, jawaban_benar } = soal.jawaban[j];

            // Validasi konten_jawaban
            if (!konten_jawaban || typeof konten_jawaban !== 'string' || konten_jawaban.trim() === '') {
                await connection.query('ROLLBACK');
                return { success: false, message: "Konten Jawaban tidak boleh kosong.", statusCode: 400 };
            }

            // Validasi jawaban_benar
            if (typeof jawaban_benar !== 'string' || (jawaban_benar !== '0' && jawaban_benar !== '1')) {
                await connection.query('ROLLBACK');
                return { success: false, message: "Properti 'jawaban_benar' harus berupa angka (0 atau 1) dalam bentuk string.", statusCode: 400 };
            }

            // Tambahkan data ke tabel jawaban
            const createJawabanQuery = 'INSERT INTO jawaban (id_soal_fkey, konten_jawaban, jawaban_benar) VALUES (?, ?, ?)';
            await connection.execute(createJawabanQuery, [id_soal, konten_jawaban, jawaban_benar]);
        }

        // Tambahkan data ke tabel pembahasan
        const createPembahasanQuery = 'INSERT INTO pembahasan (id_soalfk, konten_pembahasan) VALUES (?, ?)';
        await connection.execute(createPembahasanQuery, [id_soal, soal.pembahasan]);

        console.log('Transaksi selesai');
        await connection.query('COMMIT');

        return { success: true, id_soal };
    } catch (error) {
        console.error('Kesalahan:', error);

        console.log('Rollback transaksi');
        await connection.query('ROLLBACK');

        throw error;
    }
};

async function getAllSoal(id_exams) {
    const connection = await dbpool;

    try {
        // Query untuk mendapatkan semua soal berdasarkan id_bank_soal
        const getAllSoalQuery = `
            SELECT s.id_soal, s.konten_soal, p.konten_pembahasan, j.id_jawaban, j.konten_jawaban, j.jawaban_benar
            FROM soal s
            LEFT JOIN pembahasan p ON s.id_soal = p.id_soalfk
            LEFT JOIN jawaban j ON s.id_soal = j.id_soal_fkey
            WHERE s.id_examfk = ? AND s.deleted IS NULL AND j.deleted IS NULL
        `;
        const [results] = await connection.execute(getAllSoalQuery, [id_exams]);

        // Proses hasil query untuk mengelompokkan data soal, jawaban, dan pembahasan
        const soalData = {};
        results.forEach((row) => {
            const { id_soal, konten_soal, konten_pembahasan, id_jawaban, konten_jawaban, jawaban_benar } = row;

            if (!soalData[id_soal]) {
                soalData[id_soal] = {
                    id_soal,
                    konten_soal,
                    pembahasan: konten_pembahasan,
                    jawaban: [],
                };
            }

            if (id_jawaban) {
                soalData[id_soal].jawaban.push({
                    id_jawaban,
                    konten_jawaban,
                    jawaban_benar,
                });
            }
        });

        // Ubah objek menjadi array untuk hasil yang lebih mudah diolah
        const hasilAkhir = Object.values(soalData);

        return hasilAkhir;
    } catch (error) {
        throw error;
    }
};

async function updateSoal(id_soal, body, id_users) {
    const { soal } = body;
    const { konten_soal, jawaban, pembahasan } = soal;
    console.log(id_users);
    const connection = await dbpool;

    try {
        await connection.query('START TRANSACTION');

        // Periksa apakah id_usersfk di tabel exams sama dengan id_users
        const checkUserIdQuery = 'SELECT COUNT(*) AS count FROM exams WHERE id_exams = (SELECT id_examfk FROM soal WHERE id_soal = ?) AND id_usersfk = ?';
        const [userCheckResult] = await connection.execute(checkUserIdQuery, [id_soal, id_users]);
        const userCheckCount = userCheckResult[0].count;

        if (userCheckCount === 0) {
            await connection.query('ROLLBACK');
            return { success: false, message: "Anda tidak diizinkan untuk memperbarui soal ini.", statusCode: 403 };
        }

        // Perbarui data pada tabel soal
        const updateSoalQuery = 'UPDATE soal SET konten_soal = ? WHERE id_soal = ?';
        await connection.execute(updateSoalQuery, [konten_soal, id_soal]);

        // Hapus jawaban lama dari tabel jawaban
        const deleteJawabanQuery = 'UPDATE jawaban SET deleted = NOW() WHERE id_soal_fkey = ?';
        await connection.execute(deleteJawabanQuery, [id_soal]);

        // Tambahkan jawaban baru ke tabel jawaban
        for (let j = 0; j < jawaban.length; j++) {
            const { konten_jawaban, jawaban_benar } = jawaban[j];
            const createJawabanQuery = 'INSERT INTO jawaban (id_soal_fkey, konten_jawaban, jawaban_benar) VALUES (?, ?, ?)';
            await connection.execute(createJawabanQuery, [id_soal, konten_jawaban, jawaban_benar]);
        }

        // Perbarui data pada tabel pembahasan
        const updatePembahasanQuery = 'UPDATE pembahasan SET konten_pembahasan = ? WHERE id_soalfk = ?';
        await connection.execute(updatePembahasanQuery, [pembahasan, id_soal]);

        await connection.query('COMMIT');

        return { success: true, id_soal };
    } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    }
};

async function deleteSoal(id_soal, id_users) {
    const connection = await dbpool;

    try {
        await connection.query('START TRANSACTION');
        const checkUserIdQuery = 'SELECT COUNT(*) AS count FROM exams WHERE id_exams = (SELECT id_examfk FROM soal WHERE id_soal = ?) AND id_usersfk = ?';
        const [userCheckResult] = await connection.execute(checkUserIdQuery, [id_soal, id_users]);
        const userCheckCount = userCheckResult[0].count;

        if (userCheckCount === 0) {
            await connection.query('ROLLBACK');
            return { success: false, message: "Anda tidak diizinkan untuk memperbarui soal ini.", statusCode: 403 };
        }
        // Update kolom deleted pada tabel soal
        const deleteSoalQuery = 'UPDATE soal SET deleted = NOW() WHERE id_soal = ?';
        await connection.execute(deleteSoalQuery, [id_soal]);

        // Commit transaksi
        await connection.query('COMMIT');
    } catch (error) {
        // Rollback transaksi jika terjadi kesalahan
        await connection.query('ROLLBACK');
        throw error;
    }
};

export default {
    addSoal,
    updateSoal,
    getAllSoal,
    deleteSoal,
}