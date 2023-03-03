import React from 'react';
import { AppState, StyleSheet } from 'react-native';
//import * as BackgroundFetch from 'expo-background-fetch';
//import * as TaskManager from 'expo-task-manager';
//import Icon from 'react-native-vector-icons/Ionicons';
//import { Ionicons } from '@expo/vector-icons';
import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
import BackgroundTimer from 'react-native-background-timer';
//import * as eva from '@eva-design/eva';
//import { Layout, Text, Avatar, Input, Button } from '@ui-kitten/components';
import { Text, Box, Button, Container, Image } from 'native-base';
//import { LinearGradient } from 'expo-linear-gradient';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { images } from '../res/images';
//import { app } from '../library/networking';

class Player extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			BACKGROUND_FETCH_TASK: 'lradio-app-background-fetch',
			appState: AppState.currentState,
			channelId: null,
			notificationId: null,
			audio: 'https://air.unmixed.ru/lradio256chelyabinsk',
			playingRecording: false,
			isBusy: false,
			intervalId: null,
			playingArtist: '',
			playingTrack: '',
			soundObject: undefined 
		}

		this.handlePlayAudio = this.handlePlayAudio.bind(this);
		this.getCurrentTrack = this.getCurrentTrack.bind(this);
		this.onDisplayNotification = this.onDisplayNotification.bind(this);
		this.onCancelNotification = this.onCancelNotification.bind(this);
		this.DisplayNotification = this.DisplayNotification.bind(this);
	}

	async onDisplayNotification() {
		const { playingRecording, isBusy, playingArtist, playingTrack } = this.state;
		// Request permissions (required for iOS)
		await notifee.requestPermission();
		// Create a channel (required for Android)
		const channelId = await notifee.createChannel({
		  	id: 'lradio-app',
		  	name: 'L Radio',
		  	badge: false,
		  	vibration: false,
		  	importance: AndroidImportance.LOW,
		});

		this.setState({ channelId: channelId });
		this.DisplayNotification();

    	notifee.onBackgroundEvent(async ({ type, detail }) => {
    		if (type === EventType.ACTION_PRESS) {
    			console.log(detail.pressAction.id);
	      		if (detail.pressAction.id === 'play') {
	        		this.handlePlayAudio();
	      		} else if (detail.pressAction.id === 'pause') {
	        		this.handlePlayAudio();
	      		}
    		}
    	});
	}

	async onCancelNotification() {
		const { notificationId } = this.state;
		if (notificationId) {
			await notifee.cancelNotification(notificationId);
			this.setState({ notificationId: null });
		}
	}

	async DisplayNotification() {
		const { playingRecording, isBusy, playingArtist, playingTrack, channelId } = this.state;
		const actions = [];
		if (isBusy) {
			actions.push({
		        title: 'Processing',
		        //icon: 'https://lradio.ru/i/icons/button-stop.png',
		        pressAction: { id: 'processing' },
			});
		} else {
			if (playingRecording) {
				actions.push({
			        title: 'Pause',
			        //icon: 'https://lradio.ru/i/icons/button-stop.png',
			        pressAction: { id: 'pause' },
				});
			} else {
				actions.push({
			        title: 'Play',
			        //icon: 'https://lradio.ru/i/icons/button-play.png',
			        pressAction: { id: 'play' },
				});
			}
		}
		const notificationId = await notifee.displayNotification({
			id: 'lradio-app',
		  	title: playingArtist,
		  	body: playingTrack,
		  	android: {
			    channelId,
			    badge: false,
			    largeIcon: require('../res/images/favicon.png'),
			    smallIcon: 'ic_launcher_round', // optional, defaults to 'ic_launcher'.
			    // pressAction: {
			    //  	id: playingRecording ? 'pause' : 'play',
			    // },
			    autoCancel: false,
			    onlyAlertOnce: true,
			    actions: actions,
			    importance: AndroidImportance.LOW,
			    ongoing: true
		  	},
		});
		this.setState({ notificationId: notificationId });
	}

    async getCurrentTrack() {
    	const { playingArtist, playingTrack, notificationId } = this.state;
    	try {
			const response = await fetch('https://air.unmixed.ru/status-json.xsl');
			const json = await response.json();
			json?.icestats?.source?.forEach((track) => {
	            if (track.listenurl.match(/\/lradiomaster1$/)) {
	            	let changed = false;
	                const trackTitleEncoded = decodeURIComponent(escape(track.title));
	                const trackTitle = trackTitleEncoded.replace("'", "\'").split('-');
	                if (trackTitle[0].trim() === '«L»') {
	                	trackTitle[0] = '«L» - радио';
	                	trackTitle[1] = '';
	                }
	                if (playingArtist !== (trackTitle[0].trim() || '«L» - радио') && (playingTrack !== trackTitle[1].trim())) {
	                	changed = true;
	                }
					this.setState({ 
						playingArtist: trackTitle[0].trim() || '«L» - радио', 
						playingTrack: trackTitle[1].trim() || ''
					});
					//console.log('AppState: ' + AppState.currentState);
					if (AppState.currentState.match(/inactive|background/)) {
						//console.log(changed);
						if (changed) this.DisplayNotification();
					} else {
						this.onCancelNotification();
					}
	            }
			});
		} catch (error) {
		  	console.log(error);
		}
    }

	handlePlayAudio = () => {
		const { audio, soundObject, playingRecording, isBusy, notificationId } = this.state;
		// console.log('handlePlayAudio');
		if (isBusy) return;
		this.setState({ isBusy: true });
		if (notificationId) this.DisplayNotification();
		// If playing - stop
		if (soundObject) {
			soundObject
				.stopAsync()
				.then(() => {
					return soundObject.unloadAsync();
				})
				.then(() => {
					this.setState({ isBusy: false });
					if (notificationId) this.DisplayNotification();
				})
				.catch((error) => console.log(error));
		}

		if (!playingRecording) {
			Audio.setAudioModeAsync({
			    allowsRecordingIOS: false,
			    staysActiveInBackground: true,
			    interruptionModeIOS: InterruptionModeIOS.DuckOthers,
			    playsInSilentModeIOS: true,
			    shouldDuckAndroid: true,
			    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
			    playThroughEarpieceAndroid: false
			}).then(() => {
				const newSoundObject = new Audio.Sound();
				newSoundObject
					.loadAsync({ uri: audio })
					.then((response) => {
						/*
						newSoundObject.setOnPlaybackStatusUpdate((statusData) => {
							//console.log('statusData: ' + statusData);
							const { didJustFinish } = statusData
							if (didJustFinish) {
								this.setState({ playingRecording: false, soundObject: undefined, isBusy: false })
							}
						})
						*/
						return newSoundObject.playAsync();
					})
					.then(() => {
						this.setState({ playingRecording: true, soundObject: newSoundObject, isBusy: false })
						if (notificationId) this.DisplayNotification();
					})
					.catch((error) => {
						console.log(error);
					})
			}).catch((e) => console.log(e));
		} else {
			//If id is the same reset state
			//await playingAudio.pauseAsync();
			this.setState({ playingRecording: false, soundObject: undefined });
			if (notificationId) this.DisplayNotification();
		}
		// console.log('playingRecording: ' + playingRecording);
	}

	componentDidMount() {
		notifee.deleteChannel('lradio-app');
		BackgroundTimer.runBackgroundTimer(() => { 
			//code that will be called every 3 seconds 
			this.getCurrentTrack();
		}, 5000);
	    this.appStateSubscription = AppState.addEventListener('change', nextAppState => {
			const { notificationId } = this.state;
	        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
				this.onCancelNotification();
	          	console.log('App has come to the foreground!');
	        } else if (this.state.appState === 'active' && nextAppState.match(/inactive|background/)) {
				this.onDisplayNotification();
	          	console.log('App has go to the background!');
	        }
	        this.setState({ appState: nextAppState });
	    });
		/*
		const { intervalId } = this.state;
		if (!intervalId) {
	        const Id = setInterval(() => {
	            this.getCurrentTrack();
	        }, 5000);
	        this.setState({ intervalId: Id });
		}
		*/
	}

	componentWillUnmount() {
		BackgroundTimer.stopBackgroundTimer();
		this.appStateSubscription.remove();
		this.onCancelNotification();
		/*
		const { intervalId } = this.state;
		if (intervalId) {
			clearInterval(intervalId);
	        this.setState({ intervalId: null });
		}
		*/
	}

	render() {
		const { audio, playingRecording, isBusy, playingArtist, playingTrack } = this.state;
		if (audio) {
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
						py="0" 
						px="0" 
						height="100%"  
						width="100%"
					>
						<Box
							width="100%"
						>
							<Image 
								key={`play-${images.logo}`}
								source={images.logo} 
								width="100%" 
								alt="" 
								style={ playingRecording ? '' : {tintColor: 'gray'} }
							/>
							{ !playingRecording ?
								<Image 
									key={`pause-${images.logo}`}
									source={images.logo} 
									width="100%" 
									alt="" 
									style={{
										position: 'absolute',
										top: 0,
										opacity: 0.7,
									}}
	  							/>
							:
								<>
		  						</>
							}
						</Box>
						<Button
							variant="unstyled"
							onPress={() => this.handlePlayAudio()}
						>
							<Image 
								key={ playingRecording ? images.pause : images.play } 
								source={ playingRecording ? images.pause : images.play } 
								size="md" 
								alt=""
								style={ isBusy ? {opacity: 0.7} : '' }
							/>
						</Button>
						<Text 
							mt="3" 
							fontSize="lg"
							bold
							color="white"
						>
							{playingArtist}
						</Text>
						<Text 
							mt="2" 
							fontSize="sm"
							color="amber.500"
						>
							{ playingRecording ? `${playingTrack}` : `Поток на паузе` }
						</Text>
					</Box>
				</>
			);
		}
		return null;
	}
}

export default Player;