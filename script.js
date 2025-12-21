const TOKEN = encodeURIComponent("oK1qUMHjBnK4GhQOvjz6fPwy5Esl_0xW");
const DEVICE_ID = "1864552";

const PINS = { temp:0, hum:1, aqi:2, motion:3, flame:4, occ:5, fan:10, buzz:11, auto:12 };

const BASE_LIVE = "https://blynk.cloud/external/api/get";
const BASE_WRITE = "https://blynk.cloud/external/api/update";
const BASE_HIST = `https://blynk.cloud/api/v1/data/devices/${DEVICE_ID}/datastreams`;

const $ = id => document.getElementById(id);

// readings
const tempEl = $("temp");
const humEl = $("hum");
const aqiEl = $("aqi");
const aqiTag = $("aqitag");
const motionEl = $("motion");
const flameEl = $("flame");
const occEl = $("occ");

// toggles
const autoToggle = $("autoToggle");
const fanToggle = $("fanToggle");
const buzzToggle = $("buzzToggle");

// chart setup
const labels = [], dTemp = [], dHum = [], dAqi = [];
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

// GET live pin
async function getV(pin) {
  const res = await fetch(`${BASE_LIVE}?token=${TOKEN}&V${pin}`);
  return await res.text();
}

// WRITE pin
async function setV(pin,val){
  fetch(`${BASE_WRITE}?token=${TOKEN}&V${pin}=${val}`);
}

// update UI values
async function update() {
  const t = await getV(PINS.temp);
  const h = await getV(PINS.hum);
  const q = await getV(PINS.aqi);
  const m = await getV(PINS.motion);
  const f = await getV(PINS.flame);
  const o = await getV(PINS.occ);

  tempEl.textContent = `${t}°C`;
  humEl.textContent = `${h}%`;
  aqiEl.textContent = q;
  occEl.textContent = o;

  motionEl.textContent = (m === "1") ? "YES" : "NO";
  motionEl.className = "tag " + ((m === "1") ? "blue" : "gray");

  if (f === "1") { flameEl.textContent = "FIRE"; flameEl.className="tag red"; }
  else { flameEl.textContent = "SAFE"; flameEl.className="tag green"; }

  const n = Number(q);
  if(n < 100){ aqiTag.textContent="GOOD"; aqiTag.className="tag green"; }
  else if(n < 200){ aqiTag.textContent="OK"; aqiTag.className="tag yellow"; }
  else{ aqiTag.textContent="BAD"; aqiTag.className="tag red"; }

  labels.push("");
  dTemp.push(Number(t)); dHum.push(Number(h)); dAqi.push(Number(q));
  if(labels.length > 60) labels.shift(), dTemp.shift(), dHum.shift(), dAqi.shift();
  chart.update();
}

// toggles
autoToggle.onchange = () => setV(PINS.auto, autoToggle.checked?1:0);
fanToggle.onchange  = () => setV(PINS.fan, fanToggle.checked?1:0);
buzzToggle.onchange = () => setV(PINS.buzz, buzzToggle.checked?1:0);

setInterval(update, 2000);
