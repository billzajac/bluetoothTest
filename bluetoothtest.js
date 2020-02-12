import React from 'react';
import { Button, NativeModules, NativeEventEmitter, View, Alert } from 'react-native';
import { stringToBytes, bytesToString } from 'convert-string';

import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export class BlueToothTest extends React.Component{

    constructor() { 
        super();
        this.state = {
            is_scanning: true
        }
        this.beacon = [];
    }

    componentDidMount() {
        BleManager.start({showAlert: true})
        .then(() => {
            console.log('Module initialized');
        });


        bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral) => {
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
            console.log('scan started');
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


    newConnect() {
        BleManager.connect(this.beacon.id).then(() => {

            // Alert.alert('Connected!', 'You are now connected to the peripheral.');
  
            setTimeout(() => {
              BleManager.retrieveServices(this.beacon.id).then((peripheralInfo) => {
                console.log(peripheralInfo);
                var service = '4f63756c-7573-2054-6872-65656d6f7465';
                var notify = 'c8c51726-81bc-483b-a052-f7a14ea3d281';
                var characteristic = 'c8c51726-81bc-483b-a052-f7a14ea3d282';
  
                setTimeout(() => {
                  BleManager.startNotification(this.beacon.id, service, notify).then(() => {
                    console.log('Started notification on ' + this.beacon.id);
                    setTimeout(() => {
                      BleManager.write(this.beacon.id, service, characteristic, [1, 0]).then(() => {
                        console.log('Write: ' + data);
                      });
  
                    }, 500);
                  }).catch((error) => {
                    console.log('Notification error', error);
                  });
                }, 200);
              });
  
            }, 900);
          }).catch((error) => {
            console.log('Connection error', error);
          });
    }

    render() {
        const btnScanTitle = 'Scan Bluetooth (' + (this.state.is_scanning ? 'on' : 'off') + ')';
        return (
            <View style={{margin: 10}}>
            <Button title={btnScanTitle} onPress={() => this.startScan() } />        
            <Button title={'CONNECT'} onPress={() => this.newConnect() } />
            {/* <Button title={'START NOTIFICATION'} onPress={() => this.startNotification() } />
            <Button title={'WRITE NOTIFICATION'} onPress={() => this.writeNotification() } /> */}
          </View>
        );
    }
}
