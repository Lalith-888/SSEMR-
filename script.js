import { AUTH } from "./pswd.js";

const BASE = "https://blynk.cloud/external/api";

const el = id => document.getElementById(id);

// Elements
const temp=el("temp"), hum=el("hum"), aqi=el("aqi"), aqiTag=el("aqiTag");
const motion=el("motion"), flame=el("flame"), occ=el("occ");

// Controls
const auto=el("auto"), fan=el("fan"), buzz=el("buzz");

// Persistence
function save(k,v){ localStorage.setItem(k,v); }
function load(k){ return localStorage.getItem(k) ?? "--"; }

// show previous values
temp.textContent = load("temp");
hum.textContent = load("hum");
aqi.textContent = load("aqi");
occ.textContent = load("occ");

// Chart
const labels=[], tData=[], hData=[], aData=[];
const ctx=document.getElementById("chart").getContext("2d");
const chart=new Chart(ctx,{
  type:"line",
  data:{
    labels,
    datasets:[
      {label:"Temp °C", borderColor:"red", data:tData},
      {label:"Humidity %", borderColor:"blue", data:hData},
      {label:"Air Quality", borderColor:"green", data:aData}
    ]
  },
  options:{animation:false}
});

// Single JSON API call
async function update(){
  try{
    const url = `${BASE}/getPinData?token=${AUTH}&pins=V0,V1,V2,V3,V4,V5,V10,V11,V12`;
    const j = await fetch(url).then(r=>r.json());

    const T=j.V0, H=j.V1, A=j.V2;
    const M=j.V3, F=j.V4, O=j.V5;
    const FAN=j.V10, BUZ=j.V11, AUTO=j.V12;

    // UI text
    temp.textContent=`${T}°C`;
    hum.textContent=`${H}%`;
    aqi.textContent=A;
    occ.textContent=O;

    // Tags
    motion.textContent=(M==1)?"YES":"NO";
    motion.className=(M==1)?"tag blue":"tag gray";

    flame.textContent=(F==1)?"FIRE":"SAFE";
    flame.className=(F==1)?"tag red":"tag green";

    const AQ=Number(A);
    if(AQ<200){ aqiTag.textContent="GOOD"; aqiTag.className="tag green";}
    else if(AQ<400){aqiTag.textContent="MODERATE";aqiTag.className="tag yellow";}
    else{aqiTag.textContent="BAD";aqiTag.className="tag red";}

    // Persistence
    save("temp",T); save("hum",H); save("aqi",A); save("occ",O);

    // Control UI update
    auto.checked = (AUTO==1);
    fan.checked = (FAN==1);
    buzz.checked = (BUZ==1);

    fan.disabled = (AUTO==1);
    buzz.disabled = (AUTO==1);

    // Graph
    const now=new Date().toLocaleTimeString();
    labels.push(now); tData.push(Number(T)); hData.push(Number(H)); aData.push(Number(A));
    if(labels.length>20){labels.shift();tData.shift();hData.shift();aData.shift();}
    chart.update();

  } catch(err){ console.log(err); }
}

setInterval(update,2000);
update();

// Write Functions
const write = (p,v)=> fetch(`${BASE}/update?token=${AUTH}&V${p}=${v}`);

auto.onchange = ()=> write(12, auto.checked?1:0);
fan.onchange  = ()=> write(10, fan.checked?1:0);
buzz.onchange = ()=> write(11, buzz.checked?1:0);
