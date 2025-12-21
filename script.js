const TOKEN = encodeURIComponent("oK1qUMHjBnK4GhQOvjz6fPwy5Esl_0xW");
const DEVICE_ID = "1864552";

const PINS = { temp:0, hum:1, aqi:2, motion:3, flame:4, occ:5 };

const BASE_LIVE = "https://blynk.cloud/external/api/get";
const BASE_HIST = `https://blynk.cloud/api/v1/data/devices/${DEVICE_ID}/datastreams`;

const $ = id => document.getElementById(id);

// UI elements
const tempEl = $("temp");
const humEl = $("hum");
const aqiEl = $("aqi");
const aqiTag = $("aqitag");
const motionEl = $("motion");
const flameEl = $("flame");
const occEl = $("occ");

// Chart.js
const labels = [];
const dTemp = [];
const dHum = [];
const dAqi = [];

const ctx = document.getElementById("chart").getContext("2d");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels,
    datasets: [
      { label:"Temp °C", borderColor:"#ff5252", data:dTemp },
      { label:"Humidity %", borderColor:"#2962ff", data:dHum },
      { label:"AQI", borderColor:"#00c853", data:dAqi }
    ]
  },
  options: { animation:false, scales:{y:{beginAtZero:false}} }
});

// -------- LIVE FETCH ----------
async function getLive(pin) {
  const url = `${BASE_LIVE}?token=${TOKEN}&V${pin}`;
  const res = await fetch(url);
  return await res.text(); // returns primitive
}

// -------- HISTORY FETCH ----------
async function getHistory(pin) {
  const url = `${BASE_HIST}/V${pin}/values`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json(); // JSON array
}

// -------- Update UI ----------
async function update() {
  const t = await getLive(PINS.temp);
  const h = await getLive(PINS.hum);
  const q = await getLive(PINS.aqi);
  const m = await getLive(PINS.motion);
  const f = await getLive(PINS.flame);
  const o = await getLive(PINS.occ);

  // Update text
  tempEl.textContent = `${t}°C`;
  humEl.textContent = `${h}%`;
  aqiEl.textContent = q;
  occEl.textContent = o;

  motionEl.textContent = (m === "1") ? "YES" : "NO";
  motionEl.className = "tag " + ((m === "1") ? "blue" : "gray");

  if (f === "1") {
    flameEl.textContent = "FIRE";
    flameEl.className = "tag red";
  } else {
    flameEl.textContent = "SAFE";
    flameEl.className = "tag green";
  }

  const aqiNum = Number(q);
  if (aqiNum < 100) { aqiTag.textContent="GOOD"; aqiTag.className="tag green"; }
  else if (aqiNum < 200) { aqiTag.textContent="OK"; aqiTag.className="tag yellow"; }
  else { aqiTag.textContent="BAD"; aqiTag.className="tag red"; }

  // Add live entry to chart
  const time = new Date().toLocaleTimeString();
  labels.push(time);
  dTemp.push(Number(t));
  dHum.push(Number(h));
  dAqi.push(Number(q));

  if (labels.length > 50) {
    labels.shift(); dTemp.shift(); dHum.shift(); dAqi.shift();
  }
  chart.update();
}

// -------- Load history once at startup ----------
async function loadHistory() {
  const hT = await getHistory(PINS.temp);
  const hH = await getHistory(PINS.hum);
  const hQ = await getHistory(PINS.aqi);

  if (!hT || !hH || !hQ) return;

  const len = Math.min(hT.length, 50);
  for (let i = len-1; i >= 0; i--) {
    labels.push("");
    dTemp.push(Number(hT[i].value));
    dHum.push(Number(hH[i].value));
    dAqi.push(Number(hQ[i].value));
  }
  chart.update();
}

loadHistory();
setInterval(update, 2000);
