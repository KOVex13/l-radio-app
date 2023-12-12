import React from 'react';
//import { AppState, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import BackgroundTimer from 'react-native-background-timer';
import { Ionicons } from '@expo/vector-icons'; 
import { FlatList, Input, Pressable, Text, Box, Button, Icon } from 'native-base';
//import SelectDropdown from 'react-native-select-dropdown';
//import { SelectList } from 'react-native-dropdown-select-list'
//import { images } from '../res/images';

class Cities extends React.Component {
	constructor(props) {
		super(props);
    	const location = this.props.restoreData('location');
    	const stream = this.props.restoreData('stream');
		this.state = {
			isBusy: false,
			searchString: null,
			cityList: [],
			location: null,
			sream: null
		}

		this.getCityList = this.getCityList.bind(this);
		this.handleClear = this.handleClear.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSelect = this.handleSelect.bind(this);
		this.handleLocation = this.handleLocation.bind(this);
	}

    async getCityList() {
    	const { cityList } = this.state;
    	try {
	    	const location = await this.props.restoreData('location');
	    	const stream = await this.props.restoreData('stream');
	    	this.setState({
	    		searchString: location.value || '',
				location: location,
				sream: stream
	    	});
			const response = await fetch('https://lradio.ru/json/get_city_list/');
			const json = await response.json();
			if (json.ok) {
				this.setState({ 
					cityList: json.city_list.map(city => { return { key: city.id, area: city.area, localitie: city.localitie, value: city.localitie_name }; })
				});
			}
		} catch (error) {
		  	console.log(error);
		}
    }

    handleClear() {
    	console.log('handleClear');
    	this.setState({
    		searchString: ''
    	});
    }

    handleChange(value) {
    	this.setState({
    		searchString: value
    	});
    }

    async handleSelect(item) {
    	console.log(item);
    	this.setState({
    		searchString: item.value,
    		location: item
    	});
		await this.props.storeData('location', item);
		await this.props.getStream();
    }

    async handleLocation() {
    	const { isBusy } = this.state;
    	this.setState({
    		isBusy: true,
    	});
    	if (!isBusy) {
			await this.props.getLocation();
			await this.props.getStream();
	    	let locationValue = await this.props.restoreData('location');
	    	let streamValue = await this.props.restoreData('stream');
	    	this.setState({
	    		searchString: `${locationValue.area}, ${locationValue.localitie}`,
	    		location: locationValue,
	    		stream: streamValue
	    	});
    	}
    	this.setState({
    		isBusy: false,
    	});
    }

	componentDidMount() {
		this.getCityList();
	}

	componentWillUnmount() {
	}

	render() {
		const { isBusy, cityList, searchString, location } = this.state;
		return (
			<>
				<Box 
					alignItems="center" 
					justifyContent="flex-start" 
					bg={{
					    linearGradient: {
							colors: ['black', 'black', '#6B11FE'],
							locations: [0, 0.1, 0.95],
							start: [0, 0.9],
							end: [1, 1]
					    }
					}}
					_android={{
						pt: 10
					}}
					_ios={{
						pt: 24
					}}
					pb="0"
					px="0" 
					height="100%"  
					width="100%"
				>
					<Input 
						colorScheme="yellow"
						value={searchString}
						mx="2"
						my="4"
						_android={{
							py: 2
						}}
						_ios={{
							py: 4
						}}
						size="sm"
						color="white"
						InputLeftElement={
							<Icon
								size={6} 
								ml="2"
								as={<Ionicons name="search" />}
								color="muted.400" 
							/>
						}
						InputRightElement={
							searchString ?
							<Pressable onPress={() => this.handleClear()}>
								<Icon
									size={6} 
									mr="2"
									as={<Ionicons name="close" />}
									color="muted.400" 
								/>
							</Pressable>
							:
							<></>
						}
						placeholder="Введите ваш город"
						onChangeText={this.handleChange}
					/>
					<Box 
						px="2"
						w="100%"
					>
						{ isBusy ?
							<Button 
								variant="subtle"
								colorScheme="yellow"
								justifyContent="flex-start"
								_loading={{
									bg: '#ff7900',
									_text: {
										color: '#000000'
									}
								}}
								_spinner={{
								    color: "#000000"
								}}
								_light={{
									bg: '#ff7900',
									_text: {
										color: '#000000'
									}
								}}
								_dark={{
									bg: '#ff7900',
									_text: {
										color: '#000000'
									}
								}}
								pl="2" 
								pr="4"
								py="2"
								isLoading
								isLoadingText="Подождите ..."
							/>
						:
							<Button 
								variant="subtle"
								colorScheme="yellow"
								justifyContent="flex-start"
								_light={{
									bg: '#ff7900',
									_text: {
										color: '#000000'
									}
								}}
								_dark={{
									bg: '#ff7900',
									_text: {
										color: '#000000'
									}
								}}
								pl="0" 
								pr="4"
								py="2"
								leftIcon={<Icon
									size={6} 
									ml="2"
									as={<Ionicons name="md-location-sharp" />}
									color="#000000" 
								/>}
								onPress={() => { this.handleLocation() }}
							>
								Определить местоположение
							</Button>
						}
					</Box>
					<FlatList 
						px="2"
						w="100%"
						data={ cityList.filter((item) => { 
							return !searchString ? false : item.value.toLowerCase().indexOf(searchString.toLowerCase()) !== -1; 
						}) } 
						renderItem={({ item }) => 
							<Button 
								variant="ghost"
								colorScheme="yellow"
								justifyContent="flex-start"
								borderBottomWidth="1" 
								borderColor={location.key === item.key ? '#ff7900' : 'white'} 
								_light={{
									_text: {
										color: location.key === item.key ? '#ff7900' : 'white',
									}
								}} 
								_dark={{
									_text: {
										color: location.key === item.key ? '#ff7900' : 'white',
									}
								}} 
								pl="3" 
								pr="4"
								py="3"
								onPress={() => { this.handleSelect(item) }}
							>
								<Text color="white">{item.value}</Text>
							</Button>
						}
					/>
				</Box>
			</>
		);
	}
}

export default Cities;