import dbpool from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();
async function getAllSoal(id_exams) {
    const connection = await dbpool;

    try {
        // Query untuk mendapatkan semua soal berdasarkan id_bank_soal
        const getAllSoalQuery = `
            SELECT s.id_soal, s.konten_soal, j.id_jawaban, j.konten_jawaban 
            FROM soal s
            LEFT JOIN jawaban j ON s.id_soal = j.id_soal_fkey
            WHERE s.id_examfk = ? AND s.deleted IS NULL AND j.deleted IS NULL
        `;
        const [results] = await connection.execute(getAllSoalQuery, [id_exams]);

        // Proses hasil query untuk mengelompokkan data soal, jawaban, dan pembahasan
        const soalData = {};
        let nama_exams;
        let durasi;

        results.forEach((row) => {
            const { id_soal, konten_soal, id_jawaban, konten_jawaban } = row;

            if (nama_exams === undefined) {
                nama_exams = row.nama_exams;
            }
            // Get the duration value from the first row since it's the same for all rows
            if (durasi === undefined) {
                durasi = row.durasi;
            }


            if (!soalData[id_soal]) {
                soalData[id_soal] = {
                    id_soal,
                    konten_soal,
                    jawaban: [],
                };
            }

            if (id_jawaban) {
                soalData[id_soal].jawaban.push({
                    id_jawaban,
                    konten_jawaban,
                });
            }
        });

        // Ubah objek menjadi array untuk hasil yang lebih mudah diolah
        const hasilAkhir = {
            nama_exams,
            durasi,
            soalData: Object.values(soalData),
        };

        return hasilAkhir;
    } catch (error) {
        throw error;
    }
};

async function enrollment(id_users, id_exams) {
    const connection = await dbpool;

    try {
        await connection.query('START TRANSACTION');

        // Query untuk memeriksa apakah kombinasi id_users dan id_exams_fkey sudah ada di tabel enrollment
        const checkEnrollmentQuery = 'SELECT * FROM enrollment WHERE id_users = ? AND id_exams_fkey = ?';
        const [existingEnrollment] = await connection.execute(checkEnrollmentQuery, [id_users, id_exams]);

        // Jika kombinasi sudah ada, maka tidak perlu melakukan penyisipan data baru
        if (existingEnrollment.length > 0) {
            console.log('Enrollment already exists');
            await connection.query('COMMIT');
            return;
        }

        // Jika kombinasi belum ada, lakukan penyisipan data baru
        const enrollmentquery = 'INSERT INTO enrollment (id_users, id_exams_fkey, datetime) VALUES (?, ?, NOW())';
        await connection.execute(enrollmentquery, [id_users, id_exams]);

        await connection.query('COMMIT');
    } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    }
};

async function submitJawaban(id_users, id_jawaban, id_exams) {
    const connection = await dbpool;

    try {
        console.log('Transaksi dimulai');
        await connection.query('START TRANSACTION');

        // Cek apakah data sudah ada untuk kombinasi kunci tertentu
        const checkExistingQuery = `
            SELECT id_user_fk, id_exams_fk, id_soal
            FROM jawaban_users
            WHERE id_user_fk = ? AND id_exams_fk = ? AND id_soal = (SELECT id_soal_fkey FROM jawaban WHERE id_jawaban = ?)
        `;

        const [existingResult] = await connection.execute(checkExistingQuery, [id_users, id_exams, id_jawaban]);

        if (existingResult.length > 0) {
            // Jika data sudah ada, lakukan update
            const updateJawabanUserQuery = `
                UPDATE jawaban_users
                SET id_jawaban = ?
                WHERE id_user_fk = ? AND id_exams_fk = ? AND id_soal = (SELECT id_soal_fkey FROM jawaban WHERE id_jawaban = ?)
            `;

            await connection.execute(updateJawabanUserQuery, [id_jawaban, id_users, id_exams, id_jawaban]);
        } else {
            // Jika data belum ada, lakukan insert
            const insertJawabanUserQuery = `
                INSERT INTO jawaban_users (id_user_fk, id_jawaban, id_exams_fk, id_soal)
                VALUES (?, ?, ?, (SELECT id_soal_fkey FROM jawaban WHERE id_jawaban = ?))
            `;

            await connection.execute(insertJawabanUserQuery, [id_users, id_jawaban, id_exams, id_jawaban]);
        }

        console.log('Transaksi selesai');
        await connection.query('COMMIT');
    } catch (error) {
        console.error('Kesalahan:', error);

        console.log('Rollback transaksi');
        await connection.query('ROLLBACK');

        throw error;
    }
}

async function countNilai(id_users, id_exams) {
    const connection = await dbpool;

    try {

        // Cek apakah sudah ada nilai untuk pasangan id_user dan id_latihan_soal yang diberikan
        const checkExistingQuery = 'SELECT COUNT(*) AS count FROM nilai_akhir WHERE id_users = ? AND id_exams = ?';
        const [checkResult] = await connection.execute(checkExistingQuery, [id_users, id_exams]);
        const existingCount = checkResult[0].count;

        // Jika sudah ada nilai, kembalikan tanpa melakukan perhitungan baru
        if (existingCount > 0) {
            console.log('Nilai sudah ada untuk pasangan id_user dan id_latihan_soal yang sama.');
            return null; // Atau nilai yang sesuai dengan kebutuhan Anda
        }

        await connection.query('START TRANSACTION');

        // Hitung jumlah benar
        const hitungJumlahBenarQuery = `
            SELECT COUNT(ju.id_jawaban) AS jumlah_benar
            FROM jawaban_users ju
            INNER JOIN jawaban j ON ju.id_jawaban = j.id_jawaban
            WHERE ju.id_user_fk = ? AND ju.id_exams_fk = ? AND j.jawaban_benar = 1 
        `;

        const [result] = await connection.execute(hitungJumlahBenarQuery, [id_users, id_exams]);
        const jumlahBenar = result[0].jumlah_benar;

        // Hitung jumlah salah
        const hitungJumlahSalahQuery = `
            SELECT COUNT(ju.id_jawaban) AS jumlah_salah
            FROM jawaban_users ju
            INNER JOIN jawaban j ON ju.id_jawaban = j.id_jawaban
            WHERE ju.id_user_fk = ? AND ju.id_exams_fk = ? AND j.jawaban_benar = 0 
        `;

        const [salahresult] = await connection.execute(hitungJumlahSalahQuery, [id_users, id_exams]);
        const jumlahSalah = salahresult[0].jumlah_salah;

        // Hitung jumlah soal
        const hitungJumlahSoalQuery = `
            SELECT COUNT(*) AS jumlah_soal
            FROM soal
            WHERE id_examfk = ? AND deleted IS NULL
        `;

        const [soalResult] = await connection.execute(hitungJumlahSoalQuery, [id_exams]);
        const jumlahSoal = soalResult[0].jumlah_soal;

        // Hitung nilai
        const nilai = (jumlahBenar / jumlahSoal) * 100;

        // Dapatkan id_enrollment dari tabel enrollment
        const getIdEnrollmentQuery = 'SELECT id_enrollment FROM enrollment WHERE id_users = ? AND id_exams_fkey = ?';
        const [enrollmentResult] = await connection.execute(getIdEnrollmentQuery, [id_users, id_exams]);

        // Periksa apakah hasil query tidak kosong dan memiliki id_enrollment
        const id_enrollment = enrollmentResult.length > 0 ? enrollmentResult[0].id_enrollment : null;

        if (id_enrollment === null) {
            console.error('ID Enrollment is NULL');
            // Handle atau log kesalahan jika diperlukan
        }

        // Insert atau update (replace) data di tabel nilai_akhir
        const insertNilaiAkhirQuery = `
            INSERT INTO nilai_akhir (id_users, id_exams, id_enrollments, jumlah_benar, konten_nilai, jumlah_salah)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE jumlah_benar = ?, konten_nilai = ?, jumlah_salah = ?;
        `;

        await connection.execute(
            insertNilaiAkhirQuery,
            [id_users, id_exams, id_enrollment, jumlahBenar, nilai, jumlahSalah, jumlahBenar, nilai, jumlahSalah]
        );

        await connection.query('COMMIT');

        return {
            jumlahBenar,
            jumlahSalah,
            jumlahSoal,
            nilai,
        };
    } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
    }
};

async function doneUjian(id_users, id_exams) {
    const connection = await dbpool;
   

    try {
        // Query untuk mendapatkan semua jawaban user beserta konten_jawaban berdasarkan id_latihan_soal dan id_user
        const getJawabanUserQuery = `
            SELECT ju.id_user_fk, ju.id_jawaban_user, ju.id_jawaban, ju.id_exams_fk, ju.id_soal, j.konten_jawaban, j.jawaban_benar
            FROM jawaban_users ju
            LEFT JOIN jawaban j ON ju.id_jawaban = j.id_jawaban
            WHERE ju.id_exams_fk = ? AND ju.id_user_fk = ?
        `;
        const [jawabanUserResults] = await connection.execute(getJawabanUserQuery, [id_exams, id_users]);

        // Query untuk mendapatkan semua soal berdasarkan id_latihan_soal
        const getAllSoalQuery = `
            SELECT s.id_soal, s.konten_soal, p.konten_pembahasan, j.id_jawaban, j.konten_jawaban, j.jawaban_benar
            FROM soal s
            LEFT JOIN pembahasan p ON s.id_soal = p.id_soalfk
            LEFT JOIN jawaban j ON s.id_soal = j.id_soal_fkey
            WHERE s.id_examfk = ? AND s.deleted IS NULL AND j.deleted IS NULL
        `;
        const [results] = await connection.execute(getAllSoalQuery, [id_exams]);

        // Query untuk mendapatkan nilai akhir
        const getNilaiAkhirQuery = `
            SELECT konten_nilai
            FROM nilai_akhir
            WHERE id_exams = ? AND id_users = ?
        `;
        const [nilaiAkhirResults] = await connection.execute(getNilaiAkhirQuery, [id_exams, id_users]);

        // Proses hasil query untuk mengelompokkan data soal, jawaban, dan pembahasan
        const soalData = {};
        let nama_exams;
        let durasi;
        
        // Gabungkan hasil jawaban user ke dalam objek soalData
        results.forEach((row) => {
            const { id_soal, konten_soal, konten_pembahasan, id_jawaban, konten_jawaban, jawaban_benar } = row;

            if (nama_exams === undefined) {
                nama_exams = row.nama_exams;
            }

            if (durasi === undefined) {
                durasi = row.durasi;
            }

            if (!soalData[id_soal]) {
                soalData[id_soal] = {
                    id_soal,
                    konten_soal,
                    pembahasan: konten_pembahasan,
                    jawaban: [],
                };
            }

            if (id_jawaban) {
                const jawabanUser = jawabanUserResults.find((jawaban) => jawaban.id_soal === id_soal);
                soalData[id_soal].jawaban.push({
                    id_jawaban,
                    konten_jawaban,
                    jawaban_benar,
                });
             
                // Tambahkan informasi jawaban user sebagai objek terpisah
                soalData[id_soal].jawaban_user = {
                    id_jawaban_user: jawabanUser ? jawabanUser.id_jawaban_user : null,
                    id_jawaban: jawabanUser ? jawabanUser.id_jawaban : null,
                    konten_jawaban: jawabanUser ? jawabanUser.konten_jawaban : null,
                    jawaban_benar: jawabanUser ? jawabanUser.jawaban_benar : null,
                };
            }
        });

        // Ubah objek menjadi array untuk hasil yang lebih mudah diolah
        const hasilAkhir = {
            nama_exams,
            durasi,
            soalData: Object.values(soalData),
            nilai_akhir: nilaiAkhirResults.length > 0 ? nilaiAkhirResults[0].konten_nilai : null,
        };
        return hasilAkhir;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

async function checkNilaiAkhir(id_users, id_exams) {
    try {
        const query = 'SELECT konten_nilai FROM nilai_akhir WHERE id_users = ? AND id_exams = ?';
        const [result] = await dbpool.execute(query, [id_users, id_exams]);
        if (result.length > 0) {
            return result[0].konten_nilai;
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
}

const getListExams = async (kelas) => {
    try {
        const query = `
            SELECT 
                id_exams, 
                nama_exams,
                start_at, 
                end_at, 
                durasi, 
                createdAt
            FROM exams
            WHERE deleted IS NULL AND kelas = ?
        `;
        const [rows] = await dbpool.execute(query, [kelas]);
        return rows;
    } catch (error) {
        throw error;
    }
}

export default {
    getAllSoal,
    submitJawaban,
    enrollment,
    countNilai,
    doneUjian,
    checkNilaiAkhir,
    getListExams
}