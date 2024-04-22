import React, { Component } from 'react';
import { BleManager } from 'react-native-ble-plx';
import { Text, View, Button } from 'react-native';

class BLEExample extends Component {
  constructor() {
    super();
    this.manager = new BleManager();
    this.state = {
      devices: [],
      connectedDevice: null,
      receivedValue: ''
    };
  }

  componentDidMount() {
    this.scanAndConnect();
  }

  scanAndConnect = async () => {
    try {
      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error(error);
          return;
        }
        if (!this.state.devices.some(d => d.id === device.id)) {
          this.setState(prevState => ({
            devices: [...prevState.devices, device]
          }));
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  connectToDevice = async device => {
    try {
      const connectedDevice = await device.connect();
      this.setState({ connectedDevice });

      // Subscribe to notifications
      connectedDevice.onDisconnected((error, disconnectedDevice) => {
        this.setState({ connectedDevice: null });
      });

      const services = await connectedDevice.discoverAllServicesAndCharacteristics();
      const characteristic = services.characteristics.find(
        c => c.uuid === '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'
      );

      // Subscribe to notifications
      const subscription = characteristic.monitor((error, characteristic) => {
        if (error) {
          console.error('Error subscribing to characteristic:', error);
          return;
        }
        const receivedValue = characteristic.value;
        this.setState({ receivedValue });
      });

    } catch (err) {
      console.error(err);
    }
  };

  render() {
    return (
      <View>
        <Text>Received Value: {this.state.receivedValue}</Text>
        <Text>Available Devices:</Text>
        {this.state.devices.map(device => (
          <View key={device.id}>
            <Text>{device.name || 'Unknown'}</Text>
            <Button
              title="Connect"
              onPress={() => this.connectToDevice(device)}
            />
          </View>
        ))}
      </View>
    );
  }
}

export default BLEExample;