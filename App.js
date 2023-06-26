import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NativeBaseProvider, Text, Box } from "native-base";
import { LinearGradient } from 'expo-linear-gradient';

import LRadioApp from './src/l-radio-app.jsx';

export default () => {
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
