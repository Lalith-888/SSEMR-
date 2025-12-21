const TOKEN = encodeURIComponent("oK1qUMHjBnK4GhQOvjz6fPwy5Esl_0xW");
const DEVICE_ID = "1864552";

// Datastream pins
const PINS = {
  temp:0, hum:1, aqi:2,
  motion:3, flame:4, occ:5,
  fan:10, buzzer:11, auto:12
};

// Base URLs
const BASE_LIVE = "https://blynk.cloud/external/api/get";
const BASE_SET  = "https://blynk.cloud/external/api/update";
const BASE_HIST = `https://blynk.cloud/api/v1/data/devices/${DEVICE_ID}/datastreams`;

// Shortcut
const $ = id => document.getElementById(id);

// UI elements
const tempEl = $("temp");
const humEl = $("hum");
const aqiEl = $("aqi");
const aqiTag = $("aqitag");
const motionEl = $("motion");
const flameEl = $("flame");
const occEl = $("occ");

// Toggle elements
const fanBtn = $("fanBtn");
const buzzBtn = $("buzzBtn");
const autoBtn = $("autoBtn");

// Chart vars
const labels = [];
const dTemp = [], dHum = [], dAqi = [];
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
  options: { animation:false }
});

// ------- API helpers -------
async function getLive(pin) {
  const res = await fetch(`${BASE_LIVE}?token=${TOKEN}&V${pin}`);
  return await res.text();
}

function setCloud(pin, value) {
  fetch(`${BASE_SET}?token=${TOKEN}&V${pin}=${value}`);
}

// ------- Update Loop -------
async function update() {
  const t = await getLive(PINS.temp);
  const h = await getLive(PINS.hum);
  const q = await getLive(PINS.aqi);
  const m = await getLive(PINS.motion);
  const f = await getLive(PINS.flame);
  const o = await getLive(PINS.occ);

  tempEl.textContent = `${t}°C`;
  humEl.textContent = `${h}%`;
  aqiEl.textContent = q;
  occEl.textContent = o;

  // Motion badge
  if (m === "1") {
    motionEl.textContent = "YES";
    motionEl.className = "tag blue";
  } else {
    motionEl.textContent = "NO";
    motionEl.className = "tag gray";
  }

  // **Flame SAFE default**
  if (f === "1") {
    flameEl.textContent = "FIRE";
    flameEl.className = "tag red";
  } else {
    flameEl.textContent = "SAFE";
    flameEl.className = "tag green";
  }

  const aqiNum = Number(q);
  if (aqiNum < 100)      { aqiTag.textContent="GOOD"; aqiTag.className="tag green"; }
  else if (aqiNum < 200) { aqiTag.textContent="OK";   aqiTag.className="tag yellow"; }
  else                   { aqiTag.textContent="BAD";  aqiTag.className="tag red"; }

  // Add chart entry
  const time = new Date().toLocaleTimeString();
  labels.push(time);
  dTemp.push(Number(t));
  dHum .push(Number(h));
  dAqi .push(Number(q));
  if (labels.length > 50) {
    labels.shift(); dTemp.shift(); dHum.shift(); dAqi.shift();
  }
  chart.update();
}

// ------- History Pull -------
async function loadHistory() {
  try {
    const hT = await (await fetch(`${BASE_HIST}/V0/values`)).json();
    const hH = await (await fetch(`${BASE_HIST}/V1/values`)).json();
    const hQ = await (await fetch(`${BASE_HIST}/V2/values`)).json();

    const len = Math.min(hT.length, 40);
    for (let i = len-1; i >= 0; i--) {
      labels.push("");
      dTemp.push(Number(hT[i].value));
      dHum .push(Number(hH[i].value));
      dAqi .push(Number(hQ[i].value));
    }
    chart.update();
  } catch(e) {
    console.log("history load failed", e);
  }
}

// ------- Toggle Events -------
fanBtn.onchange  = () => setCloud(PINS.fan, fanBtn.checked ? 1 : 0);
buzzBtn.onchange = () => setCloud(PINS.buzzer, buzzBtn.checked ? 1 : 0);
autoBtn.onchange = () => setCloud(PINS.auto, autoBtn.checked ? 1 : 0);

// Start
loadHistory();
setInterval(update, 2000);
