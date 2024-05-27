import React, { FC, useCallback, useEffect, useState } from "react";
import {
    Modal,
    SafeAreaView,
    Text,
    StyleSheet,
    TouchableOpacity,
    View,
    TextInput,
} from "react-native";


type DeviceModalProps = {
    visible: boolean
    UpdateStatus: string
    Adminclose: () => void;
    ChangeAdminCode: (Code: string) => void;
    ChangeCode: (Code: string) => void;
}


const DeviceAdminModal: FC<DeviceModalProps> = (props) => {
    const { visible, UpdateStatus, Adminclose, ChangeAdminCode, ChangeCode } = props
    const [code, onChangeCode] = useState("");
    const [Admincode, onChangeAdminCode] = useState("");
    const [SentCode, SetSentCode] = useState("");


    const closeModal = async () => {
        Adminclose();
        onChangeAdminCode("");
        onChangeCode("");
    }

    const SubmitAdminCode = async () => {
        let commaSeparatedString = Admincode.split('').join(',');
        ChangeAdminCode(commaSeparatedString);
        SetSentCode(commaSeparatedString);
        onChangeAdminCode("");
    }

    const SubmitCode = async () => {
        let commaSeparatedString = code.split('').join(',');
        ChangeCode(commaSeparatedString);
        SetSentCode(commaSeparatedString);
        onChangeCode("");
    }


    return (
        <Modal
            style={modalStyle.modalContainer}
            animationType="slide"
            transparent={false}
            visible={visible}
        >
            <SafeAreaView style={modalStyle.modalContainer}>
                <TouchableOpacity
                    style={modalStyle.submitButton}
                    onPress={closeModal}>
                    <Text style={modalStyle.ctaButtonText}>disconnectFromDevice</Text>
                </TouchableOpacity>
                <View style={modalStyle.textBox}>
                    <Text style={modalStyle.text}>
                        {UpdateStatus}
                    </Text>
                </View>
                <View style={modalStyle.buttonColum} >
                    <TextInput
                        style={modalStyle.input}
                        placeholderTextColor='red'
                        underlineColorAndroid='red'
                        onChangeText={onChangeCode}
                        value={code}
                        placeholder="Change Code"
                        keyboardType="numeric"
                    />
                    <TouchableOpacity
                        style={modalStyle.submitButton}
                        onPress={SubmitCode}>
                        <Text style={modalStyle.ctaButtonText}>Change Code</Text>
                    </TouchableOpacity>

                    <TextInput
                        style={modalStyle.input}
                        placeholderTextColor='red'
                        underlineColorAndroid='red'
                        onChangeText={onChangeAdminCode}
                        value={Admincode}
                        placeholder="Change admin Code"
                        keyboardType="numeric"
                    />
                    <TouchableOpacity
                        style={modalStyle.submitButton}
                        onPress={SubmitAdminCode}>
                        <Text style={modalStyle.ctaButtonText}>Change admin Code</Text>
                    </TouchableOpacity>
                </View>


            </SafeAreaView>
        </Modal >
    );
};


const modalStyle = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "#f2f2f2",
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        color: 'green',
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

export default DeviceAdminModal;