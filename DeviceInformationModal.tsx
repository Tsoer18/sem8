import React, { FC, useCallback, useState } from "react";
import {
    FlatList,
    ListRenderItemInfo,
    Modal,
    SafeAreaView,
    Text,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { Device } from "react-native-ble-plx";

type DeviceModalProps = {
    visible: boolean
    DoorStatus: string
    DoorHandleStatus: string
    LockStatus: string
    HeartBeat: string
    closeModal: () => void;
    OpenDoor: () => void;
}




const DeviceInformationModal: FC<DeviceModalProps> = (props) => {
    const { visible, DoorStatus, DoorHandleStatus, LockStatus, HeartBeat, closeModal, OpenDoor } = props


    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}>
            <SafeAreaView style={modalStyle.container}>
                <TouchableOpacity
                    style={modalStyle.ctaButton}
                    onPress={closeModal}>
                    <Text style={modalStyle.ctaButtonText}>disconnectFromDevice</Text>
                </TouchableOpacity>
                <View style={modalStyle.buttonColum}>
                <Text style={modalStyle.modalTitleText}>LockSystem Infomation</Text>

                <View style={modalStyle.textBox}>
                    <Text style={modalStyle.text}>Status of the Door: {DoorStatus} </Text>
                </View>
                <View style={modalStyle.textBox}>
                    <Text style={modalStyle.text}>Status of the DoorHandle: {DoorHandleStatus} </Text>
                </View>
                <View style={modalStyle.textBox}>
                    <Text style={modalStyle.text}>Status of the Lock: {LockStatus} </Text>
                </View>
                <View style={modalStyle.textBox}>
                    <Text style={modalStyle.text}>Heartbeat recived within : {HeartBeat} Secounds</Text>
                </View>
                <TouchableOpacity
                    style={modalStyle.ctaButton}
                    onPress={OpenDoor}>
                    <Text style={modalStyle.ctaButtonText}>Open The Door</Text>
                </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    )
}
const modalStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
    },
    buttonColum: {
        margin: 20,
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-evenly"
    },
    modalTitleText: {
        marginTop: 40,
        fontSize: 30,
        fontWeight: "bold",
        marginHorizontal: 20,
        textAlign: "center",
        color: "black"
      },
    buttonRow: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-evenly"
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
        color: "white",
    }, 
    textBox: {
        backgroundColor: "grey",
        justifyContent: "center",
        alignItems: "center",
        height: 50,
        marginHorizontal: 20,
        marginBottom: 5,
        borderRadius: 8,
    },
    text: {
        alignSelf: "center",
        fontSize: 18,
        fontWeight: "bold",
        color: "black"
    },
});

export default DeviceInformationModal