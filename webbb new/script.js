// ===============================
// ELEMENT SELECTOR
// ===============================
const modal = document.getElementById("modal");
const emptyState = document.getElementById("emptyState");
const dashboard = document.getElementById("dashboard");
const cardContainer = document.getElementById("cardContainer");

const inputNama = document.getElementById("nama");
const inputTanggal = document.getElementById("tanggal");
const inputInterval = document.getElementById("interval");
const editIndexInput = document.getElementById("editIndex");

const totalKomponenEl = document.getElementById("totalKomponen");
const terlambatEl = document.getElementById("terlambat");
const segeraEl = document.getElementById("segera");
const amanEl = document.getElementById("aman");

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBnVa7Mv3zVTG-v1czScxptKWJUmX9Xz7o",
  authDomain: "rtkanwil-44c0d.firebaseapp.com",
  databaseURL: "https://rtkanwil-44c0d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rtkanwil-44c0d",
  storageBucket: "rtkanwil-44c0d.firebasestorage.app",
  messagingSenderId: "1049028542830",
  appId: "1:1049028542830:web:cf7eefcb3bbc91daa4017f"
};
firebase.initializeApp(firebaseConfig);

const database = firebase.database();

// ===============================
// MODAL CONTROL
// ===============================
document.getElementById("btnAdd").addEventListener("click", openModal);
document.querySelector("#emptyState .btn").addEventListener("click", openModal);  // Tombol di emptyState

function openModal() {
    modal.style.display = "flex";  // Tampilkan modal
    document.getElementById('emptyState').classList.add('hide');
}

function closeModal(shouldRender = false) {
  modal.style.display = "none";
  resetForm();

  if (shouldRender) {
    render();
  }
}


// ===============================
// FORM HANDLER (ADD & EDIT)
// ===============================
function simpanData() {
    const nama = inputNama.value.trim();
    const tanggalValue = inputTanggal.value;
    const interval = parseInt(inputInterval.value);
    const editIndex = editIndexInput.value;

    if (!nama || !tanggalValue || !interval) {
        alert("Mohon lengkapi semua data!");
        return;
    }

    const tanggal = new Date(tanggalValue);

    const payload = {
        nama,
        tanggal: tanggal.toISOString(),  // Save as ISO string for Firebase
        interval
    };

    if (editIndex === "") {
        // TAMBAH DATA BARU
        const newRef = database.ref('komponen').push();
        newRef.set(payload).then(() => {
            // Menunggu sebentar sebelum memperbarui tampilan
            setTimeout(() => {
                render();  // Panggil render setelah data disimpan
                closeModal(); // Menutup modal setelah data disimpan
            }, 500);  // Tunggu 500ms untuk memberi waktu sebelum render
        }).catch((error) => {
            alert("Gagal menyimpan data: " + error.message);
        });
    } else {
        // EDIT DATA
        const editRef = database.ref('komponen').child(editIndex);
        editRef.set(payload).then(() => {
            // Menunggu sebentar sebelum memperbarui tampilan
            setTimeout(() => {
                render();  // Panggil render setelah data diperbarui
                closeModal(); // Menutup modal setelah data diperbarui
            }, 500);  // Tunggu 500ms untuk memberi waktu sebelum render
        }).catch((error) => {
            alert("Gagal memperbarui data: " + error.message);
        });
    }
}

// ===============================
// RENDER DASHBOARD
// ===============================
function render() {
    cardContainer.innerHTML = "";

    // Cek apakah ada data atau tidak
    database.ref('komponen').once('value', snapshot => {
        const data = snapshot.val();

        const hasData = data && Object.keys(data).length > 0;

        if (hasData) {
            // Setelah data ada, sembunyikan emptyState dan tampilkan dashboard
            emptyState.classList.add("hidden");  // Sembunyikan empty state
            dashboard.classList.remove("hidden");  // Tampilkan dashboard

            let aman = 0;
            let segera = 0;
            let terlambat = 0;

            // Render data
            Object.entries(data).forEach(([key, item]) => {
                const nextMaintenance = new Date(item.tanggal);
                nextMaintenance.setMonth(nextMaintenance.getMonth() + item.interval);

                const today = new Date();
                const sisaHari = Math.ceil((nextMaintenance - today) / (1000 * 60 * 60 * 24));

                let status = "aman";
                if (sisaHari < 0) {
                    status = "terlambat";
                    terlambat++;
                } else if (sisaHari <= 7) {
                    status = "segera";
                    segera++;
                } else {
                    aman++;
                }

                const statusText = status.charAt(0).toUpperCase() + status.slice(1);
                const dateOptions = { day: "2-digit", month: "long", year: "numeric" };
                const lastDateStr = new Date(item.tanggal).toLocaleDateString("id-ID", dateOptions);
                const nextDateStr = nextMaintenance.toLocaleDateString("id-ID", dateOptions);
                const daysText = sisaHari < 0 ? `${Math.abs(sisaHari)} hari terlambat` : `${sisaHari} hari lagi`;
                const intervalText = item.interval === 1 ? "1 bulan" : `${item.interval} bulan`;

                cardContainer.innerHTML += `
                    <div class="card">
                        <div class="card-head">
                            <h3 class="card-title">${item.nama}</h3>
                            <span class="badge ${status}">${statusText}</span>
                        </div>

                        <div class="card-body">
                            <div class="meta-row">
                                <span class="meta-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                        <path d="M16 2v4M8 2v4M3 10h18"></path>
                                    </svg>
                                </span>
                                <span>Maintenance terakhir: <b>${lastDateStr}</b></span>
                            </div>

                            <div class="meta-row">
                                <span class="meta-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="9"></circle>
                                        <path d="M12 7v6l4 2"></path>
                                    </svg>
                                </span>
                                <span>Maintenance berikutnya: <b>${nextDateStr}</b></span>
                            </div>

                            <div class="days-left">
                                <span class="meta-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20 6 9 17l-5-5"></path>
                                    </svg>
                                </span>
                                <span>${daysText}</span>
                            </div>

                            <div class="interval-pill">Interval: Setiap ${intervalText}</div>
                        </div>

                        <div class="card-actions">
                            <button class="btn btn-done" onclick="sudahMaintenance('${key}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                <span>Sudah Maintenance</span>
                            </button>

                            <div class="action-row">
                                <button class="btn btn-edit" onclick="editData('${key}')">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                        <path d="M12 20h9"></path>
                                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                                    </svg>
                                    <span>Edit</span>
                                </button>

                                <button class="btn btn-delete" onclick="hapusData('${key}')">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                        <path d="M3 6h18"></path>
                                        <path d="M8 6V4h8v2"></path>
                                        <path d="M19 6l-1 14H6L5 6"></path>
                                        <path d="M10 11v6M14 11v6"></path>
                                    </svg>
                                    <span>Hapus</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });

            // Update summary
            totalKomponenEl.innerText = Object.keys(data).length;
            amanEl.innerText = `${aman} Aman`;
            segeraEl.innerText = `${segera} Segera`;
            terlambatEl.innerText = `${terlambat} Terlambat`;
           } else {
            emptyState.classList.remove("hidden", "hide");  // tampilkan empty state
            dashboard.classList.add("hidden");              // sembunyikan dashboard

            // opsional tapi bagus: reset angka summary
            totalKomponenEl.innerText = 0;
            amanEl.innerText = "0 Aman";
            segeraEl.innerText = "0 Segera";
            terlambatEl.innerText = "0 Terlambat";
           }
    });
}

// ===============================
// EDIT DATA
// ===============================
function editData(key) {
    const dataRef = database.ref('komponen').child(key);
    dataRef.once('value', snapshot => {
        const item = snapshot.val();
        inputNama.value = item.nama;
        inputTanggal.value = new Date(item.tanggal).toISOString().split("T")[0];  // Format tanggal yang benar
        inputInterval.value = item.interval;
        editIndexInput.value = key;  // Menyimpan key untuk pembaruan
        openModal();  // Buka modal dengan data yang ada
    });
}

// ===============================
// DELETE DATA
// ===============================
function hapusData(key) {
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus data ini?");
    if (!confirmDelete) return;

    const dataRef = database.ref('komponen').child(key);
    dataRef.remove().then(() => {
        render();  // Render ulang data setelah penghapusan
    }).catch((error) => {
        alert("Gagal menghapus data: " + error.message);
    });
}

// ===============================
// SUDAH MAINTENANCE
// ===============================
function sudahMaintenance(key) {
    const today = new Date();
    const dataRef = database.ref('komponen').child(key);
    dataRef.update({
        tanggal: today.toISOString()  // Update maintenance date
    }).then(() => {
        render();  // Render ulang data setelah update
    }).catch((error) => {
        alert("Gagal memperbarui tanggal maintenance: " + error.message);
    });
}

// ===============================
// RESET FORM
// ===============================
function resetForm() {
    inputNama.value = "";
    inputTanggal.value = "";
    inputInterval.value = 2;
    editIndexInput.value = "";
}

// ===============================
// LOAD DATA ON PAGE REFRESH
// ===============================
window.onload = function() {
    render();  // Render the data from Firebase
};

// ===============================
// DROPDOWN DATA (CLICK TOGGLE)
// ===============================
const dropdown = document.querySelector(".dropdown");
const btnData = document.querySelector(".btn-Data");
const dropdownMenu = document.querySelector(".dropdown-menu");

if (dropdown && btnData && dropdownMenu) {
  btnData.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  // klik di luar -> tutup dropdown
  document.addEventListener("click", () => {
    dropdown.classList.remove("open");
  });

  // klik di dalam menu -> tetap "lock" (tidak menutup)
  dropdownMenu.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}


