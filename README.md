#### 🏠 SSEMR — Smart Room Environment Monitoring & Response System


SSEMR is a **smart room automation and environmental monitoring system** designed using:

* **ESP8266 (NodeMCU / Wemos D1 Mini)**
* **DHT11**
* **MQ Gas/AQI Sensor**
* **PIR motion sensor**
* **IR sensor pair for occupancy counting**
* **Flame sensor**
* **Servo-controlled fan**
* **Buzzer for fire alerts**
* **LED activity indicator**
* **Blynk IoT Cloud**
* **Web Dashboard (hosted on GitHub Pages)**

The system monitors critical indoor environmental factors and **automatically takes actions**, while allowing **manual remote overrides**.

---

## 🌟 Key Features

### 🎯 Real-Time Monitoring

* Temperature (°C)
* Humidity (%)
* Air Quality Index (MQ Sensor)
* Motion detection
* Flame detection
* Room Occupancy

### 🤖 Autonomous Control

* Fan auto ON/OFF based on:

  * high temperature
  * poor air quality
* Buzzer alarm on flame detection
* LED alerts on movement

### 🎛 Manual Override (IoT Control)

Via dashboard toggles:

* Auto Mode
* Fan Mode
* Buzzer Alert

### 📊 Web Dashboard Capabilities

* Fully responsive user interface
* Live sensor readings every 2 seconds
* Status tags (GOOD/BAD/SAFE/FIRE/YES/NO)
* Real-time Chart.js line graph showing:

  * Temperature trends
  * Humidity trends
  * AQI trends
* Hosted on **GitHub Pages**
* Uses **Blynk HTTPS API**
* No backend hosting required

### ☁ Cloud Integration

* Secure Blynk device authentication
* Cloud datastream history fetch
* Remote access from mobile or laptop

---

## 🧩 System Architecture

```
Sensors  ---> ESP8266 ----> Blynk Cloud ----> Web Dashboard (JS)
 Actuators -^           <---- Remote Control (toggles)
```

### Hardware Flow

| Component     | Function                  |
| ------------- | ------------------------- |
| DHT11         | Temperature & Humidity    |
| MQ Gas Sensor | Air Quality               |
| PIR Sensor    | Human movement            |
| IR Pair       | People counting           |
| Flame Sensor  | Fire Detection            |
| Servo Motor   | Fan rotation              |
| Buzzer        | Alarm                     |
| ESP8266       | Central controller & WiFi |

### Software Flow

* ESP8266 sends sensor values to datastreams (V0-V5)
* Auto-mode logic executed inside ESP
* Dashboard fetches data via REST API
* Dashboard writes back commands (V10-V12)

---

## 🛠 Hardware Requirements

* ESP8266 (Wemos D1 Mini / NodeMCU)
* DHT11 Temperature & Humidity Sensor
* MQ-135 (or MQ-2/MQ-3 variant)
* PIR Motion Sensor
* Flame IR Sensor
* IR Obstacle Pair
* Servo Motor (SG90)
* Buzzer
* LED
* Jump wires + Breadboard
* 5V Power Supply / USB

---

## 🧪 Software Requirements

* Arduino IDE 2.x
* ESP8266 board package
* Required libraries:

  ```
  Blynk
  BlynkSimpleEsp8266
  DHT Sensor Library
  Servo.h
  ```
* GitHub Pages for hosting
* Chart.js for visualization
* Blynk Cloud Tokens

---

## 🌐 Deployment

### 📍 Flash ESP8266

1. Paste your Wi-Fi SSID + Password
2. Add Blynk template ID & Auth Token
3. Flash via Arduino IDE
4. Open Serial Monitor @ 115200 baud
5. Verify:

   ```
   Connecting to WiFi...
   Ready!
   Connected to Blynk
   ```

### 📍 Host Dashboard

1. Upload `index.html`, `style.css`, `script.js`
2. Push to GitHub
3. Enable GitHub Pages
4. Open hosted URL

### 💬 Data Fetching

Web dashboard automatically:

* Pulls live data via `external/api/get`
* Writes toggles via `external/api/update`
* Fetches history via Blynk REST v1 API

---

## 🔐 Blynk Virtual Pins Mapping

| Pin | Function          |
| --- | ----------------- |
| V0  | Temperature       |
| V1  | Humidity          |
| V2  | AQI               |
| V3  | Motion            |
| V4  | Flame             |
| V5  | Occupancy         |
| V10 | Fan Control       |
| V11 | Buzzer Control    |
| V12 | Auto Mode Control |

---

## 🎨 Dashboard UI Features

* Glass-morphism card UI
* Animated toggle switches
* Color-coded feedback
* History visualization
* Cloud token obfuscated
* Responsive layout

---

## 🚀 Real-World Use Cases

* Smart classrooms
* Laboratory safety systems
* Server room monitoring
* Hostel/PG rooms
* Research IoT projects
* Home automation demos

---

## 🧭 How It Can Be Improved in Future (Future Scope)

### 1. Machine Learning Insights 🧠

* Predict occupancy patterns
* Predict fire probability using sensor fusion
* Forecast temperature/humidity trends

### 2. Full Home Automation Expansion 🏠

Integrate:

* Smart lights
* AC automation
* Smart locks
* Energy metering

### 3. Air Purification Control 🌬

* Turn ON air purifier automatically
* Ventilation fan automation

### 4. Mobile App (Custom UI) 📱

* Flutter / React Native apps
* Push notifications

  * Fire detected!
  * Room full
  * AQI hazardous

### 5. Voice Assistant Integration 🎙

* Google Assistant
* Alexa Skills
* Siri Shortcuts

### 6. Safety Compliance & Logs 📂

* Timestamped fire incident logs
* CSV download of history
* Multi-user access

### 7. Object Detection Camera 📷

* Real-time streaming
* Intrusion alerts
* Attendance counter

### 8. MQTT Broker Support 🛰

* Use Mosquitto/EMQX
* Send messages to multiple dashboards

### 9. On-Device Processing ⚡

* ESP32 upgrade
* Handle analytics offline

### 10. Battery + Solar Backup 🔋

* UPS module
* Solar-charging setup
* 24/7 autonomous deployment

---

## 📦 Optional Enhancements

| Idea                                  | Benefit                  |
| ------------------------------------- | ------------------------ |
| Replace DHT11 with DHT22              | Higher accuracy          |
| Replace MQ-2 with MQ-135              | Better AQI accuracy      |
| Replace SG90 servo with relay control | Real fan power switching |
| Add GSM backup                        | Operates without Wi-Fi   |
| Add OLED display                      | Local reading output     |

---

## 🔍 Troubleshooting

| Issue                     | Solution             |
| ------------------------- | -------------------- |
| Dashboard shows undefined | Check Blynk PINs     |
| Device offline            | Wrong Wi-Fi/pass     |
| Flame always ON           | Invert digital logic |
| Graph flat                | Check sensor wiring  |
| No history                | Enable Blynk storage |

---

## 🏁 Conclusion

SSEMR demonstrates:

* Environmental sensing
* Real-time automation
* IoT cloud connectivity
* Data visualization
* Smart safety systems

It can evolve into a full-scale **IoT-based building automation system**, bridging hardware, cloud systems, and UI engineering.

