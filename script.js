const button = document.getElementById("enterButton");
const counterEl = document.getElementById("visitorCount");
const hero = document.querySelector(".hero");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =====================================================================
   "ENTERPRISE BACKEND SIMULATION LAYER" — 100% PALSU, 100% DI BROWSER
   -----------------------------------------------------------------
   PENTING BUAT SIAPAPUN YANG BACA INI DI DEVTOOLS:
   Semua class di bawah ini TIDAK terhubung ke server manapun. Gak ada
   fetch(), gak ada XHR, gak ada websocket, gak ada data lu yang
   dikirim ke mana-mana. Ini murni teater kode — biar "kerasa berat"
   kayak backend production beneran, padahal isinya cuma setTimeout
   yang dikasih nama fancy. Anggap aja ini fake mockup enterprise
   architecture buat nemenin tombol dodge sama loading bar palsu.
   ===================================================================== */

/* ---------------------------------------------------
   Logger — biar console-nya kerasa kayak log server beneran
--------------------------------------------------- */
class Logger {
    static #levels = { DEBUG: "#888", INFO: "#5ec8ff", WARN: "#f5c518", ERROR: "#e5484d" };
    static #bootedAt = performance.now();

    static #ts() {
        const d = new Date();
        return d.toISOString().replace("T", " ").slice(0, 19);
    }

    static #uptime() {
        return `+${((performance.now() - Logger.#bootedAt) / 1000).toFixed(3)}s`;
    }

    static log(level, scope, message) {
        const color = Logger.#levels[level] || "#fff";
        console.log(
            `%c[${Logger.#ts()} ${Logger.#uptime()}] %c${level.padEnd(5)} %c${scope}%c ${message}`,
            "color:#555",
            `color:${color};font-weight:bold`,
            "color:#9a7bff",
            "color:inherit"
        );
    }

    static debug(scope, msg) { Logger.log("DEBUG", scope, msg); }
    static info(scope, msg)  { Logger.log("INFO", scope, msg); }
    static warn(scope, msg)  { Logger.log("WARN", scope, msg); }
    static error(scope, msg) { Logger.log("ERROR", scope, msg); }
}

/* ---------------------------------------------------
   EventBus — biar service-service di bawah "komunikasi"
--------------------------------------------------- */
class EventBus {
    #listeners = new Map();

    on(event, handler) {
        if (!this.#listeners.has(event)) this.#listeners.set(event, []);
        this.#listeners.get(event).push(handler);
        return () => this.off(event, handler);
    }

    off(event, handler) {
        const list = this.#listeners.get(event);
        if (!list) return;
        this.#listeners.set(event, list.filter((h) => h !== handler));
    }

    emit(event, payload) {
        Logger.debug("EventBus", `emit "${event}"`);
        (this.#listeners.get(event) || []).forEach((h) => h(payload));
    }
}

const bus = new EventBus();

/* ---------------------------------------------------
   MockDatabase — "query" async dengan latency palsu
--------------------------------------------------- */
class MockDatabase {
    #tables = {
        visitors: { count: 37291 },
        sessions: [],
        dignity_log: [],
    };

    #latency() {
        return 120 + Math.random() * 260;
    }

    query(table, op, payload) {
        Logger.debug("MockDatabase", `QUERY ${op.toUpperCase()} ON \`${table}\``);
        return new Promise((resolve) => {
            setTimeout(() => {
                switch (`${table}:${op}`) {
                    case "visitors:increment": {
                        this.#tables.visitors.count += payload ?? 1;
                        resolve(this.#tables.visitors.count);
                        break;
                    }
                    case "sessions:insert": {
                        this.#tables.sessions.push(payload);
                        resolve(payload);
                        break;
                    }
                    case "dignity_log:insert": {
                        this.#tables.dignity_log.push(payload);
                        Logger.warn("MockDatabase", "dignity_log row inserted (irreversible)");
                        resolve(payload);
                        break;
                    }
                    default:
                        resolve(null);
                }
            }, this.#latency());
        });
    }
}

const db = new MockDatabase();

/* ---------------------------------------------------
   CacheLayer — biar ada istilah HIT/MISS di console
--------------------------------------------------- */
class CacheLayer {
    #store = new Map();

    get(key) {
        const hit = this.#store.has(key);
        Logger.debug("CacheLayer", `GET ${key} -> ${hit ? "HIT" : "MISS"}`);
        return this.#store.get(key);
    }

    set(key, value, ttlMs = 5000) {
        this.#store.set(key, value);
        setTimeout(() => this.#store.delete(key), ttlMs);
        Logger.debug("CacheLayer", `SET ${key} (ttl ${ttlMs}ms)`);
    }
}

const cache = new CacheLayer();

/* ---------------------------------------------------
   RateLimiter — dekoratif doang, selalu meloloskan lu
--------------------------------------------------- */
class RateLimiter {
    #hits = new Map();

    check(bucket, max = 999) {
        const n = (this.#hits.get(bucket) || 0) + 1;
        this.#hits.set(bucket, n);
        Logger.debug("RateLimiter", `bucket "${bucket}": ${n}/${max} request di window ini`);
        return n <= max;
    }
}

const rateLimiter = new RateLimiter();

/* ---------------------------------------------------
   CircuitBreaker — state machine yang gapenting-penting amat
--------------------------------------------------- */
class CircuitBreaker {
    #state = "CLOSED";

    get state() { return this.#state; }

    trip(reason) {
        if (this.#state !== "CLOSED") return;
        this.#state = "OPEN";
        Logger.error("CircuitBreaker", `state CLOSED -> OPEN (alasan: ${reason})`);
        setTimeout(() => {
            this.#state = "HALF_OPEN";
            Logger.warn("CircuitBreaker", "state OPEN -> HALF_OPEN, nyoba pulihin diri...");
            setTimeout(() => {
                this.#state = "CLOSED";
                Logger.info("CircuitBreaker", "state HALF_OPEN -> CLOSED, udah pulih (katanya).");
            }, 900);
        }, 700);
    }
}

const breaker = new CircuitBreaker();

/* ---------------------------------------------------
   TelemetryCollector — nampung "event", gapernah beneran dikirim
--------------------------------------------------- */
class TelemetryCollector {
    #buffer = [];

    track(name, data = {}) {
        this.#buffer.push({ name, data, at: Date.now() });
        Logger.debug("Telemetry", `event masuk buffer: ${name} (ukuran buffer: ${this.#buffer.length})`);
        // Jujur aja: buffer ini gak pernah bener-bener dikirim ke mana-mana.
        // flush() di bawah cuma nge-log ke console, gak ada network call.
    }

    flush() {
        if (!this.#buffer.length) return;
        Logger.info("Telemetry", `"mengirim" ${this.#buffer.length} event ke /dev/null...`);
        this.#buffer = [];
    }
}

const telemetry = new TelemetryCollector();
setInterval(() => telemetry.flush(), 8000);

/* ---------------------------------------------------
   MigrationRunner — migration palsu yang jalan pas boot
--------------------------------------------------- */
class MigrationRunner {
    static #migrations = [
        "2024_01_11_create_visitors_table",
        "2024_03_02_add_regret_index",
        "2024_06_19_create_dignity_log_table",
        "2025_02_08_add_column_alasan_ke_sesi",
        "2025_09_30_add_meaning_of_life_cache",
        "2026_01_04_drop_column_harapan (irreversible)",
    ];

    static async run() {
        Logger.info("MigrationRunner", `menjalankan ${MigrationRunner.#migrations.length} migration tertunda...`);
        for (const name of MigrationRunner.#migrations) {
            await new Promise((r) => setTimeout(r, 90 + Math.random() * 120));
            Logger.info("MigrationRunner", `${name} ... OK`);
        }
        Logger.info("MigrationRunner", "semua migration selesai. Database tetap gak berguna.");
    }
}

/* ---------------------------------------------------
   WebhookDispatcher — dekoratif, ngirim "webhook" ke antah berantah
--------------------------------------------------- */
class WebhookDispatcher {
    static fire(event, payload = {}) {
        Logger.warn("WebhookDispatcher", `"mengirim" webhook ${event} ke endpoint yang gak pernah didaftarin...`);
        Logger.debug("WebhookDispatcher", JSON.stringify(payload));
    }
}

/* ---------------------------------------------------
   NotificationService — bungkus toast, biar ada nama service-nya
--------------------------------------------------- */
class NotificationService {
    #stack = null;

    #ensureStack() {
        if (!this.#stack) {
            this.#stack = document.createElement("div");
            this.#stack.className = "toast-stack";
            document.body.appendChild(this.#stack);
        }
        return this.#stack;
    }

    push(text, ms = 2800) {
        const stack = this.#ensureStack();
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = text;
        stack.appendChild(toast);
        telemetry.track("toast_shown", { text });
        setTimeout(() => toast.remove(), ms);
    }
}

const notifications = new NotificationService();
function showToast(text, ms) { notifications.push(text, ms); } // biar kompatibel sama pemanggilan lama

/* ---------------------------------------------------
   SessionManager — nyimpen "state sesi" lu di MockDatabase
--------------------------------------------------- */
class SessionManager {
    #id = `sess_${Math.random().toString(36).slice(2, 10)}`;
    #state = { dodges: 0, mathAttempts: 0, reason: null };

    get id() { return this.#id; }

    async init() {
        Logger.info("SessionManager", `membuat sesi baru: ${this.#id}`);
        await db.query("sessions", "insert", { id: this.#id, startedAt: Date.now() });
        rateLimiter.check(`session:${this.#id}`);
        return this.#id;
    }

    patch(partial) {
        Object.assign(this.#state, partial);
        Logger.debug("SessionManager", `state diupdate: ${JSON.stringify(partial)}`);
    }

    get(key) { return this.#state[key]; }
}

const session = new SessionManager();

/* ---------------------------------------------------
   AuthenticationService — cuma buat generate OTP palsu
--------------------------------------------------- */
class AuthenticationService {
    static generateOtp() {
        return String(Math.floor(100000 + Math.random() * 900000));
    }
}

/* =====================================================================
   AUDIO ENGINE — INI BENERAN JALAN (bukan kayak class-class palsu di atas)
   -----------------------------------------------------------------
   Boom SFX & backsound-nya di-generate langsung pakai Web Audio API,
   gak pakai file audio eksternal sama sekali (jadi gapapa kalo di-host
   di mana aja, gak ada asset yang bisa "404"). Tombol mute-nya beneran
   nge-mute, gak kayak tombol KELUAR yang emang sengaja rusak.
   ===================================================================== */
class AudioEngine {
    #ctx = null;
    #master = null;
    #musicGain = null;
    #sfxGain = null;
    #musicTimer = null;
    #muted = false;

    // Melodi chiptune pendek, muter terus loop, gaya bgsound MIDI website jadul
    #melody = [
        [523.25, 0.18], [659.25, 0.18], [783.99, 0.18], [659.25, 0.18],
        [523.25, 0.18], [523.25, 0.18], [587.33, 0.18], [523.25, 0.36],
        [493.88, 0.18], [523.25, 0.18], [587.33, 0.18], [523.25, 0.18],
        [493.88, 0.18], [440.00, 0.18], [493.88, 0.36],
    ];

    #ensureContext() {
        if (this.#ctx) return;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        this.#ctx = new Ctx();

        this.#master = this.#ctx.createGain();
        this.#master.gain.value = 0.6;
        this.#master.connect(this.#ctx.destination);

        this.#musicGain = this.#ctx.createGain();
        this.#musicGain.gain.value = 0.16;
        this.#musicGain.connect(this.#master);

        this.#sfxGain = this.#ctx.createGain();
        this.#sfxGain.gain.value = 0.8;
        this.#sfxGain.connect(this.#master);

        Logger.info("AudioEngine", "AudioContext siap.");
    }

    unlock() {
        this.#ensureContext();
        if (this.#ctx.state === "suspended") this.#ctx.resume();
    }

    playBoom() {
        this.#ensureContext();
        if (this.#ctx.state === "suspended") this.#ctx.resume();
        const t0 = this.#ctx.currentTime;

        // Bass thump: sweep frekuensi turun cepet
        const osc = this.#ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(160, t0);
        osc.frequency.exponentialRampToValueAtTime(40, t0 + 0.22);

        const oscGain = this.#ctx.createGain();
        oscGain.gain.setValueAtTime(1, t0);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.28);

        osc.connect(oscGain);
        oscGain.connect(this.#sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.3);

        // Noise burst dikit biar berasa "boom", bukan cuma "boop"
        const bufferSize = Math.floor(this.#ctx.sampleRate * 0.15);
        const buffer = this.#ctx.createBuffer(1, bufferSize, this.#ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noise = this.#ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.#ctx.createBiquadFilter();
        noiseFilter.type = "lowpass";
        noiseFilter.frequency.value = 300;

        const noiseGain = this.#ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, t0);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.15);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.#sfxGain);
        noise.start(t0);
    }

    #scheduleMelody(startTime) {
        let t = startTime;
        for (const [freq, dur] of this.#melody) {
            const osc = this.#ctx.createOscillator();
            osc.type = "square";
            osc.frequency.value = freq;

            const g = this.#ctx.createGain();
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(1, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.9);

            osc.connect(g);
            g.connect(this.#musicGain);
            osc.start(t);
            osc.stop(t + dur);
            t += dur;
        }
        return t - startTime;
    }

    startMusic() {
        this.#ensureContext();
        if (this.#ctx.state === "suspended") this.#ctx.resume();
        if (this.#musicTimer) return;
        Logger.info("AudioEngine", "muter backsound MIDI receh gaya website jadul...");

        const loop = () => {
            const loopDuration = this.#scheduleMelody(this.#ctx.currentTime + 0.05);
            this.#musicTimer = setTimeout(loop, loopDuration * 1000);
        };
        loop();
    }

    toggleMute() {
        this.#ensureContext();
        this.#muted = !this.#muted;
        this.#master.gain.setTargetAtTime(this.#muted ? 0 : 0.6, this.#ctx.currentTime, 0.05);
        Logger.info("AudioEngine", this.#muted ? "di-mute." : "di-unmute.");
        return this.#muted;
    }
}

const audioEngine = new AudioEngine();

/* ---------------------------------------------------
   CursorTrail — biar kursornya "rame", ala plugin sparkle jadul
--------------------------------------------------- */
class CursorTrail {
    #symbols = ["✨", "💫", "⭐", "🌟"];
    #lastSpawn = 0;
    #minGapMs = 45;

    constructor() {
        if (reduceMotion) return; // yang minta gerakan minim, kita hormatin
        document.addEventListener("pointermove", (e) => this.#maybeSpawn(e.clientX, e.clientY));
    }

    #maybeSpawn(x, y) {
        const now = performance.now();
        if (now - this.#lastSpawn < this.#minGapMs) return;
        this.#lastSpawn = now;

        const el = document.createElement("span");
        el.className = "cursor-sparkle";
        el.textContent = this.#symbols[Math.floor(Math.random() * this.#symbols.length)];
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 700);
    }
}

new CursorTrail();

/* ---------------------------------------------------
   Nyalain audio pas interaksi pertama (kebijakan autoplay browser),
   plus boom SFX di SETIAP tombol yang diklik, di mana pun itu
--------------------------------------------------- */
function unlockAudioOnce() {
    audioEngine.unlock();
    audioEngine.startMusic();
    document.removeEventListener("pointerdown", unlockAudioOnce);
    document.removeEventListener("keydown", unlockAudioOnce);
}
document.addEventListener("pointerdown", unlockAudioOnce, { once: true });
document.addEventListener("keydown", unlockAudioOnce, { once: true });

document.addEventListener("click", (e) => {
    if (e.target.closest("button")) {
        audioEngine.playBoom();
    }
});

const muteToggle = document.getElementById("muteToggle");
if (muteToggle) {
    muteToggle.addEventListener("click", () => {
        const muted = audioEngine.toggleMute();
        muteToggle.textContent = muted ? "🔇" : "🔊";
        muteToggle.setAttribute("aria-pressed", String(muted));
    });
}

const webring = document.querySelector(".webring");
if (webring) {
    webring.addEventListener("click", (e) => {
        if (e.target.closest(".webring-link")) {
            notifications.push("Webring ini cuma php, gada temennya.");
        }
    });
}

/* ---------------------------------------------------
   Boot sequence — jalan pas halaman kebuka
--------------------------------------------------- */
(async function boot() {
    Logger.info("Kernel", "booting RUTOFI.STORE runtime v2.6.1-fake...");
    await MigrationRunner.run();
    await session.init();
    Logger.info("Kernel", "runtime siap. (Catatan: gak ada backend beneran di balik ini.)");
})();

/* ---------------------------------------------------
   Visitor counter yang "hidup" — naik dikit tiap kunjungan
--------------------------------------------------- */
(async function animateCounter() {
    const bump = Math.floor(Math.random() * 40) + 1;
    Logger.info("VisitorCounter", `mengirim increment +${bump} ke tabel visitors...`);
    const target = await db.query("visitors", "increment", bump);
    telemetry.track("visitor_counted", { bump });

    if (reduceMotion) {
        counterEl.textContent = target.toLocaleString("id-ID");
        return;
    }

    let current = target - bump;
    const step = () => {
        current += Math.ceil((target - current) / 6) || 1;
        if (current >= target) {
            counterEl.textContent = target.toLocaleString("id-ID");
            return;
        }
        counterEl.textContent = current.toLocaleString("id-ID");
        requestAnimationFrame(step);
    };
    step();
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
console.log("%c(Log di atas/bawah ini juga bukan backend beneran. Santai aja.)", "color:#444;font-size:11px;");

/* ---------------------------------------------------
   Klik kanan dimatiin, sekalian ngeselin
--------------------------------------------------- */
document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    WebhookDispatcher.fire("user.right_click_denied", { at: Date.now() });
    notifications.push("Klik kanan dimatiin. Alasannya? Gada.");
});

/* ---------------------------------------------------
   Toast ambient — nongol sendiri, dibatasin biar ga spam beneran
--------------------------------------------------- */
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
        notifications.push(idleToasts[Math.floor(Math.random() * idleToasts.length)]);
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
    session.patch({ dodges });
    telemetry.track("button_dodged", { dodges });
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

/* =====================================================================
   GAUNTLET VERIFIKASI — sekarang 5 babak, tiap babak gagal sekali dulu
   ===================================================================== */

/* Babak 1: alasan berkunjung */
function verifyStepReason() {
    Logger.info("AuthenticationService", `sesi ${session.id}: mulai babak "reason"`);
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
        telemetry.track("reason_attempt", { attempts, value: select.value });
        if (attempts <= 1) {
            failMsg.textContent = "Alasan tidak valid. Sebenarnya semua alasan tidak valid.";
            select.value = "";
            return;
        }
        session.patch({ reason: select.value });
        verifyStepCheckbox();
    });
}

/* Babak 2: checkbox */
function verifyStepCheckbox() {
    Logger.info("AuthenticationService", `sesi ${session.id}: mulai babak "checkbox"`);
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
        telemetry.track("checkbox_attempt", { attempts });
        if (attempts <= 1) {
            failMsg.textContent = failLines[Math.floor(Math.random() * failLines.length)];
            verifyBox.checked = false;
            return;
        }
        verifyStepMath();
    });
}

/* Babak 3: matematika */
function verifyStepMath() {
    const a = Math.floor(Math.random() * 5) + 2;
    const b = Math.floor(Math.random() * 5) + 2;
    Logger.info("AuthenticationService", `sesi ${session.id}: mulai babak "math" (${a}+${b})`);
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
        session.patch({ mathAttempts: attempts });
        telemetry.track("math_attempt", { attempts });
        if (attempts <= 1) {
            failMsg.textContent = "SALAH. (Bahkan kalau jawaban lu bener.)";
            input.value = "";
            return;
        }
        verifyStepOtp();
    });
}

/* Babak 4 (BARU): OTP palsu — dipajang langsung karena gapunya server SMS */
function verifyStepOtp() {
    let otp = AuthenticationService.generateOtp();
    Logger.info("AuthenticationService", `sesi ${session.id}: OTP dibuat -> ${otp}`);

    hero.innerHTML = `
        <div class="brand">RUTOFI.STORE</div>
        <h1 class="phase-title">VERIFIKASI OTP.</h1>
        <p class="phase-desc">
            Kode OTP lu: <span id="otpDisplay">${otp}</span><br>
            (ditampilin langsung di sini soalnya kita emang gapunya server buat kirim SMS beneran)
        </p>
        <input type="text" id="otpInput" class="select-input" placeholder="masukin kode OTP" maxlength="6" inputmode="numeric">
        <button id="otpButton">VERIFIKASI</button>
        <p class="fail-msg" id="failMsg"></p>
    `;
    const otpDisplay = document.getElementById("otpDisplay");
    const input = document.getElementById("otpInput");
    const btn = document.getElementById("otpButton");
    const failMsg = document.getElementById("failMsg");
    let attempts = 0;

    btn.addEventListener("click", async () => {
        if (!input.value) {
            failMsg.textContent = "Kode OTP-nya diisi dulu, udah dipajang gede-gede di atas.";
            return;
        }
        attempts++;
        telemetry.track("otp_attempt", { attempts });

        if (attempts === 1) {
            otp = AuthenticationService.generateOtp();
            Logger.warn("AuthenticationService", `sesi ${session.id}: OTP kadaluarsa, generate ulang -> ${otp}`);
            otpDisplay.textContent = otp;
            failMsg.textContent = "OTP-nya baru aja kadaluarsa. Kode baru udah dipajang lagi di atas.";
            input.value = "";
            return;
        }

        if (input.value.trim() !== otp) {
            failMsg.textContent = "Kode salah. Coba ketik ulang persis kayak di atas.";
            return;
        }

        btn.disabled = true;
        btn.textContent = "MEMVERIFIKASI...";
        await db.query("sessions", "insert", { otpVerifiedAt: Date.now() });
        verifyStepCaptcha();
    });
}

/* Babak 5 (BARU): captcha emoji receh */
function verifyStepCaptcha() {
    const emojis = ["🪑", "🐍", "🧦", "🪞", "🥄", "🧢"];
    const correctIndex = Math.floor(Math.random() * emojis.length);
    const targetEmoji = emojis[correctIndex];
    Logger.info("AuthenticationService", `sesi ${session.id}: mulai babak "captcha" (target index ${correctIndex})`);

    hero.innerHTML = `
        <div class="brand">RUTOFI.STORE</div>
        <h1 class="phase-title">CAPTCHA TERAKHIR.</h1>
        <p class="phase-desc">Klik yang ini: <strong>${targetEmoji}</strong></p>
        <div class="captcha-grid" id="captchaGrid">
            ${emojis.map((e, i) => `<button type="button" class="captcha-cell" data-index="${i}">${e}</button>`).join("")}
        </div>
        <p class="fail-msg" id="failMsg"></p>
    `;
    const grid = document.getElementById("captchaGrid");
    const failMsg = document.getElementById("failMsg");
    let attempts = 0;

    grid.addEventListener("click", (e) => {
        const cell = e.target.closest(".captcha-cell");
        if (!cell) return;
        attempts++;
        telemetry.track("captcha_attempt", { attempts });
        const picked = Number(cell.dataset.index);

        if (attempts === 1) {
            breaker.trip("captcha gagal di percobaan pertama (disengaja)");
            failMsg.textContent = "Salah. (Bahkan kalau lu klik yang bener.)";
            return;
        }

        if (picked !== correctIndex) {
            failMsg.textContent = "Masih salah. Baca lagi soalnya.";
            return;
        }

        startPreLoadConfirm();
    });
}

/* ---------------------------------------------------
   Dialog konfirmasi berantai sebelum antre & "loading"
--------------------------------------------------- */
function startPreLoadConfirm() {
    window.confirm("Yakin mau lanjut? Masih sempat mundur.");
    window.confirm("Serius. Ini kesempatan terakhir buat mundur.");
    startQueueWait();
}

/* ---------------------------------------------------
   Antrian palsu (BARU) — QueueWorker, posisi suka maju-mundur
--------------------------------------------------- */
function startQueueWait() {
    let position = 47 + Math.floor(Math.random() * 30);
    Logger.info("QueueWorker", `sesi ${session.id} masuk antrian di posisi ${position}`);

    hero.innerHTML = `
        <div class="brand">RUTOFI.STORE</div>
        <h1 class="phase-title">MENGANTRE.</h1>
        <p class="phase-desc">Posisi antrian lu: <strong id="queuePos">${position}</strong></p>
    `;
    const queuePos = document.getElementById("queuePos");

    const tick = setInterval(() => {
        position -= 1;
        if (position === 12 && Math.random() < 0.6) {
            position += 9;
            Logger.warn("QueueWorker", "antrian ke-reset, ada yang keliatannya nyerobot");
        }
        queuePos.textContent = Math.max(position, 0);
        if (position <= 0) {
            clearInterval(tick);
            Logger.info("QueueWorker", `sesi ${session.id} keluar dari antrian`);
            startLoading();
        }
    }, 220);
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
    const jobs = [
        "job: hitung_alasan_lu_buka_web_ini",
        "job: cek_kenapa_lu_balik_lagi_ke_sini",
        "job: sortir_hal_penting_dalam_hidup_lu",
        "job: generate_meaning_of_life (hampir selesai, padahal ga ngapa-ngapain)",
    ];
    let pct = 0;
    let jobIndex = 0;

    Logger.info("QueueWorker", `mulai memproses job untuk sesi ${session.id}...`);

    const tick = setInterval(() => {
        pct += Math.random() * 14;

        if (pct >= 99) {
            clearInterval(tick);
            fill.style.width = "99%";
            label.textContent = "99% — mohon tunggu sebentar, server kami kentang jadi harap maklum kalo agak lama.";
            Logger.warn("QueueWorker", "job macet di 99%, kayak biasa.");
            setTimeout(() => {
                if (!isRetry) {
                    fill.style.width = "3%";
                    label.textContent = "ERROR: gagal generate makna hidup. Mengulang...";
                    breaker.trip("job gagal di 99% (memang disengaja)");
                    Logger.error("QueueWorker", "job gagal, retry otomatis dijadwalkan.");
                    setTimeout(() => runProgress(true), 1600);
                } else {
                    fill.style.width = "100%";
                    label.textContent = "100%";
                    Logger.info("QueueWorker", `job untuk sesi ${session.id} selesai.`);
                    WebhookDispatcher.fire("job.completed", { sessionId: session.id });
                    setTimeout(reveal, 500);
                }
            }, 6000);
            return;
        }

        fill.style.width = `${pct}%`;
        label.textContent = `${Math.floor(pct)}% — ${jobs[jobIndex % jobs.length]}`;
        Logger.debug("QueueWorker", `progress ${Math.floor(pct)}% — ${jobs[jobIndex % jobs.length]}`);
        jobIndex++;
    }, 450);
}

/* ---------------------------------------------------
   Reveal — anti-klimaks, dan sekarang beneran susah keluar
--------------------------------------------------- */
function reveal() {
    document.title = "Lu Beneran Masuk.";
    window.addEventListener("beforeunload", beforeUnloadHandler);
    db.query("dignity_log", "insert", { sessionId: session.id, event: "user_made_it_through", at: Date.now() });
    telemetry.track("reveal_reached", { sessionId: session.id });

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
    telemetry.track("exit_attempt", { exitAttempts });

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
    Logger.info("Kernel", "kode konami terdeteksi. Membuka \"admin panel\" palsu...");
    telemetry.track("konami_triggered");
    const overlay = document.createElement("div");
    overlay.className = "easter-overlay";
    overlay.innerHTML = "<p>Lu nemu ini. Selamat, tapi buat apa.</p>";
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 2500);
}
