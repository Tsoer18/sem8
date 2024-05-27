import React, { FC, useCallback, useEffect, useState } from "react";
import {
    Modal,
    SafeAreaView,
    Text,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { Device } from "react-native-ble-plx";

type DeviceModalProps = {
    visible: boolean;
    writeCharacteristicWithResponseForDevice: (Code: string) => void;
    OpenInfoModal: () => void;
    Authinfo: string;
    disconect: () => void;
    OpenAdminModal: () => void;
}

const DeviceAuthModal: FC<DeviceModalProps> = (props) => {
    const { visible, writeCharacteristicWithResponseForDevice, Authinfo, OpenInfoModal, disconect , OpenAdminModal} = props

    useEffect(() => {
        console.log('Incoming text changed:', Authinfo);
        if (Authinfo == "Success") {
            OpenInfoModal();
        }

        if (Authinfo == "Admin"){
            OpenAdminModal();
            console.log("admin works");
        }

    }, [Authinfo]);

    const [values, setValues] = useState<number[]>([]);


    const updateValue = (code: number) => {
        if (values.length == 6) {
            setValues([]);
        }
        setValues(values => [...values, code]);

    }

    const submitButton = async () => {
        let mystring: string = values.toString();
        writeCharacteristicWithResponseForDevice(mystring);
        setValues([]);
    }

    const deletenumber = () => {
        setValues(values.slice(0, -1));
    }

    const disconnectFromDevice = async () => {
        disconect();
    }

    return (
        <Modal
            style={modalStyle.modalContainer}
            animationType="slide"
            transparent={false}
            visible={visible}>
            <SafeAreaView
                style={modalStyle.modalContainer}>
                <TouchableOpacity
                    style={modalStyle.submitButton}
                    onPress={disconnectFromDevice}>
                    <Text style={modalStyle.ctaButtonText}>disconnectFromDevice</Text>
                </TouchableOpacity>
                <View style={modalStyle.buttonColum}>
                    <View style={modalStyle.buttonRow}>
                        <TouchableOpacity
                            style={modalStyle.ctaButton}
                            onPress={() => updateValue(7)}>
                            <Text style={modalStyle.ctaButtonText}>7</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={modalStyle.ctaButton}
                            onPress={() => updateValue(8)}>
                            <Text style={modalStyle.ctaButtonText}>8</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={modalStyle.ctaButton}
                            onPress={() => updateValue(9)}>
                            <Text style={modalStyle.ctaButtonText}>9</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={modalStyle.buttonRow}>
                        <TouchableOpacity
                            style={modalStyle.ctaButton}
                            onPress={() => updateValue(4)}>
                            <Text style={modalStyle.ctaButtonText}>4</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={modalStyle.ctaButton}
                            onPress={() => updateValue(5)}>
                            <Text style={modalStyle.ctaButtonText}>5</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={modalStyle.ctaButton}
                            onPress={() => updateValue(6)}
                        >
                            <Text style={modalStyle.ctaButtonText}>6</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={modalStyle.buttonRow}>
                        <TouchableOpacity
                            style={modalStyle.ctaButton}
                            onPress={() => updateValue(1)}>
                            <Text style={modalStyle.ctaButtonText}>1</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={modalStyle.ctaButton}
                            onPress={() => updateValue(2)}>
                            <Text style={modalStyle.ctaButtonText}>2</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={modalStyle.ctaButton}
                            onPress={() => updateValue(3)}>
                            <Text style={modalStyle.ctaButtonText}>3</Text>
                        </TouchableOpacity>

                    </View>                    
                    <View style={modalStyle.textBox}>
                        <Text style={modalStyle.text}>
                        {Authinfo}
                        </Text>
                    </View>
                    <View style={modalStyle.textBox}>
                        <Text style={modalStyle.text}>
                            {values}
                        </Text>
                    </View>
                    <View style={modalStyle.buttonRowButtom}>
                        <TouchableOpacity
                            onPress={submitButton}
                            style={modalStyle.submitButton}>

                            <Text style={modalStyle.ctaButtonText}>
                                Send Code to lock
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={deletenumber}
                            style={modalStyle.submitButton}>

                            <Text style={modalStyle.ctaButtonText}>
                                delete
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

const modalStyle = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "#f2f2f2",
    },
    buttonColum: {
        margin: 20,
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-evenly"
    },
    buttonRow: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-evenly"
    },
    buttonRowButtom: {
        flexDirection: "row",
    },
    ctaButton: {
        flex: 1,
        backgroundColor: "#FF6060",
        justifyContent: "center",
        alignItems: "center",
        height: 50,
        marginHorizontal: 20,
        marginBottom: 5,
        borderRadius: 8,
    },
    submitButton: {
        backgroundColor: "#FF6060",
        justifyContent: "center",
        alignItems: "center",
        height: 50,
        marginHorizontal: 20,
        marginBottom: 5,
        borderRadius: 8,
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
    ctaButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
    },
    text: {
        alignSelf: "center",
        fontSize: 18,
        fontWeight: "bold",
        color: "black"
    },
});
export default DeviceAuthModal