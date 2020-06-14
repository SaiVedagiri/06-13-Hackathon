/*
  WiFiEsp example: WebClient
  This sketch connects to google website using an ESP8266 module to
  perform a simple web search.
  For more details see: http://yaab-arduino.blogspot.com/p/wifiesp-example-client.html
*/

#include <SPI.h>
/* Include the RFID library */
#include <RFID.h>

#include "WiFiEsp.h"

// Emulate MySerial on pins 6/7 if not present
#ifndef HAVE_HWSERIAL1
#include "SoftwareSerial.h"

SoftwareSerial Serial1(18, 19); // RX, TX
#endif

#define echoPin 7 // attach pin D2 Arduino to pin Echo of HC-SR04
#define trigPin 39 //attach pin D3 Arduino to pin Trig of HC-SR04

// defines variables
long duration; // variable for the duration of sound wave travel
int distance; // variable for the distance measurement
int olddistance = 0;

char ssid[] = "3xA Wi-Fi";            // your network SSID (name)
char pass[] = "parwan123";        // your network password
int status = WL_IDLE_STATUS;     // the Wifi radio's status
float oldvolume = 0;

String url = "safetravels.macrotechsolutions.us";
char server[] = "safetravels.macrotechsolutions.us";

// twelve servo objects can be created on most boards
#define SDA_DIO 9
#define RESET_DIO 8

RFID RC522(SDA_DIO, RESET_DIO);

// Initialize the Ethernet client object
WiFiEspClient client;

void setup()
{
  // initialize serial for debugging
  Serial.begin(115200);
  // initialize serial for ESP module
  Serial1.begin(115200);
  // initialize ESP module

  pinMode(trigPin, OUTPUT); // Sets the trigPin as an OUTPUT
  pinMode(echoPin, INPUT); // Sets the echoPin as an INPUT

  SPI.begin();
  /* Initialise the RFID reader */
  RC522.init();

  WiFi.init(&Serial1);

  // check for the presence of the shield
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present");
    // don't continue
    while (true);
  }

  // attempt to connect to WiFi network
  while ( status != WL_CONNECTED) {
    Serial.print("Attempting to connect to WPA SSID: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network
    status = WiFi.begin(ssid, pass);
  }

  // you're connected now, so print out the data
  Serial.println("You're connected to the network");

  printWifiStatus();

  Serial.println();
  Serial.println("Starting connection to server...");
  // if you get a connection, report back via serial
}

void loop()
{
  while (!RC522.isCard())
  {
      delay(50);

      digitalWrite(trigPin, LOW);
      delayMicroseconds(2);
      // Sets the trigPin HIGH (ACTIVE) for 10 microseconds
      digitalWrite(trigPin, HIGH);
      delayMicroseconds(10);
      digitalWrite(trigPin, LOW);
      // Reads the echoPin, returns the sound wave travel time in microseconds
      duration = pulseIn(echoPin, HIGH);
      // Calculating the distance
      distance = duration * 0.034 / 2; // Speed of sound wave divided by 2 (go and back)
      if (olddistance > distance + 5 or olddistance < distance - 5) {
        olddistance = distance;
      }
      delay(500);
      digitalWrite(29, HIGH);
      digitalWrite(25, LOW);
      digitalWrite(23, LOW);
  }
  /* If so then get its serial number */
  RC522.readCardSerial();
  String key = "";
  for (int i = 0; i < 5; i++)
  {
    key += String(RC522.serNum[i], DEC);
    //Serial.print(RC522.serNum[i],HEX); //to print card detail in Hexa Decimal format
  }
  Serial.println("Scanned RFID " + key);
  makeCall(key);
  digitalWrite(29, LOW);
  digitalWrite(25, HIGH);
  digitalWrite(23, LOW);
  
  delay(50);
  //while (client.connected() || client.available())
  String result = "";
  for (int x = 0; x < 10; x++)
  {
    if (client.available())
    {
      String line = client.readStringUntil('}');
    }
    delay(1);
  }
  Serial.println("HTTP Success");
  delay(100);
  client.stop();
  delay(500);
}

void makeCall(String key) {
  if (client.connect(server, 80)) {
    Serial.println("Connected to server");
    // Make a HTTP request
    //Serial.println("/hardwareConnect?rfid=" + key + "&busid=-M9ibFAVEKjdDQIch3hB&type=bus&position=2,4&timeid=-M9ibFAa46Xsm3OkwHnC");
    client.println("GET /hardwareConnect?rfid=" + key + "&vehicleid=-M9ibFAVEKjdDQIch3hB&type=bus&position=2,4&timeid=-M9ibFAa46Xsm3OkwHnC HTTP/1.1");
    client.println("Host: " + url);
    client.println();
  }
}


void printWifiStatus()
{
  // print the SSID of the network you're attached to
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength
  long rssi = WiFi.RSSI();
  Serial.print("Signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}
