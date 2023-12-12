import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

//import SplashScreen from './screens/splash-screen.jsx';
import Player from './screens/player.jsx';
import Cities from './screens/cities.jsx';

const Stack = createNativeStackNavigator();

class LRadioApp extends React.Component {
	constructor(props) {
		super(props);

		this.storeData = this.storeData.bind(this);
		this.restoreData = this.restoreData.bind(this);
		this.getLocation = this.getLocation.bind(this);
		this.getStream = this.getStream.bind(this);
	}

	async storeData(key, value) {
		try {
			const jsonValue = JSON.stringify(value);
			await AsyncStorage.setItem(key, jsonValue);
		} catch (e) {
			console.log('saving error');
		}
		console.log('Done');
	}

	async restoreData(key) {
		try {
	    	const jsonValue = await AsyncStorage.getItem(key);
	    	return jsonValue != null ? JSON.parse(jsonValue) : null;
		} catch (e) {
			console.log('saving error');
		}
	}

	async getLocation() {
    	let { status } = await Location.requestForegroundPermissionsAsync();
    	console.log('getLocation', status);
      	if (status !== 'granted') {
        	console.log('Permission to access location was denied');
	    } else {
	      	let location = await Location.getCurrentPositionAsync({});
	      	let data = await Location.reverseGeocodeAsync(location.coords);
			await this.storeData('location', {
				area: data[0].region,
				localitie: data[0].city,
				value: `${data[0].city}, ${data[0].region}`
			});
	      	console.log(data);
	    }
	}

    async getStream() {
		let location = await this.restoreData('location');
		try {
			console.log('Get stream for', location);
			const response = await fetch(`https://lradio.ru/json/get_city_stream/?location=${location.area}&location=${location.localitie}&areas=${location.area}&localities=${location.localitie}`);
			const json = await response.json();
			if (json.ok) {
				delete json.ok;
				console.log(json);
				await this.storeData('stream', json.stream);
			}
		} catch (error) {
		  	console.log(error);
		}
    }

	render() {
		return (
			<NavigationContainer>
				<Stack.Navigator>
					<Stack.Screen 
						name="Player" 
						options={{ headerShown: false }} 
					>
						{(props) => <Player {...props} getLocation={this.getLocation} getStream={this.getStream} storeData={this.storeData} restoreData={this.restoreData} />}
					</Stack.Screen>
					<Stack.Screen 
						name="Cities" 
						options={{ headerShown: true, animation: 'slide_from_right', title: 'Ваш город', headerTransparent: true, headerTintColor: 'white' }} 
					>
						{(props) => <Cities {...props} getLocation={this.getLocation} getStream={this.getStream} storeData={this.storeData} restoreData={this.restoreData} />}
					</Stack.Screen>
				</Stack.Navigator>
			</NavigationContainer>
		);
	}
}

export default LRadioApp;