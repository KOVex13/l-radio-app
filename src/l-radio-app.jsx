import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//import SplashScreen from './screens/splash-screen.jsx';
import Player from './screens/player.jsx';
//import TopicsList from './screens/topics-list.jsx';
//import Topic from './screens/topic.jsx';

const Stack = createNativeStackNavigator();

class LRadioApp extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<NavigationContainer>
				<Stack.Navigator>
					<Stack.Screen name="Player" component={ Player } options={{ headerShown: false }} />
				</Stack.Navigator>
			</NavigationContainer>
		);
	}
}

export default LRadioApp;