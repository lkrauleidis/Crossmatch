# About

This iOS/Android mobile application is built using React Native 0.21 and uses the firebase instance at https://blinding-fire-5597.firebaseio.com.

# Requirements

As with all React Native projects, you will need Node and NPM. I have been building with node version 5.3.0 and NPM version 3.5.2, though a more recent version will be sufficient.

# Build Instructions

If not done already:

```
git clone https://<username>@bitbucket.org/dlrice/crossmatch-react-native.git`
```

## For both Android and iOS start with

```
cd crossmatch-react-native
npm cache clean
npm config set registry http://registry.npmjs.org/
npm install
watchman watch-del-all
rm -fr $TMPDIR/react-*
```

## iOS

#### Run on iOS emulator

```
cd ios/
pod install
cd ..
react-native bundle  --minify --dev false --assets-dest ./ios --entry-file index.ios.js --platform ios --bundle-output ios/main.jsbundle
```

then either:

```
open ios/crossmatch.xcworkspace
...build...
```

or 

```
react-native run-ios
```

#### Run on iOS physical device

```
open ios/crossmatch.xcworkspace
```

Replace local_host with your machine's IP address in `AppDelegate.m` then build as usual.


#### When stuff doesn't work on iOS try the following

```
watchman watch-del-all
rm -fr $TMPDIR/react-*
react-native bundle  --minify --dev false --assets-dest ./ios --entry-file index.ios.js --platform ios --bundle-output ios/main.jsbundle
```

#### When stuff REALLY doesn't work
`rm -rf` the repo and start again.


## Android

#### Build and run on Android emulator

```
emulator -avd reactnative
react-native run-android
```

#### Build and run on Android physical device.

```
adb reverse tcp:8081 tcp:8081
react-native run-android
```

# Licence
All code is proprietary and is the intellectual property of Machine Medicine Ltd., UK.


# Additional
watchman watch-del-all
rm -fr $TMPDIR/react-*
./node_modules/react-native/packager/packager.sh start --reset-cache
react-native run-android

© Machine Medicine