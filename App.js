import React from 'react';
//import notifee from '@notifee/react-native';
import { StatusBar } from 'expo-status-bar';
//import { StyleSheet, Text, View } from 'react-native';
import { NativeBaseProvider, Text, Box } from "native-base";
import { LinearGradient } from 'expo-linear-gradient';
import { useKeepAwake } from 'expo-keep-awake';

import LRadioApp from './src/l-radio-app.jsx';

export default () => {
	useKeepAwake();
	const config = {
		dependencies: {
			'linear-gradient': LinearGradient,
		}
	};

	return (
		<NativeBaseProvider config={config}>
			<LRadioApp />
			<StatusBar animated hidden />
		</NativeBaseProvider>
	);
};
