#include <ArduinoBLE.h>
#include <ESP32Servo.h>

hw_timer_t *timer1 = NULL;

unsigned long previousMillis = 0; // stores the last time LED was updated
const long interval = 4000;       // interval at which to blink (milliseconds)
// create servo object to control a servo
Servo myservo;

// Used pins
constexpr byte POTENTIOMETER1_PIN = 35;
constexpr byte POTENTIOMETER_PIN = 34;
constexpr byte Servo_PIN = 12;

// Define the pins for the buttons
uint8_t buttonPins[9] = {14, 15, 32, 33, 25, 26, 27, 23, 19};

// Define the pin for LEDs

const int yellowLEDPin = 4;
const int greenLEDPin = 5;
const int redLEDPin = 18;

// Define the combination
const int correctCombination[6] = {5, 5, 5, 5, 5, 5};
int enteredCombination[6] = {0, 0, 0, 0, 0, 0};
const String CorrectCombiBLue = ("5,5,5,5,5,5");

int currentIndex = 0;

// Define the state for indicating success or failure
bool success = false;

// Lock bools
bool LastLockState = false;

// door bools
bool LastDoorState;
bool DoorIsOpen = false;
bool LastDoorHandleState;

// timer Duration in secounds
int timerDuration = 10;
int timer2Duration = 20;

// Function prototype
void LockFunction(bool);
void TimerDebug();

// Declare the Task Functions
void TaskDoor(void *pvParameters);
void TaskDoorHandle(void *pvParameters);

// timerBools
bool TimerStop1 = false;
bool TimerStop2 = false;


// Timer inturupt
void IRAM_ATTR onTimer1()
{
  TimerStop1 = true;
}

BLEService myService("fff0");
BLEStringCharacteristic AuthCode("fff1", BLEWrite | BLEEncryption, 31);
BLEStringCharacteristic AuthInfo("fff2", BLERead | BLENotify, 31);
BLEStringCharacteristic DoorStatus("fff3", BLERead | BLENotify, 31);
BLEStringCharacteristic DoorHandleStatus("fff4", BLERead | BLENotify, 31);
BLEStringCharacteristic LockStatus("fff5", BLERead | BLENotify, 31);
BLEStringCharacteristic HeartBeat("fff6", BLERead | BLENotify, 31);
BLEIntCharacteristic DoorOPen("fff7", BLEWrite | BLENotify);
BLEIntCharacteristic timer2info("fff8", BLERead | BLENotify);

// Advertising parameters should have a global scope. Do NOT define them in 'setup' or in 'loop'
const uint8_t completeRawAdvertisingData[] = {0x02, 0x01, 0x06, 0x09, 0xff, 0x01, 0x01, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05};
void switchCharacteristicWritten(BLEDevice central, BLECharacteristic characteristic);
void OpenDoor(BLEDevice central, BLECharacteristic characteristic);
void blePeripheralConnectHandler(BLEDevice central);
void blePeripheralDisconnectHandler(BLEDevice central);

bool wasConnected = 0;
bool acceptOrReject = true;

void setup()
{
  Serial.begin(9600);
  Serial.println("Serial connected");

  // Setup Door task
  xTaskCreate(
      TaskDoor,          // Task function
      "DoorOpenChecker", // Name of the task (for debugging purposes)
      2000,              // Stack size (bytes)
      NULL,              // Parameter to pass to the task (optional)
      1,                 // Priority of the task, ranging from 1 (least important) to 5 (most important)
      NULL);             // Task handle, used to reference the task (optional)

  // Setup DoorHandle
  xTaskCreate(
      TaskDoorHandle,
      "Doorhandle",
      1000,
      NULL,
      1,
      NULL);

  timer1 = timerBegin(0, 80, true);
  timerAttachInterrupt(timer1, &onTimer1, true);

  // Allow allocation of all timers
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);

  // standard 50 hz servo
  myservo.setPeriodHertz(50);

  // attaches the servo to the used pin
  myservo.attach(Servo_PIN, 500, 2400);

  // Set button pins as inputs
  for (int i = 0; i < 9; i++)
  {
    pinMode(buttonPins[i], INPUT_PULLUP);
  }
  // set pinMode
  pinMode(POTENTIOMETER_PIN, INPUT);
  pinMode(POTENTIOMETER1_PIN, INPUT);
  pinMode(yellowLEDPin, OUTPUT);
  pinMode(greenLEDPin, OUTPUT);
  pinMode(redLEDPin, OUTPUT);

  // Callback function with confirmation code when new device is pairing.
  BLE.setDisplayCode([](uint32_t confirmCode)
                     {
    Serial.println("New device pairing request.");
    Serial.print("Confirm code matches pairing device: ");
    char code[6];
    sprintf(code, "%06d", confirmCode);
    Serial.println(code); });

  // Callback to allow accepting or rejecting pairing
  BLE.setBinaryConfirmPairing([&acceptOrReject]()
                              {
    Serial.print("Should we confirm pairing? ");
    delay(5000);
    if(acceptOrReject){
      Serial.println("yes");
      return true;
    }else{
      Serial.println("no");
      return false;
    } });

  // IRKs are keys that identify the true owner of a random mac address.
  // Add IRKs of devices you are bonded with.
  BLE.setGetIRKs([](uint8_t *nIRKs, uint8_t **BDaddrTypes, uint8_t ***BDAddrs, uint8_t ***IRKs)
                 {
    // Set to number of devices
    *nIRKs       = 2;

    *BDAddrs     = new uint8_t*[*nIRKs];
    *IRKs        = new uint8_t*[*nIRKs];
    *BDaddrTypes = new uint8_t[*nIRKs];

    // Set these to the mac and IRK for your bonded devices as printed in the serial console after bonding.
    uint8_t device1Mac[6]    = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
    uint8_t device1IRK[16]   = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};

    uint8_t device2Mac[6]    = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
    uint8_t device2IRK[16]   = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};


    (*BDaddrTypes)[0] = 0; // Type 0 is for pubc address, type 1 is for static random
    (*BDAddrs)[0] = new uint8_t[6]; 
    (*IRKs)[0]    = new uint8_t[16];
    memcpy((*IRKs)[0]   , device1IRK,16);
    memcpy((*BDAddrs)[0], device1Mac, 6);


    (*BDaddrTypes)[1] = 0;
    (*BDAddrs)[1] = new uint8_t[6];
    (*IRKs)[1]    = new uint8_t[16];
    memcpy((*IRKs)[1]   , device2IRK,16);
    memcpy((*BDAddrs)[1], device2Mac, 6);


    return 1; });
  // The LTK is the secret key which is used to encrypt bluetooth traffic
  BLE.setGetLTK([](uint8_t *address, uint8_t *LTK)
                {
    // address is input
    Serial.print("Received request for address: ");
    btct.printBytes(address,6);

    // Set these to the MAC and LTK of your devices after bonding.
    uint8_t device1Mac[6]  = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
    uint8_t device1LTK[16] = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
    uint8_t device2Mac[6]  = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
    uint8_t device2LTK[16] = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
    

    if(memcmp(device1Mac, address, 6) == 0) {
      memcpy(LTK, device1LTK, 16);
      return 1;
    }else if(memcmp(device2Mac, address, 6) == 0) {
      memcpy(LTK, device2LTK, 16);
      return 1;
    }
    return 0; });
  BLE.setStoreIRK([](uint8_t *address, uint8_t *IRK)
                  {
    Serial.print(F("New device with MAC : "));
    btct.printBytes(address,6);
    Serial.print(F("Need to store IRK   : "));
    btct.printBytes(IRK,16);
    return 1; });
  BLE.setStoreLTK([](uint8_t *address, uint8_t *LTK)
                  {
    Serial.print(F("New device with MAC : "));
    btct.printBytes(address,6);
    Serial.print(F("Need to store LTK   : "));
    btct.printBytes(LTK,16);
    return 1; });

  while (1)
  {
    // begin initialization
    if (!BLE.begin())
    {
      Serial.println("starting BLE failed!");
      delay(200);
      continue;
    }
    Serial.println("BT init");
    delay(200);

    BLE.setEventHandler(BLEConnected, blePeripheralConnectHandler);
    BLE.setEventHandler(BLEDisconnected, blePeripheralDisconnectHandler);
    AuthCode.writeValue("test");
    AuthCode.setEventHandler(BLEWritten, switchCharacteristicWritten);
    DoorOPen.setEventHandler(BLEWritten, OpenDoor);

    myService.addCharacteristic(AuthCode);
    myService.addCharacteristic(AuthInfo);
    myService.addCharacteristic(DoorStatus);
    myService.addCharacteristic(DoorHandleStatus);
    myService.addCharacteristic(LockStatus);
    myService.addCharacteristic(HeartBeat);
    myService.addCharacteristic(DoorOPen);
    myService.addCharacteristic(timer2info);

    BLE.addService(myService);

    // Build advertising data packet
    BLEAdvertisingData advData;
    // If a packet has a raw data parameter, then all the other parameters of the packet will be ignored
    advData.setRawData(completeRawAdvertisingData, sizeof(completeRawAdvertisingData));
    // Copy set parameters in the actual advertising packet
    BLE.setAdvertisingData(advData);

    // Build scan response data packet
    BLEAdvertisingData scanData;
    scanData.setLocalName("LocksRUs");

    BLE.setDeviceName("LocksRUs");
    // Copy set parameters in the actual scan response packet
    BLE.setScanResponseData(scanData);

    BLE.setPairable(true);

    if (!BLE.advertise())
    {
      Serial.println("failed to advertise bluetooth.");
      BLE.stopAdvertise();
      delay(500);
    }
    else
    {
      Serial.println("advertising...");
      break;
    }
    BLE.end();
    delay(100);
  }
}

void loop()
{
  BLE.poll();
  // Check if a central is connected
  BLEDevice central = BLE.central();
  // Check if any button is pressed
  unsigned long currentMillis = millis(); // get the current time
  unsigned long timeElapsed = currentMillis - previousMillis;
  if (timeElapsed >= interval)
  {
    
    // Convert timeElapsed to seconds with four decimal points
    float seconds = timeElapsed / 1000.0; // Convert milliseconds to seconds
    char buffer[10]; // Buffer to hold the string

    // Convert float to string with 4 decimal points
    snprintf(buffer, sizeof(buffer), "%.4f", seconds);

    Serial.println(buffer);
    HeartBeat.writeValue(buffer);

    previousMillis = currentMillis;
  }
  

  if (TimerStop1)
  {
    TimerDebug();
    if (LastLockState == true && DoorIsOpen == false)
    {
      LockFunction(false);
    }
    TimerStop1 = false;
  }
  if (TimerStop2)
  {

    if (central && AuthInfo.value() != "Success")
    {
      central.disconnect();
    }
    TimerStop2 = false;
  }

  for (int i = 0; i < 9; i++)
  {
    if (digitalRead(buttonPins[i]) == LOW)
    {
      Serial.print("i is: ");
      Serial.print(i);
      Serial.print(", and buttonPin[i] is:");
      Serial.print(buttonPins[i]);
      Serial.println(", which is now LOW");

      // Button is pressed, register the digit
      enteredCombination[currentIndex] = i + 1; // Add 1 to convert index to digit
      currentIndex++;
      // Serial.println(buttonPins[i]);
      // Serial.println(currentIndex);
      // Turn on the yellow LED momentarily
      digitalWrite(yellowLEDPin, HIGH);
      delay(300);
      digitalWrite(yellowLEDPin, LOW);
      for (int j = 0; j <= 5; j++)
      {
        Serial.println(enteredCombination[j]);
      }
      Serial.println("-----------------");

      // Wait for the button to be released
      while (digitalRead(buttonPins[i]) == LOW)
      {
        delay(200);
      }

      // Check if the entered combination length is 4
      if (currentIndex == 6)
      {
        // Check if the combination is correct
        success = true;
        for (int j = 0; j < 6; j++)
        {
          if (enteredCombination[j] != correctCombination[j])
          {
            success = false;
            break;
          }
        }

        // Light up the appropriate LED based on the success
        if (success && LastLockState == false)
        {
          digitalWrite(greenLEDPin, HIGH);
          LockFunction(true); // call the lockfuntion to upen the lock
        }
        else if (success)
        {
          digitalWrite(yellowLEDPin, HIGH);
          delay(50);
          digitalWrite(yellowLEDPin, LOW);
          delay(50);
          digitalWrite(greenLEDPin, HIGH);
        }
        else
        {
          digitalWrite(redLEDPin, HIGH);
        }

        // Reset the combination and index for next attempt
        currentIndex = 0;
        delay(2000); // Wait for 2 seconds before resetting
        digitalWrite(greenLEDPin, LOW);
        digitalWrite(redLEDPin, LOW);
      }
    }
  }
  delay(200);
}
void TaskDoor(void *pvParameters)
{
  int lastValue = 0;
  while (true)
  {
    // potentiometer value
    int potentiometerValue;

    potentiometerValue = analogRead(POTENTIOMETER_PIN);
    // Serial.println(potentiometerValue);
    if (potentiometerValue >= 50 && LastDoorState == true)
    {
      // Serial.println("Door is open");
    }
    else if (potentiometerValue >= 50)
    {
      DoorIsOpen = true;
      LastDoorState = true;
      Serial.println("Door has opened");
      DoorStatus.writeValue("Door Is Open");
    }
    if (potentiometerValue <= 50 == LastDoorState == true)
    {
      DoorIsOpen = false;
      LastDoorState = false;
      LockFunction(false);
      DoorStatus.writeValue("Door Is Closed");
    }

    delay(200);
  }
}

void TaskDoorHandle(void *PvParameters)
{
  int lastValue = 0;
  while (true)
  {
    // potentiometer value
    int lastValue;
    int potentiometerValue;
    potentiometerValue = analogRead(POTENTIOMETER1_PIN);

    if (potentiometerValue >= 50 == LastDoorHandleState == true)
    {
    }
    else if (potentiometerValue >= 50)
    {
      Serial.println("DoorHandle is opened");
      LastDoorHandleState = true;
      DoorHandleStatus.writeValue("DoorHandle is Open");
    }
    if (potentiometerValue <= 50 == LastDoorHandleState == true)
    {
      Serial.println("DoorHandle is closed");
      LastDoorHandleState = false;
      DoorHandleStatus.writeValue("DoorHandle is closed");
    }
    delay(200);
    lastValue = potentiometerValue;
  }
}

void LockFunction(bool LockState)
{
  int pos = 0;
  if (LockState == true && LastLockState == false)
  {
    timerAlarmWrite(timer1, timerDuration * 1000000, false); // Set the Timer amount
    timerRestart(timer1);                                    // Timer Restart
    timerAlarmEnable(timer1);                                // Start the timer
    LastLockState = LockState;
    pos = 90;
    myservo.write(pos);
    Serial.println("Lock is open");
    LockStatus.writeValue("Lock is Open");
  }
  else if (LockState == false)
  {
    LastLockState = LockState;

    pos = 170;
    myservo.write(pos);
    Serial.println("Lock is closed");
    LockStatus.writeValue("Lock is closed");
    DoorOPen.writeValue(0);
  }
}

void TimerDebug()
{
  Serial.println("Timer Have Run out");
}

void switchCharacteristicWritten(BLEDevice central, BLECharacteristic characteristic)
{
  Serial.print("Characteristic event, written: ");
  Serial.print(AuthCode.value());
  if (AuthCode.value() == CorrectCombiBLue)
  {
    AuthInfo.writeValue("Success");
    Serial.println("Success");
  }
  else
  {
    AuthInfo.writeValue("fail");
    Serial.println("Fails");
  }
}

void OpenDoor(BLEDevice central, BLECharacteristic characteristic){
  char charcode = DoorOPen.value();
  int value = charcode - '0';
  Serial.println(value);
  if(value == 1){
    if(AuthInfo.value() == "Success"){
      LockFunction(true);
    }
  }
}

void blePeripheralConnectHandler(BLEDevice central)
{
  // central connected event handler
  Serial.print("Connected event, central: ");
  Serial.println(central.address());
}

void blePeripheralDisconnectHandler(BLEDevice central)
{
  // central disconnected event handler
  Serial.print("Disconnected event, central: ");
  Serial.println(central.address());
  AuthInfo.writeValue("..");
  AuthCode.writeValue("..");
}