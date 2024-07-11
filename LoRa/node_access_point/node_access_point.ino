#include <ArduinoJson.h>
#include <ArduinoJson.hpp>
#include <RHMesh.h>
#include <RH_RF95.h>
#include <SPI.h>
#include "DHT.h"
#include <WiFi.h>
//Libraries for OLED Display
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define BRIDGE_ADDRESS 1  // address of the bridge
#define NODE_ADDRESS 3    // address of this node

// lora SX1276/8
#define LLG_SCK 5
#define LLG_MISO 19
#define LLG_MOSI 27
#define LLG_CS  18
#define LLG_RST 23
#define LLG_DI0 26

//OLED pins
#define OLED_SDA 4
#define OLED_SCL 15 
#define OLED_RST 16
#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

// Digital pin connected to the DHT sensor
#define DHTPIN 4 

// Uncomment whatever DHT sensor type you're using
#define DHTTYPE DHT11   // DHT 11
//#define DHTTYPE DHT22   // DHT 22  (AM2302), AM2321
//#define DHTTYPE DHT21   // DHT 21 (AM2301) 

// #define TXINTERVAL 10000  // delay between successive transmissions
unsigned long interval = 10000;
unsigned long nextTxTime;

#define RH_MESH_MAX_MESSAGE_LEN 50

//oled display object
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RST);

// Network credentials
const char* ssid     = "Node_3-Access-Point";
const char* password = "123456789";

// Set web server port number to 80
WiFiServer server(80);

// Singleton instance of the radio driver
RH_RF95 rf95(LLG_CS, LLG_DI0); // slave select pin and interrupt pin, [heltec|ttgo] ESP32 Lora OLED with sx1276/8

// Class to manage message delivery and receipt, using the driver declared above
RHMesh manager(rf95, NODE_ADDRESS);

DHT dht(DHTPIN, DHTTYPE);
// Variables to hold sensor readings
float temp;
float hum;

void setup() 
{
  Serial.begin(115200);
  //reset OLED display via software
  pinMode(OLED_RST, OUTPUT);
  digitalWrite(OLED_RST, LOW);
  delay(20);
  digitalWrite(OLED_RST, HIGH);

  //initialize OLED
  Wire.begin(OLED_SDA, OLED_SCL);
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3c, false, false)) { // Address 0x3C for 128x32
    Serial.println(F("SSD1306 allocation failed"));
    for(;;); // Don't proceed, loop forever
  }

  //display node address
  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setTextSize(1.5);
  display.setCursor(0,0);
  display.print("node address: ");
  display.print(NODE_ADDRESS);
  display.display();
  Serial.print(F("initializing node "));
  Serial.print(NODE_ADDRESS);
    //Initialize Wi-Fi access point
  Serial.print("Setting AP (Access Point)…");
  WiFi.softAP(ssid, password);
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP);
  server.begin();

  SPI.begin(LLG_SCK,LLG_MISO,LLG_MOSI,LLG_CS);
  if (!manager.init())
    {Serial.println(" init failed");} 
  else
    {Serial.println(" done");}  // Defaults after init are 434.0MHz, 0.05MHz AFC pull-in, modulation FSK_Rb2_4Fd36 

  rf95.setTxPower(10, false); // with false output is on PA_BOOST, power from 2 to 20 dBm, use this setting for high power demos/real usage
  //rf95.setTxPower(1, true); // true output is on RFO, power from 0 to 15 dBm, use this setting for low power demos ( does not work on lilygo lora32 )
  rf95.setFrequency(868.0);
  rf95.setCADTimeout(500);

  // long range configuration requires for on-air time
  boolean longRange = false;
  if (longRange) 
    {
    // custom configuration
    RH_RF95::ModemConfig modem_config = {
      0x78, // Reg 0x1D: BW=125kHz, Coding=4/8, Header=explicit
      0xC4, // Reg 0x1E: Spread=4096chips/symbol, CRC=enable
      0x08  // Reg 0x26: LowDataRate=On, Agc=Off.  0x0C is LowDataRate=ON, ACG=ON
      };
    rf95.setModemRegisters(&modem_config);
    }
  else
    {
    // Predefined configurations( bandwidth, coding rate, spread factor ):
    // Bw125Cr45Sf128     Bw = 125 kHz, Cr = 4/5, Sf = 128chips/symbol, CRC on. Default medium range
    // Bw500Cr45Sf128     Bw = 500 kHz, Cr = 4/5, Sf = 128chips/symbol, CRC on. Fast+short range
    // Bw31_25Cr48Sf512   Bw = 31.25 kHz, Cr = 4/8, Sf = 512chips/symbol, CRC on. Slow+long range
    // Bw125Cr48Sf4096    Bw = 125 kHz, Cr = 4/8, Sf = 4096chips/symbol, low data rate, CRC on. Slow+long range
    // Bw125Cr45Sf2048    Bw = 125 kHz, Cr = 4/5, Sf = 2048chips/symbol, CRC on. Slow+long range
    if (!rf95.setModemConfig(RH_RF95::Bw125Cr45Sf128))
      {Serial.println(F("set config failed"));}
    }
  Serial.println("RF95 ready");
  nextTxTime = millis();
  dht.begin();
}

uint8_t data[RH_MESH_MAX_MESSAGE_LEN];
// Dont put this on the stack:
uint8_t buf[RH_MESH_MAX_MESSAGE_LEN];
uint8_t res;

void loop()
{
  // Listen for incoming clients
  WiFiClient client = server.available();
  if (client) {
    Serial.println("New client connected");
  }
  // send message every TXINTERVAL millisecs
  if (millis() > nextTxTime)
    {
    nextTxTime += TXINTERVAL;
    Serial.print("Sending to bridge n.");
    Serial.print(BRIDGE_ADDRESS);
    Serial.print(" res=");
    
    // New DHT sensor readings
    hum = dht.readHumidity();
    // Read temperature as Celsius (the default)
    temp = dht.readTemperature();
    // Read temperature as Fahrenheit (isFahrenheit = true)
    //temp = dht.readTemperature(true);  
    JsonDocument doc;
    doc["node address"] = NODE_ADDRESS;
    doc["temperature"] = (int)temp;
    doc["humidity"] = hum;

    char str[RH_MESH_MAX_MESSAGE_LEN];
    serializeJson(doc, str);
    for(int i=0; i<=measureJson(doc); i++){data[i] = str[i];}
    // Send a message to a rf95_mesh_server
    // A route to the destination will be automatically discovered.
    res = manager.sendtoWait(data, sizeof(data), BRIDGE_ADDRESS);
    Serial.println(res);
    if (res != RH_ROUTER_ERROR_NONE)
    {
      // Data not delivered to the next node.
      Serial.println("sendtoWait failed. Are the bridge/intermediate mesh nodes running?");
    }
  }
  // radio needs to stay always in receive mode ( to process/forward messages )
  uint8_t len = sizeof(buf);
  uint8_t from;
  if (manager.recvfromAck(buf, &len, &from))
  {
    Serial.print("message from node n.");
    Serial.print(from);
    Serial.print(": ");
    Serial.print((char*)buf);
    Serial.print(" rssi: ");
    Serial.println(rf95.lastRssi());
    if (from == 1){
      char str[len];
      for(int i=0; i<len; i++){str[i] = buf[i];}
      JsonDocument doc;
      deserializeJson(doc, str);
      unsigned long time = doc["time"];
      if (time != 0) {
        interval = time;
        Serial.printf("interval time updated to %lu ms\n", interval);
      }
    } 
  }
}