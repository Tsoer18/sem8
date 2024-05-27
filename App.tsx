import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceConnectionModal from "./DeviceConnectionModal";
import DeviceAuthModal from "./DeviceAuthModal";
import DeviceInformationModal from "./DeviceInformationModal";
import useBLE from "./useBLE";
import DeviceAdminModal from "./DeviceAdminModal";



const App = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    AuthInfo,
    disconnectFromDevice,
    WriteAuthCodeToDevice,    
    openDoor,
    StartInfomationStream,
    DoorStatus,
    DoorhandleStatus,
    LockStatus,
    HeartBeat,
    WriteCodeChangeToDevcie,
    WriteAdminCodeChangeToDevcie,
    StartCodeChangeListen,
    CodeChangeStatus
  } = useBLE();

  const [isConectionModalVisible, setIsConnectionModalVisible] = useState<boolean>(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState<boolean>(false);
  const [isInformationModalVisible, SetIsInformationModalVisible] = useState<boolean>(false);
  const [isAdminModalVisble, setIsAdminModalVisble] = useState<boolean>(false);

  useEffect(() => {
    console.log('Device disconnect:', connectedDevice);
    if(!connectedDevice){
        hideall();
    }
    
  }, [connectedDevice]);

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  const hideall = () => {
    setIsConnectionModalVisible(false);
    setIsAuthModalVisible(false);
    SetIsInformationModalVisible(false);
    setIsAdminModalVisble(false);
  }

  const OpenAdminModal = () => {
    setIsAdminModalVisble(true);
    setIsAuthModalVisible(false);
    StartCodeChangeListen();
  };

  const hideAdminModal = () => {
    setIsAdminModalVisble(false)
    disconnectFromDevice();
  }

  const openConModal = async () => {
    scanForDevices();
    setIsConnectionModalVisible(true);
  };

  const hideAuthModal =  () => {
    setIsAuthModalVisible(false);
    disconnectFromDevice();
  };

  const openAuthModal = async () => {
    setIsAuthModalVisible(true);
    setIsConnectionModalVisible(false);
  };

  const openInformationModal = async () => {
    setIsAuthModalVisible(false);
    SetIsInformationModalVisible(true);
    if(connectedDevice){
      StartInfomationStream(connectedDevice);
    }
  };

  const hideInformationModal = () => {
    SetIsInformationModalVisible(false);
    disconnectFromDevice();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heartRateTitleWrapper}>
          <Text style={styles.heartRateTitleText}>
            Please Connect to lock
          </Text>
      </View>
      <TouchableOpacity
        onPress={openConModal}
        style={styles.ctaButton}
      >
        <Text style={styles.ctaButtonText}>
          Connect
        </Text>
      </TouchableOpacity>
      <DeviceAdminModal
        visible ={isAdminModalVisble}
        Adminclose={hideAdminModal}
        ChangeAdminCode={WriteAdminCodeChangeToDevcie}
        ChangeCode={WriteCodeChangeToDevcie}
        UpdateStatus = {CodeChangeStatus}
      />
      <DeviceInformationModal
        visible={isInformationModalVisible}
        closeModal={hideInformationModal}
        DoorStatus = {DoorStatus}
        DoorHandleStatus = {DoorhandleStatus}
        LockStatus ={LockStatus}
        HeartBeat = {HeartBeat}
        OpenDoor = {openDoor}
      />
      <DeviceAuthModal
        visible={isAuthModalVisible}
        writeCharacteristicWithResponseForDevice = {WriteAuthCodeToDevice}
        Authinfo = {AuthInfo}
        OpenInfoModal={openInformationModal}
        disconect={hideAuthModal}
        OpenAdminModal={OpenAdminModal}
      />
      <DeviceConnectionModal
        closeModal={openAuthModal}
        visible={isConectionModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  heartRateTitleWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heartRateTitleText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 20,
    color: "black",
  },
  heartRateText: {
    fontSize: 25,
    marginTop: 15,
  },
  ctaButton: {
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
});

export default App;