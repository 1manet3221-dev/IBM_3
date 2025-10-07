#include <DHT.h>
#define DHTPIN D4       // DHT11 connected to D4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

#define SPO2_PIN A0      // MAX30100 I2C or analog pin for SpO2
#define EMG_PIN A1      // EMG on separate analog pin A1

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  // Temperature (°C)
  float temp = dht.readTemperature();
  if (isnan(temp)) temp = 0;

  // SpO2 raw value (placeholder for real sensor library like MAX30100)
  int spo2Raw = analogRead(SPO2_PIN);
  float spo2Percent = map(spo2Raw, 0, 1023, 90, 100); // map to 90-100%

  // EMG raw -> convert to mV (0–1023 → 0–3300mV)
  int emgRaw = analogRead(EMG_PIN);
  float emgMV = (emgRaw * 3300.0 / 1023.0);  
  if (emgMV < 0) emgMV = 0; // remove negatives

  // Heart rate (placeholder, often read from same sensor as SpO2)
  static int bpm = 80;
  bpm = bpm + random(-2, 3);
  if (bpm < 60) bpm = 60;
  if (bpm > 120) bpm = 120;


  // Print results
  Serial.print("Temp (°C): ");
  Serial.println(temp);

  Serial.print("SpO2 (%): ");
  Serial.println(spo2Percent);

  Serial.print("EMG (mV): ");
  Serial.println(emgMV, 3); // show with decimals like 0.111

  Serial.print("Heart Rate (BPM): ");
  Serial.println(bpm);

  delay(500);
}
