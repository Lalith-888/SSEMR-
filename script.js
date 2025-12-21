/*******************************
 *  SSEMR SMART DASHBOARD JS
 *  Live + History + Toggles
 *******************************/

// Pull secure token from Vercel/Netlify Runtime Env
const TOKEN = window.env.BLYNK_TOKEN;
const BASE = "https://blynk.cloud/external/api";

// Helper
const $ = id => document.getElementById(id);

// UI Elements
const tempEl = $("temp");
const humEl  = $("hum");
const aqiEl  = $("aqi");
const aqiTag = $("aqitag");
const motionEl = $("motion");
const flameEl  = $("flame");
const occEl = $("occ");

// Control Elements
const autoBtn = $("autoBtn");
const fanBtn  = $("fanBtn");
const buzzBtn = $("buzzBtn");
const themeToggle = $("themeToggle");

// -------- CHART SETUP --------
const ctx = document.getElementById("chart").getContext("2d");
const labels = [];
const tempData = [];
const humData = [];
const aqiData = [];

const myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels,
    datasets: [
      { label: "Temp °C", borderColor: "red", data: tempData },
      { label: "Hum %", borderColor: "blue", data: humData },
      { label: "AQI", borderColor: "green", data: aqiData }
    ]
  },
  options: { animation: false }
});

// -------- BLYNK GET + SET --------
async function getPin(pin) {
  try {
    const url = `${BASE}/get?token=${TOKEN}&V${pin}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data[`V${pin}`];
  } catch (err) {
    console.log("API error:", err);
    return null;
  }
}

function setPin(pin, val) {
  fetch(`${BASE}/update?token=${TOKEN}&V${pin}=${val}`);
}

// -------- MAIN UPDATE LOOP --------
async function update() {
  const t  = await getPin(0);
  const h  = await getPin(1);
  const aq = await getPin(2);
  const m  = await getPin(3);
  const f  = await getPin(4);
  const o  = await getPin(5);

  // Display values if they exist
  if (t !== null) tempEl.textContent = `${t}°C`;
  if (h !== null) humEl.textContent = `${h}%`;
  if (aq !== null) {
    aqiEl.textContent = aq;
    const a = Number(aq);

    if (a < 200) {
      aqiTag.className = "tag green";
      aqiTag.textContent = "GOOD";
    } else if (a < 400) {
      aqiTag.className = "tag yellow";
      aqiTag.textContent = "MEDIUM";
    } else {
      aqiTag.className = "tag red";
      aqiTag.textContent = "BAD";
    }
  }

  // Motion
  if (m === "1") {
    motionEl.className = "tag yellow";
    motionEl.textContent = "YES";
  } else {
    motionEl.className = "tag gray";
    motionEl.textContent = "NO";
  }

  // -------- SAFE FLAME STATE --------
  if (f === "1") {
    flameEl.textContent = "🔥 FIRE";
    flameEl.className = "tag red";
  } else {
    flameEl.textContent = "SAFE";
    flameEl.className = "tag green";
  }

  // Occupancy
  if (o !== null) occEl.textContent = o;

  // Log values to chart if valid
  if (t && h && aq) {
    const ts = new Date().toLocaleTimeString();
    labels.push(ts);
    tempData.push(Number(t));
    humData.push(Number(h));
    aqiData.push(Number(aq));

    if (labels.length > 15) {
      labels.shift();
      tempData.shift();
      humData.shift();
      aqiData.shift();
    }
    myChart.update();
  }
}

// -------- MANUAL CONTROLS --------
autoBtn.onchange = () => setPin(12, autoBtn.checked ? 1 : 0);
fanBtn.onchange  = () => setPin(10, fanBtn.checked ? 1 : 0);
buzzBtn.onchange = () => setPin(11, buzzBtn.checked ? 1 : 0);

// -------- THEME SWITCH --------
themeToggle.onchange = () => {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
};

// Keep theme on reload
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
  themeToggle.checked = true;
}

// -------- START LOOP --------
setInterval(update, 2000);
update();
