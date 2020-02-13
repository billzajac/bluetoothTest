A react-native app with BLE beacon capabilities
====================================================
* react-native
    * https://facebook.github.io/react-native/docs/getting-started
    * https://snack.expo.io/
    * https://facebook.github.io/react-native/docs/running-on-device
    * https://www.toptal.com/react-native/react-native-for-android-development

* https://github.com/innoveit/react-native-ble-manager
    * Thanks to: https://github.com/lijeffrey39/bluetoothTest

Install
============

```
git clone https://github.com/billzajac/bluetoothTest
cd bluetoothTest
yarn
```

Develop / Test
===============

```
npx react-native start         # In one terminal
npx react-native run-android   # In another terminal
```

Build APK
================

* https://www.instamobile.io/android-development/generate-react-native-release-build-android/

Generate a keyfile
---------------------

```
keytool -genkey -v -keystore windupworkshop.keystore -alias windupworkshop -keyalg RSA -keysize 2048 -validity 10000
```

* NOTE FROM OUTPUT: The JKS keystore uses a proprietary format. It is recommended to migrate to PKCS12 which is an industry standard format using
```
keytool -importkeystore -srckeystore windupworkshop.keystore -destkeystore windupworkshop.keystore -deststoretype pkcs12
```

Build the APK
---------------------

* Add the passwords to android/app/build.gradle
```
perl -i -pe "s/PASSWORD/'ACTUAL_PASSWORD'/" android/app/build.gradle
```

* Copy the keystore file in place
```
cp windupworkshop.keystore bluetoothTest/android/app/
```

* Bundle and Build
```
mkdir android/app/src/main/assets/
react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

cd android
./gradlew assembleRelease
```

* Hackey but working Bundle and Build
```
mkdir android/app/src/main/assets/
react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle

cd android
./gradlew assembleRelease
rm app/src/main/res/raw/app.json
./gradlew assembleRelease
```

* FIXME: Error about duplicate file in src and build - tiny json file with name and projectName
* SOLUTION: rm app/src/main/res/raw/app.json
* NOTE: Also tried running react-native bundle without --assets-dest arg
```
> Task :app:mergeReleaseResources FAILED
[raw/app] /mnt/d/google-drive/code/react/bluetoothTest/android/app/src/main/res/raw/app.json    [raw/app] /mnt/d/google-drive/code/react/bluetoothTest/android/app/build/generated/res/react/release/raw/app.json: Error: Duplicate resources
```

Copy and Install the APK
---------------------

* Copy the file to Downloads dir then copy to phone
```
cd ..
cp android/app/build/outputs/apk/release/app-release.apk /mnt/d/Downloads/
```


Environment Setup / Recipe (using Windows Terminal with WSL Ubuntu)
-----------

* Install JDK + Android SDK
    * NOTE: /mnt/c/Users/William/AppData/Local/Android/sdk/platform-tools/adb --version
```
apt install openjdk-8-jdk
# Download the android sdk command line tools from: https://developer.android.com/studio#downloads
mv /mnt/d/Downloads/sdk-tools-linux-4333796.zip .
apt install unzip
unzip sdk-tools-linux-4333796.zip
mkdir -p ~/Android/Sdk
mv tools ~/Android/Sdk/

# Download Java JDK from: https://adoptopenjdk.net/
mv /mnt/d/Downloads/OpenJDK8U-jdk_x64_linux_hotspot_8u242b08.tar.gz .
tar xf OpenJDK8U-jdk_x64_linux_hotspot_8u242b08.tar.gz
mv jdk8u242-b08/ /opt

echo "export ANDROID_HOME=$HOME/Android/Sdk" >> ~/.profile
echo "export JAVA_HOME=/opt/jdk8u242-b08" >> ~/.profile
echo "export PATH=$PATH:$ANDROID_HOME/platform-tools" >> ~/.profile
echo "export PATH=$PATH:$ANDROID_HOME/tools/bin" >> ~/.profile
source ~/.profile

# Install adb
sdkmanager "platform-tools"

# Test adb and find devices
adb devices
```

* Install NodeJS
    * https://github.com/nodesource/distributions/blob/master/README.md
```
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
```

* Install React Native
    * Followed instructions here: https://stackoverflow.com/questions/42614347/running-react-native-in-wsl-with-the-emulator-running-directly-in-windows/46375361
```
npm install -g react-native-cli
```

* Initialize the project and update it
```
react-native init BLEChecklist
cd BLEChecklist
npm install --save core-js@^3
```

* Maybe fix bugs/warnings
```
npm audit fix
```

* Update the index.js tp point to the src directory
```
mkdir src
perl -i -pe "s/\.\/App/\.\/src\/App/" index.js
```

* Add beacon library and dependencies
    * https://github.com/innoveit/react-native-ble-manager
```
yarn add react-native-ble-manager
```
