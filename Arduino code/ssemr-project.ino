/************* BLYNK DEFINES*************/
#define BLYNK_TEMPLATE_ID "TMPL3lrMknAjW"
#define BLYNK_TEMPLATE_NAME "SSEMR Template"
#define BLYNK_AUTH_TOKEN "oK1qUMHjBnK4GhQOvjz6fPwy5Esl_0xW"
#define BLYNK_PRINT Serial


/************* LIBRARIES *************/
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#include <DHT.h>
#include <Servo.h>

/************* PIN DEFINITIONS *************/
#define DHTPIN D6
#define DHTTYPE DHT11

#define PIR_PIN     D7
#define FLAME_PIN   D5
#define MQ_PIN      A0

#define SERVO_PIN   D1
#define BUZZER_PIN  D2
#define LED_PIN     D0

#define IR1_PIN     D3
#define IR2_PIN     D4

/************* OBJECTS *************/
DHT dht(DHTPIN, DHTTYPE);
Servo fanServo;
BlynkTimer timer;

/************* VARIABLES *************/
bool autoMode = true;
int occupancy = 0;
bool lastIR1 = LOW;
bool lastIR2 = LOW;

/************* SENSOR READ *************/
void readSensors() {
  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();
  int aqi    = analogRead(MQ_PIN);

  if (isnan(temp) || isnan(hum)) {
    Serial.println("⚠️ DHT read failed");
    return;
  }

  bool motion = digitalRead(PIR_PIN);
  bool flame  = digitalRead(FLAME_PIN);

  digitalWrite(LED_PIN, motion);

  if (autoMode) {
    fanServo.write((temp > 30 || aqi > 400) ? 120 : 0);
    digitalWrite(BUZZER_PIN, flame ? HIGH : LOW);
  }

  Blynk.virtualWrite(V0, temp);
  Blynk.virtualWrite(V1, hum);
  Blynk.virtualWrite(V2, aqi);
  Blynk.virtualWrite(V3, motion);
  Blynk.virtualWrite(V4, flame);
  Blynk.virtualWrite(V5, occupancy);

  Serial.print("TEMP=");
  Serial.print(temp);
  Serial.print(" | HUM=");
  Serial.print(hum);
  Serial.print(" | AQI=");
  Serial.println(aqi);
}

/************* OCCUPANCY COUNT *************/
void countPeople() {
  bool ir1 = digitalRead(IR1_PIN);
  bool ir2 = digitalRead(IR2_PIN);

  if (ir1 && !lastIR1) occupancy++;
  if (ir2 && !lastIR2 && occupancy > 0) occupancy--;

  lastIR1 = ir1;
  lastIR2 = ir2;
}

/************* BLYNK CONTROLS *************/
BLYNK_WRITE(V10) {
  if (!autoMode) fanServo.write(param.asInt() ? 120 : 0);
}

BLYNK_WRITE(V11) {
  if (!autoMode) digitalWrite(BUZZER_PIN, param.asInt());
}

BLYNK_WRITE(V12) {
  autoMode = param.asInt();
  Serial.print("MODE: ");
  Serial.println(autoMode ? "AUTO" : "MANUAL");
}

/************* SETUP *************/
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\nBooting setup...");

  pinMode(PIR_PIN, INPUT);
  pinMode(FLAME_PIN, INPUT);
  pinMode(IR1_PIN, INPUT);
  pinMode(IR2_PIN, INPUT);

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  dht.begin();
  fanServo.attach(SERVO_PIN);
  fanServo.write(0);

  Serial.println("Connecting Blynk...");
  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, pass);

  timer.setInterval(2000L, readSensors);
  timer.setInterval(500L, countPeople);
}

/************* LOOP *************/
void loop() {
  Blynk.run();
  timer.run();
}
