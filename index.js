const Confetti = (() => {
  const cv = document.getElementById("confettiCanvas");
  const cx = cv.getContext("2d");
  let pieces = [];

  (function resize() {
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
  })();
  window.addEventListener("resize", () => {
    cv.width = innerWidth;
    cv.height = innerHeight;
  });

  const palette = [
    "#c9a96e",
    "#dfc08a",
    "#7aaa91",
    "#b07ec8",
    "#d4877a",
    "#f2ede4",
    "#7b6cff",
  ];

  function burst(x, y) {
    const isMobile = innerWidth < 768;
    const count = isMobile ? 200 : 250;
    // const spdMin = isMobile ? 6 : 6;
    // const spdMax = isMobile ? 12 : 14;
    const spdMin = isMobile ? 3 : 4;
    const spdMax = isMobile ? 6 : 8;
    const spreadY = isMobile ? innerHeight * 0.5 : innerHeight * 0.38;

    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = spdMin + Math.random() * spdMax;
      pieces.push({
        x: x ?? innerWidth * 0.5,
        y: y ?? spreadY,
        vx: Math.cos(ang) * spd * (isMobile ? 0.8 : 1),
        vy: Math.sin(ang) * spd * (isMobile ? 0.8 : 1),
        r: isMobile ? 2 + Math.random() * 2.5 : 2.5 + Math.random() * 4,
        rot: Math.random() * 360,
        rs: (Math.random() - 0.5) * 6,
        c: palette[Math.floor(Math.random() * palette.length)],
        a: 1,
        rect: Math.random() > 0.4,
      });
    }
  }

  let lastTime = 0;
  (function loop(timestamp) {
    const delta = Math.min((timestamp - lastTime) / 16.67, 3);
    lastTime = timestamp;

    cx.clearRect(0, 0, cv.width, cv.height);
    pieces = pieces.filter((p) => p.a > 0.03);
    pieces.forEach((p) => {
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      // p.vy += 0.18 * delta;
      p.vy += 0.12 * delta;
      p.vx *= Math.pow(0.98, delta);
      p.rot += p.rs * delta;
      if (p.y > innerHeight * 0.8) p.a -= 0.018 * delta;
      cx.save();
      cx.globalAlpha = p.a;
      cx.fillStyle = p.c;
      cx.translate(p.x, p.y);
      cx.rotate((p.rot * Math.PI) / 180);
      if (p.rect) {
        cx.fillRect(-p.r / 2, -p.r * 0.3, p.r, p.r * 0.55);
      } else {
        cx.beginPath();
        cx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
        cx.fill();
      }
      cx.restore();
    });
    requestAnimationFrame(loop);
  })(0);

  return { burst };
})();

/* ══════════════════════════════════════════════
   AUDIO — subtle tones via Web Audio API
══════════════════════════════════════════════ */
const Audio = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function tone(freq, dur, vol = 0.15, type = "sine", delay = 0) {
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.connect(g);
      g.connect(c.destination);
      osc.type = type;
      osc.frequency.value = freq;
      const t = c.currentTime + delay;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch (e) {}
  }

  function lightSound(i) {
    const freqs = [523, 587, 659, 698, 784];
    tone(freqs[i % freqs.length], 0.5, 0.1, "sine", 0);
    tone(freqs[i % freqs.length] * 2, 0.3, 0.04, "sine", 0.05);
  }

  function wishSound() {
    const chord = [523, 659, 784, 1047];
    chord.forEach((f, i) => tone(f, 0.8, 0.08, "sine", i * 0.1));
  }

  function blowSound() {
    tone(400, 0.2, 0.1, "sine", 0);
    tone(300, 0.3, 0.08, "sine", 0.1);
    tone(200, 0.4, 0.06, "sine", 0.2);
  }

  return { lightSound, wishSound, blowSound };
})();

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
function showToast(msg, dur = 2800) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), dur);
}

/* ══════════════════════════════════════════════
   CANDLE CONFIG
══════════════════════════════════════════════ */
const CANDLE_PALETTE = [
  {
    stick: "linear-gradient(180deg,#c490d8,#9b5cb5,#7a3e9a)",
    glow: "rgba(180,120,220,0.6)",
  },
  {
    stick: "linear-gradient(180deg,#dfc08a,#c9a96e,#a8854a)",
    glow: "rgba(220,180,100,0.6)",
  },
  {
    stick: "linear-gradient(180deg,#92c0a8,#7aaa91,#5a8870)",
    glow: "rgba(122,180,150,0.6)",
  },
  {
    stick: "linear-gradient(180deg,#d4a0a0,#bf7070,#9e4e4e)",
    glow: "rgba(220,140,140,0.6)",
  },
  {
    stick: "linear-gradient(180deg,#9eb4e8,#7090d0,#4a6ab0)",
    glow: "rgba(130,160,220,0.6)",
  },
];

/* ══════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════ */
const App = (() => {
  let state = {
    name: "",
    age: 0,
    litCount: 0,
    allLit: false,
    blown: false,
    candleCount: 0,
    soundOn: true,
  };

  /* ─ INIT ─ */
  function init() {
    const n = localStorage.getItem("birthday_name");
    const a = localStorage.getItem("birthday_age");
    if (n && a) {
      state.name = n;
      state.age = parseInt(a);
      document.getElementById("onboarding").style.display = "none";
      launch(true);
    }

    document.getElementById("f-name").addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("f-age").focus();
    });
    document.getElementById("f-age").addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSubmit();
    });
    document.getElementById("btnBegin").addEventListener("click", handleSubmit);
  }

  /* ─ VALIDATE & SUBMIT ─ */
  function handleSubmit() {
    const name = document.getElementById("f-name").value.trim();
    const age = parseInt(document.getElementById("f-age").value);
    const inN = document.getElementById("f-name");
    const inA = document.getElementById("f-age");
    const eN = document.getElementById("e-name");
    const eA = document.getElementById("e-age");
    let ok = true;

    if (!name) {
      inN.classList.add("err");
      eN.classList.add("show");
      ok = false;
    } else {
      inN.classList.remove("err");
      eN.classList.remove("show");
    }

    if (!age || age < 1 || age > 120) {
      inA.classList.add("err");
      eA.classList.add("show");
      ok = false;
    } else {
      inA.classList.remove("err");
      eA.classList.remove("show");
    }

    if (!ok) return;

    state.name = name;
    state.age = age;
    localStorage.setItem("birthday_name", name);
    localStorage.setItem("birthday_age", age);

    const ob = document.getElementById("onboarding");
    ob.classList.add("exit");
    setTimeout(() => {
      ob.style.display = "none";
      launch(false);
    }, 820);
  }

  /* ─ LAUNCH ─ */
  function launch(instant) {
    populate();
    buildCandles();

    const bd = document.getElementById("birthday");
    bd.classList.add("visible");

    if (instant) {
      requestAnimationFrame(() => bd.classList.add("shown"));
    } else {
      setTimeout(() => {
        bd.classList.add("shown");
      }, 50);
    }
  }

  /* ─ POPULATE ─ */
  function populate() {
    document.getElementById("heroName").textContent = state.name;
    document.getElementById("heroAge").textContent =
      `Turning ${state.age} today — this moment is yours.`;
    document.getElementById("revealMsg").textContent =
      `"${state.name}, Wishing you a joyful birthday and a year ahead filled with good health, lasting happiness, progress, and remarkable success, where every moment brings you closer to your dreams and the life you strive for."`;
  }

  /* ─ BUILD CANDLES ─ */
  function buildCandles() {
    const count = 3;
    state.candleCount = count;
    state.litCount = 0;
    state.allLit = false;
    state.blown = false;

    const row = document.getElementById("candleRow");
    row.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const pal = CANDLE_PALETTE[i % CANDLE_PALETTE.length];
      row.innerHTML += `
        <div class="candle">
          <div class="flame-zone">
            <div class="smoke" id="smoke${i}"><div class="smoke-fill"></div></div>
            <div class="flame" id="flame${i}">
              <div class="flame-body" style="box-shadow:0 0 12px 3px ${pal.glow},0 0 28px 6px rgba(255,100,0,0.25);"></div>
            </div>
          </div>
          <div class="candle-stick" style="background:${pal.stick};"></div>
        </div>`;
    }
  }

  /* ─ LIGHT CANDLES ─ */
  function lightCandles() {
    if (state.allLit) return;
    const btnLight = document.getElementById("btnLight");
    btnLight.disabled = true;
    setHint("Lighting the candles…", "");

    let i = 0;
    const timer = setInterval(() => {
      const f = document.getElementById(`flame${i}`);
      if (f) {
        f.classList.add("on");
      }
      if (state.soundOn) Audio.lightSound(i);
      i++;
      if (i >= state.candleCount) {
        clearInterval(timer);
        state.allLit = true;
        setHint("Close your eyes. Make a wish.", "glow");
        document.getElementById("ambient").classList.add("lit");
        document.getElementById("cakeWrap").classList.add("glowing");

        const bb = document.getElementById("btnBlow");
        bb.style.display = "block";
        bb.style.opacity = "0";
        bb.style.transition = "opacity 0.6s 0.3s var(--ease-out)";
        requestAnimationFrame(() =>
          requestAnimationFrame(() => (bb.style.opacity = "1")),
        );
      }
    }, 320);
  }

  /* ─ BLOW CANDLES ─ */
  function blowCandles() {
    if (!state.allLit || state.blown) return;
    state.blown = true;
    document.getElementById("btnBlow").disabled = true;

    if (state.soundOn) Audio.blowSound();
    setHint("Blowing…", "");

    for (let i = 0; i < state.candleCount; i++) {
      ((n) =>
        setTimeout(() => {
          const f = document.getElementById(`flame${n}`);
          const sm = document.getElementById(`smoke${n}`);
          if (f) {
            f.classList.add("out");
          }
          if (sm) {
            sm.classList.add("rise");
            setTimeout(() => sm.classList.remove("rise"), 1500);
          }
        }, n * 160))(i);
    }

    setTimeout(
      () => {
        setHint("", "");
        document.getElementById("cakeWrap").classList.remove("glowing");
        Confetti.burst();
        if (state.soundOn) Audio.wishSound();
        setTimeout(emergeReveal, 900);
      },
      state.candleCount * 160 + 600,
    );
  }

  /* ─ REVEAL SECTION ─ */
  function emergeReveal() {
    const sec = document.getElementById("revealSection");
    sec.classList.add("emerged");
    sec.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ─ HINT ─ */
  function setHint(txt, cls) {
    const h = document.getElementById("cakeHint");
    h.className = "cake-hint" + (cls ? " " + cls : "");
    h.textContent = txt;
  }

  /* ─ RESET ─ */
  function reset() {
    localStorage.removeItem("birthday_name");
    localStorage.removeItem("birthday_age");
    location.reload();
  }

  return { init, lightCandles, blowCandles, reset };
})();

/* ══════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", App.init);
