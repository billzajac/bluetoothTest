import React from 'react';
import { Button, NativeModules, NativeEventEmitter, View, Alert } from 'react-native';
import { stringToBytes, bytesToString } from 'convert-string';

import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// https://github.com/innoveit/react-native-ble-manager

export class BlueToothTest extends React.Component{
    constructor() { 
        super();
        this.state = {
            is_scanning: true
        }
        this.beacon = [];
    }

    componentDidMount() {
        // [Android only]
        BleManager.enableBluetooth()
          .then(() => {
            // Success code
            console.log('The bluetooth is already enabled or the user confirm');
          })
          .catch((error) => {
            // Failure code
            console.log('The user refuse to enable bluetooth');
        });

        BleManager.start({showAlert: true})
        .then(() => {
            console.log('Module initialized');
        });

        bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral) => {
            console.log(peripheral.name);
            if (peripheral.name == 'windup2') {
                console.log(peripheral);
                this.beacon = peripheral;
            }
        });

        bleManagerEmitter.addListener(
            'BleManagerStopScan',
            () => {
                console.log('scan stopped');
            }
        );

        bleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            ({ value, peripheral, characteristic, service }) => {
                newBuff = new Uint8Array(value)
                console.log(Boolean(newBuff[58] & (1 << 0)))
                const data = bytesToString(value);
                console.log(`Recieved ${data} for characteristic ${characteristic}`);
            }
        );

        // bleManagerEmitter.addListener(
        //     'BleManagerDisconnectPeripheral',
        //     (() => this.newConnect())
        // );
    }

    startScan() {
        this.peripherals = [];
        this.setState({
            is_scanning: true
        });
        
        BleManager.scan([], 3, true)
        .then(() => { 
            console.log('Scan started');
        });
    }

    startNotification() {
        BleManager.startNotification(this.beacon.id, 
                                    '426C7565-4368-6172-6D42-6561636F6E73',
                                    'c8c51726-81bc-483b-a052-f7a14ea3d281')
        .then(() => {
            // Success code
            console.log('Notification started');
        })
        .catch((error) => {
            // Failure code
            console.log(error);
        });
    }

// Alert.alert('Connected!', 'You are now connected to the peripheral.');

    render() {
        const btnScanTitle = 'Scan Bluetooth (' + (this.state.is_scanning ? 'on' : 'off') + ')';
        return (
            <View style={{margin: 10}}>
            <Button title={btnScanTitle} onPress={() => this.startScan() } />        
          </View>
        );
    }
}
