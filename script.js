/******************************
 * SSEMR SMART DASHBOARD JS
 * GitHub Pages Compatible
 ******************************/

const TOKEN = "oK1qUMHjBnK4GhQOvjz6fPwy5Esl_0xW";
const BASE = "https://blynk.cloud/external/api";

// Grab all elements
const $ = id => document.getElementById(id);
const tempEl = $("temp");
const humEl  = $("hum");
const aqiEl  = $("aqi");
const aqiTag = $("aqitag");
const motionEl = $("motion");
const flameEl  = $("flame");
const occEl    = $("occ");
const autoBtn  = $("autoBtn");
const fanBtn   = $("fanBtn");
const buzzBtn  = $("buzzBtn");

// loader removal
setTimeout(()=> {
  document.getElementById("loader").style.display="none";
}, 2000);

// chart
const ctx = document.getElementById("chart").getContext("2d");
const labels=[], tempData=[], humData=[], aqiData=[];
const chart = new Chart(ctx,{
  type:"line",
  data:{
    labels,
    datasets:[
      {label:"Temp", borderColor:"red", data:tempData},
      {label:"Hum", borderColor:"blue", data:humData},
      {label:"AQI", borderColor:"green", data:aqiData}
    ]
  },
  options:{animation:false}
});

// API wrappers
async function getV(pin){
  try{
    const r = await fetch(`${BASE}/get?token=${TOKEN}&V${pin}`);
    if(!r.ok) return null;
    const d = await r.json();
    return d[`V${pin}`];
  } catch(e){
    console.log(e);
    return null;
  }
}

function setV(pin,val){
  fetch(`${BASE}/update?token=${TOKEN}&V${pin}=${val}`);
}

// Main loop
async function update(){
  const t = await getV(0);
  const h = await getV(1);
  const aq= await getV(2);
  const m = await getV(3);
  const f = await getV(4);
  const o = await getV(5);

  if(t!==null) tempEl.textContent=`${t}°C`;
  if(h!==null) humEl.textContent=`${h}%`;
  if(aq!==null){
    aqiEl.textContent=aq;
    const A=Number(aq);
    if(A<200){aqiTag.className="tag green"; aqiTag.textContent="GOOD";}
    else if(A<400){aqiTag.className="tag yellow"; aqiTag.textContent="MEDIUM";}
    else {aqiTag.className="tag red"; aqiTag.textContent="BAD";}
  }

  // motion
  if(m==="1"){ motionEl.className="tag yellow"; motionEl.textContent="YES";}
  else { motionEl.className="tag gray"; motionEl.textContent="NO";}

  // flame SAFE unless explicit "1"
  if(f==="1"){ flameEl.className="tag red"; flameEl.textContent="🔥 FIRE";}
  else { flameEl.className="tag green"; flameEl.textContent="SAFE";}

  occEl.textContent=o ?? "--";

  // chart store
  if(t&&h&&aq){
    labels.push(new Date().toLocaleTimeString());
    tempData.push(Number(t));
    humData.push(Number(h));
    aqiData.push(Number(aq));
    if(labels.length>15){
      labels.shift(); tempData.shift(); humData.shift(); aqiData.shift();
    }
    chart.update();
  }
}

// toggle handlers
autoBtn.onchange  = () => setV(12, autoBtn.checked?1:0);
fanBtn.onchange   = () => setV(10, fanBtn.checked?1:0);
buzzBtn.onchange  = () => setV(11, buzzBtn.checked?1:0);

// loop
setInterval(update,2000);
update();
