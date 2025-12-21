import { AUTH } from "./pswd.js";

const BASE = "https://blynk.cloud/external/api";
const api = (pin,val=false)=> 
  val===false 
  ? `${BASE}/get?token=${AUTH}&V${pin}`
  : `${BASE}/update?token=${AUTH}&V${pin}=${val}`;

const getEl = id => document.getElementById(id);

const tempE=getEl("temp"),humE=getEl("hum"),aqiE=getEl("aqi"),aqiTag=getEl("aqiTag");
const motion=getEl("motion"), flame=getEl("flame"),occ=getEl("occ");

const autoMode = getEl("autoMode");
const fanToggle = getEl("fanToggle");
const buzzToggle = getEl("buzzToggle");

// Graph state
const labels=[],td=[],hd=[],aqd=[];
const ctx=document.getElementById("chart").getContext("2d");

const chart=new Chart(ctx,{
  type:"line",
  data:{labels,datasets:[
    {label:"Temp °C", borderColor:"red", data:td},
    {label:"Humidity %", borderColor:"blue", data:hd},
    {label:"Air Quality", borderColor:"green", data:aqd}
  ]}
});

function save(k,v){ localStorage.setItem(k,v); }
function read(k){ return localStorage.getItem(k) ?? "--"; }

// Load previous
tempE.textContent = read("temp");
humE.textContent = read("hum");
aqiE.textContent = read("aqi");
occ.textContent = read("occ");

// Fetch loop
async function refresh(){
  try{
    const t = await fetch(api(0)).then(r=>r.json()).then(d=>d.V0);
    const h = await fetch(api(1)).then(r=>r.json()).then(d=>d.V1);
    const a = await fetch(api(2)).then(r=>r.json()).then(d=>d.V2);
    const m = await fetch(api(3)).then(r=>r.json()).then(d=>d.V3);
    const f = await fetch(api(4)).then(r=>r.json()).then(d=>d.V4);
    const o = await fetch(api(5)).then(r=>r.json()).then(d=>d.V5);
    const mode = await fetch(api(12)).then(r=>r.json()).then(d=>d.V12);

    // Update main UI
    tempE.textContent = `${t}°C`; humE.textContent=`${h}%`; aqiE.textContent=a; occ.textContent=o;

    motion.textContent=(m==="1")?"YES":"NO";
    motion.className=(m==="1")?"tag blue":"tag gray";

    flame.textContent=(f==="1")?"FIRE":"SAFE";
    flame.className=(f==="1")?"tag red":"tag green";

    // AQI
    if(a<200){aqiTag.textContent="GOOD";aqiTag.className="tag green";}
    else if(a<400){aqiTag.textContent="MODERATE";aqiTag.className="tag yellow";}
    else{aqiTag.textContent="BAD";aqiTag.className="tag red";}

    // Store offline persistence
    save("temp",t); save("hum",h); save("aqi",a); save("occ",o);

    // Set UI toggle state
    autoMode.checked = (mode=="1");

    // Disable manual toggles in AUTO
    fanToggle.disabled = autoMode.checked;
    buzzToggle.disabled = autoMode.checked;

    // GRAPH push
    labels.push(new Date().toLocaleTimeString());
    td.push(Number(t)); hd.push(Number(h)); aqd.push(Number(a));
    if(labels.length>20){labels.shift();td.shift();hd.shift();aqd.shift();}
    chart.update();
  }catch(e){}
}

setInterval(refresh,2000);
refresh();

// -------- Control Writes --------
autoMode.onchange=()=>{
  fetch(api(12,autoMode.checked?1:0));
};

fanToggle.onchange=()=>{
  if(!autoMode.checked){
    fetch(api(10,fanToggle.checked?1:0));
  }
};

buzzToggle.onchange=()=>{
  if(!autoMode.checked){
    fetch(api(11,buzzToggle.checked?1:0));
  }
};
