const button = document.getElementById("enterButton");
const counterEl = document.getElementById("visitorCount");
const hero = document.querySelector(".hero");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------
   Visitor counter yang "hidup" — naik dikit tiap kunjungan
--------------------------------------------------- */
(function animateCounter() {
    const base = 37291;
    const bump = Math.floor(Math.random() * 40) + 1;
    const target = base + bump;

    if (reduceMotion) {
        counterEl.textContent = target.toLocaleString("id-ID");
        return;
    }

    let current = base;
    const step = () => {
        current += Math.ceil((target - current) / 6) || 1;
        if (current >= target) {
            counterEl.textContent = target.toLocaleString("id-ID");
            return;
        }
        counterEl.textContent = current.toLocaleString("id-ID");
        requestAnimationFrame(step);
    };
    setTimeout(step, 700);
})();

/* ---------------------------------------------------
   Prank judul tab pas user pindah tab
--------------------------------------------------- */
const originalTitle = document.title;
document.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? "WOI BALIK 👀" : originalTitle;
});

/* ---------------------------------------------------
   Easter egg buat yang buka console
--------------------------------------------------- */
console.log(
    "%cNgapain buka inspect element.",
    "font-size:18px;font-weight:bold;color:#fff;background:#0b0b0f;padding:8px 12px;"
);
console.log("%cYaudah sih, gas liat kodenya. Semoga berguna.", "color:#777;font-size:13px;");

/* ---------------------------------------------------
   Klik kanan dimatiin, sekalian ngeselin
--------------------------------------------------- */
document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    showToast("Klik kanan dimatiin. Alasannya? Gada.");
});

/* ---------------------------------------------------
   Toast ambient — nongol sendiri, dibatasin biar ga spam beneran
--------------------------------------------------- */
let toastStack = null;
function ensureToastStack() {
    if (!toastStack) {
        toastStack = document.createElement("div");
        toastStack.className = "toast-stack";
        document.body.appendChild(toastStack);
    }
    return toastStack;
}
function showToast(text, ms = 2800) {
    const stack = ensureToastStack();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = text;
    stack.appendChild(toast);
    setTimeout(() => toast.remove(), ms);
}

const idleToasts = [
    "Btw lu masih di sini ya.",
    "Gapapa, santai aja.",
    "Ini bukan progress bar beneran, cuma kepikiran aja.",
    "Ada konami code kalau lu bosan.",
];
let idleToastCount = 0;
function scheduleIdleToast() {
    if (reduceMotion || idleToastCount >= 4) return;
    const delay = 15000 + Math.random() * 10000;
    setTimeout(() => {
        showToast(idleToasts[Math.floor(Math.random() * idleToasts.length)]);
        idleToastCount++;
        scheduleIdleToast();
    }, delay);
}
scheduleIdleToast();

/* ---------------------------------------------------
   Tombol MASUK ngindar dari kursor
--------------------------------------------------- */
const MAX_DODGES = 4;
let dodges = 0;

button.addEventListener("mouseenter", () => {
    if (reduceMotion || dodges >= MAX_DODGES) return;
    dodges++;
    const maxX = Math.min(160, window.innerWidth / 3);
    const dx = (Math.random() - 0.5) * maxX;
    const dy = (Math.random() - 0.5) * 60 - 2;
    button.style.transform = `translate(${dx}px, ${dy}px)`;
});

button.addEventListener("mouseleave", () => {
    button.style.transform = "";
});

button.addEventListener("click", () => {
    button.style.transform = "";
    verifyStepReason();
});

/* ---------------------------------------------------
   Gauntlet verifikasi — 3 langkah, tiap langkah gagal sekali dulu
--------------------------------------------------- */
function verifyStepReason() {
    hero.innerHTML = `
        <div class="brand">RUTOFI.STORE</div>
        <h1 class="phase-title">ALASAN LU KE SINI?</h1>
        <select id="reasonSelect" class="select-input">
            <option value="">— pilih salah satu —</option>
            <option>Gabut</option>
            <option>Kesasar</option>
            <option>Disuruh temen</option>
            <option>Penasaran doang</option>
        </select>
        <button id="reasonButton">LANJUT</button>
        <p class="fail-msg" id="failMsg"></p>
    `;
    const select = document.getElementById("reasonSelect");
    const btn = document.getElementById("reasonButton");
    const failMsg = document.getElementById("failMsg");
    let attempts = 0;

    btn.addEventListener("click", () => {
        if (!select.value) {
            failMsg.textContent = "Pilih salah satu. Gabisa kosong, kayak alasan lu.";
            return;
        }
        attempts++;
        if (attempts <= 1) {
            failMsg.textContent = "Alasan tidak valid. Sebenarnya semua alasan tidak valid.";
            select.value = "";
            return;
        }
        verifyStepCheckbox();
    });
}

function verifyStepCheckbox() {
    hero.innerHTML = `
        <div class="brand">RUTOFI.STORE</div>
        <h1 class="phase-title">VERIFIKASI DULU.</h1>
        <label class="check-row">
            <input type="checkbox" id="verifyBox">
            Saya bukan mantan yang baper
        </label>
        <button id="verifyButton">LANJUT</button>
        <p class="fail-msg" id="failMsg"></p>
    `;
    const verifyBox = document.getElementById("verifyBox");
    const verifyButton = document.getElementById("verifyButton");
    const failMsg = document.getElementById("failMsg");
    const failLines = [
        "GAGAL. Sistem gapercaya.",
        "GAGAL. Coba lebih yakin lagi.",
        "GAGAL. Ini bukan soal checkbox-nya, sih.",
    ];
    let attempts = 0;

    verifyButton.addEventListener("click", () => {
        if (!verifyBox.checked) {
            failMsg.textContent = "Centang dulu, baru boleh baper.";
            return;
        }
        attempts++;
        if (attempts <= 1) {
            failMsg.textContent = failLines[Math.floor(Math.random() * failLines.length)];
            verifyBox.checked = false;
            return;
        }
        verifyStepMath();
    });
}

function verifyStepMath() {
    const a = Math.floor(Math.random() * 5) + 2;
    const b = Math.floor(Math.random() * 5) + 2;
    hero.innerHTML = `
        <div class="brand">RUTOFI.STORE</div>
        <h1 class="phase-title">SATU LAGI.</h1>
        <p class="phase-desc">Buktikan lu manusia: ${a} + ${b} = ?</p>
        <input type="number" id="mathInput" class="select-input" placeholder="jawaban">
        <button id="mathButton">KIRIM</button>
        <p class="fail-msg" id="failMsg"></p>
    `;
    const input = document.getElementById("mathInput");
    const btn = document.getElementById("mathButton");
    const failMsg = document.getElementById("failMsg");
    let attempts = 0;

    btn.addEventListener("click", () => {
        if (input.value === "") {
            failMsg.textContent = "Isi dulu, jangan kabur dari matematika.";
            return;
        }
        attempts++;
        if (attempts <= 1) {
            failMsg.textContent = "SALAH. (Bahkan kalau jawaban lu bener.)";
            input.value = "";
            return;
        }
        startPreLoadConfirm();
    });
}

/* ---------------------------------------------------
   Dialog konfirmasi berantai sebelum "loading"
--------------------------------------------------- */
function startPreLoadConfirm() {
    window.confirm("Yakin mau lanjut? Masih sempat mundur.");
    window.confirm("Serius. Ini kesempatan terakhir buat mundur.");
    startLoading();
}

/* ---------------------------------------------------
   Loading bar yang macet di 99%, lalu pura-pura gagal sekali
--------------------------------------------------- */
function startLoading() {
    hero.innerHTML = `
        <div class="brand">RUTOFI.STORE</div>
        <h1 class="phase-title">MEMPROSES...</h1>
        <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
        <p class="progress-label" id="progressLabel">0%</p>
    `;
    runProgress(false);
}

function runProgress(isRetry) {
    const fill = document.getElementById("progressFill");
    const label = document.getElementById("progressLabel");
    const statusLines = [
        "Menghitung alasan lu buka web ini...",
        "Mengecek kenapa lu balik lagi ke sini...",
        "Menyortir hal penting dalam hidup lu...",
        "Hampir selesai. Padahal ga ngapa-ngapain.",
    ];
    let pct = 0;
    let statusIndex = 0;

    const tick = setInterval(() => {
        pct += Math.random() * 14;

        if (pct >= 99) {
            clearInterval(tick);
            fill.style.width = "99%";
            label.textContent = "99% — mohon tunggu sebentar, server kami kentang jadi harap maklum kalo agak lama.";
            setTimeout(() => {
                if (!isRetry) {
                    fill.style.width = "3%";
                    label.textContent = "ERROR: gagal generate makna hidup. Mengulang...";
                    setTimeout(() => runProgress(true), 1600);
                } else {
                    fill.style.width = "100%";
                    label.textContent = "100%";
                    setTimeout(reveal, 500);
                }
            }, 6000);
            return;
        }

        fill.style.width = `${pct}%`;
        label.textContent = `${Math.floor(pct)}% — ${statusLines[statusIndex % statusLines.length]}`;
        statusIndex++;
    }, 450);
}

/* ---------------------------------------------------
   Reveal — anti-klimaks, dan sekarang beneran susah keluar
--------------------------------------------------- */
function reveal() {
    document.title = "Lu Beneran Masuk.";
    window.addEventListener("beforeunload", beforeUnloadHandler);

    hero.innerHTML = `
        <div class="brand">RUTOFI.STORE</div>
        <h1 class="phase-title">LU BENERAN MASUK.</h1>
        <p class="phase-desc">
            Tidak ada apa-apa di sini.<br>
            Tapi sekarang lu sudah tahu.
        </p>
        <button id="exitButton">KELUAR</button>
    `;
    document.getElementById("exitButton").addEventListener("click", handleExit);
}

function beforeUnloadHandler(e) {
    e.preventDefault();
    e.returnValue = "";
}

const exitLines = [
    "Gabisa. Tombol ini cuma dekorasi.",
    "Coba lagi. Kali ini beneran gabisa.",
    "Masih gabisa. Emang didesain gitu.",
    "Lu di sini selamanya sekarang. Ya udah.",
    "Serius, klik tombol close beneran di browser lu.",
    "...tuh kan, ada tombol close beneran di browser lu.",
];
let exitAttempts = 0;

function handleExit() {
    const exitButton = document.getElementById("exitButton");
    const msg = exitLines[Math.min(exitAttempts, exitLines.length - 1)];
    exitAttempts++;

    let note = document.getElementById("exitNote");
    if (!note) {
        note = document.createElement("p");
        note.id = "exitNote";
        note.className = "phase-desc";
        exitButton.insertAdjacentElement("afterend", note);
    }
    note.textContent = msg;
}

/* ---------------------------------------------------
   Konami code — buat yang iseng banget
--------------------------------------------------- */
const konami = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a",
];
let konamiIndex = 0;

document.addEventListener("keydown", (e) => {
    konamiIndex = e.key === konami[konamiIndex] ? konamiIndex + 1 : 0;
    if (konamiIndex === konami.length) {
        konamiIndex = 0;
        showEasterEgg();
    }
});

function showEasterEgg() {
    const overlay = document.createElement("div");
    overlay.className = "easter-overlay";
    overlay.innerHTML = "<p>Lu nemu ini. Selamat, tapi buat apa.</p>";
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 2500);
}