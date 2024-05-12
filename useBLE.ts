import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
  BleError,
  BleErrorCode,
  BleManager,
  Device,
  State as BluetoothState,
  LogLevel,
  type DeviceId,
  type TransactionId,
  type UUID,
  type Characteristic,
  type Base64,
  type Subscription
} from 'react-native-ble-plx'


import base64 from "react-native-base64";

const deviceNotConnectedErrorText = 'Device is not connected'
const ServiceUUID = "fff0";
const AuthCharacteristcUUID = "fff1";
const AuthInfoCharacteristcUUID = "fff2";
const DoorStatusUUID = "fff3";
const DoorHandleStatusUUID = "fff4";
const LockStatusUUID = "fff5";
const HeartBeatUUID = "fff6";
const DoorOpen = "fff7";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  AuthInfo: string;
  WriteAuthCodeToDevice:(Code: string) => void;
  openDoor:() => void;
  StartInfomationStream: (device: Device) => void
  DoorStatus: string;
  DoorhandleStatus: string;
  LockStatus: string;
  HeartBeat: string;
}

function useBLE(): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [AuthInfo, setAuthInfo] = useState<string>("..");
  const [DoorStatus, setDoorStatus] = useState<string>("..");
  const [DoorhandleStatus, setDoorHandleStatus] = useState<string>("..");
  const [LockStatus, setLockStatus] = useState<string>("..");
  const [HeartBeat, setHeartBeat] = useState<string>("..");



  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      const apiLevel = parseInt(Platform.Version.toString(), 10)
      if (apiLevel< 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device && device.name?.includes("LocksRUs")) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);
    } catch (e) {
      console.log("FAILED TO CONNECT", e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setAuthInfo("...");
    }
  };

  const OnAuthUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No Data was recieved");
      return -1;
    }

    const rawData = base64.decode(characteristic.value);
    setAuthInfo(rawData);
  };

  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        ServiceUUID,
        AuthInfoCharacteristcUUID,
        OnAuthUpdate
      );
    } else {
      console.log(deviceNotConnectedErrorText);
    }
  };

  const OnDoorUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No Data was recieved");
      return -1;
    }

    const rawData = base64.decode(characteristic.value);
    setDoorStatus(rawData);
  };

  const OnDoorHandleUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No Data was recieved");
      return -1;
    }

    const rawData = base64.decode(characteristic.value);
    setDoorHandleStatus(rawData);
  };
  const OnLockUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No Data was recieved");
      return -1;
    }

    const rawData = base64.decode(characteristic.value);
    setLockStatus(rawData);
  };
  const OnHearBeatUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No Data was recieved");
      return -1;
    }

    const rawData = base64.decode(characteristic.value);
    setHeartBeat(rawData);
  };

  const StartInfomationStream = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        ServiceUUID,
        DoorStatusUUID,
        OnDoorUpdate
      );
      device.monitorCharacteristicForService(
        ServiceUUID,
        DoorHandleStatusUUID,
        OnDoorHandleUpdate
      );
      device.monitorCharacteristicForService(
        ServiceUUID,
        LockStatusUUID,
        OnLockUpdate
      );
      device.monitorCharacteristicForService(
        ServiceUUID,
        HeartBeatUUID,
        OnHearBeatUpdate
      );
    } else {
      console.log(deviceNotConnectedErrorText);
    }
  }

  const openDoor = () =>{
    if(!connectedDevice){
      console.log(deviceNotConnectedErrorText);
    }else{

    
  // Convert the code to Base64 if needed
  let temp  = 1

  let value: Base64 = base64.encode(temp.toString());
    
  bleManager
    .writeCharacteristicWithResponseForDevice(
      connectedDevice.id,
      ServiceUUID,
      DoorOpen,
      value
    )
    .then(() => {
      console.log("Characteristic write successful");
    })
    .catch((error) => {
      console.error("Characteristic write error:", error);
    });
    }

  }
  
  const WriteAuthCodeToDevice = (Code: string) =>{
    if(!connectedDevice){
      console.log(deviceNotConnectedErrorText);
    }else{

    
  // Convert the code to Base64 if needed
  let value: Base64 = base64.encode(Code);
    
  bleManager
    .writeCharacteristicWithResponseForDevice(
      connectedDevice.id,
      ServiceUUID,
      AuthCharacteristcUUID,
      value
    )
    .then(() => {
      console.log("Characteristic write successful");
    })
    .catch((error) => {
      console.error("Characteristic write error:", error);
    });
    }
  };
  

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    AuthInfo,
    WriteAuthCodeToDevice,
    openDoor,
    StartInfomationStream,
    DoorStatus,
    DoorhandleStatus,
    LockStatus,
    HeartBeat,
  };
}

export default useBLE;
