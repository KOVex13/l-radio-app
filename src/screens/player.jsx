import React from 'react';
import { AppState, StyleSheet } from 'react-native';
//import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import BackgroundTimer from 'react-native-background-timer';
import { HStack, Text, Box, Button, Container, Image } from 'native-base';
//import SelectDropdown from 'react-native-select-dropdown';
//import { SelectList } from 'react-native-dropdown-select-list'
import { images } from '../res/images';
import TrackPlayer, {
	AppKilledPlaybackBehavior,
	Capability,
	useTrackPlayerEvents,
	usePlaybackState,
	TrackPlayerEvents,
	STATE_PLAYING,
	Event,
	RepeatMode,
} from 'react-native-track-player';

class Player extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			appState: AppState.currentState,
			audio: 'https://api.lradio.ru/air-mobile',
			isPlaying: false,
			statePlayer: null,
			playingArtist: '',
			playingTrack: '',
			location: {},
			stream: null,
		}

		this.handlePlayAudio = this.handlePlayAudio.bind(this);
		this.getCurrentTrack = this.getCurrentTrack.bind(this);
		this.setupTrackPlayer = this.setupTrackPlayer.bind(this);
		this.setupPlaylist = this.setupPlaylist.bind(this);
	}

	async setupTrackPlayer() {
		const { playingArtist, playingTrack } = this.state;

	    TrackPlayer.setupPlayer().then(async () => {
	      	console.log('Player ready');
		    await TrackPlayer.addEventListener(Event.PlaybackState, (e) => {
		    	console.log('Player state:', e.state);
		    	let isPlaying = e.state === 'playing';
		    	this.setState({ 
		    		isPlaying: isPlaying,
		    		statePlayer: e.state
		    	});
		    });

		    await this.setupPlaylist();

            await TrackPlayer.addEventListener(Event.PlaybackError, (e) => {
                console.log('Player error:', e.code, e.message);
                TrackPlayer.skipToNext();
            });
	      	await TrackPlayer.updateOptions({
	        	stopWithApp: false,
	        	autoHandleInterruptions: true,
	        	capabilities: [
	          		Capability.Play,
	          		Capability.Pause,
	        	],
			    android: {
			        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
			        alwaysPauseOnInterruption: true,
			    },
			    icon: 'ic_launcher_round',
	      	});
	    });

	    TrackPlayer.addEventListener(Event.PlaybackMetadataReceived, (event) => {
	        console.log(event);
	        let trackTitle = [event.artist || '', event.title || ''];
            if (trackTitle[0].trim() === '«L»') {
            	trackTitle[0] = '«L» - радио';
            	trackTitle[1] = '';
            }
			this.setState({ 
				playingArtist: trackTitle[0], 
				playingTrack: trackTitle[1]
			});

			TrackPlayer.updateMetadataForTrack(0, {
				artist: trackTitle[0],
				title: trackTitle[1],
				artwork: require('../res/images/notification-logo.png')
			});

			TrackPlayer.updateMetadataForTrack(1, {
				artist: trackTitle[0],
				title: trackTitle[1],
				artwork: require('../res/images/notification-logo.png')
			});
	    });
	}

	async setupPlaylist() {
		const { audio, location, stream, playingArtist, playingTrack, isPlaying } = this.state;

    	let locationValue = await this.props.restoreData('location');
    	let streamValue = await this.props.restoreData('stream');

		if (!locationValue) {
			await this.props.getLocation();
			await this.props.getStream();
	    	locationValue = await this.props.restoreData('location');
	    	streamValue = await this.props.restoreData('stream');
		}

    	this.setState({
    		location: locationValue,
    		stream: streamValue
    	});

    	console.log(locationValue);
    	console.log(streamValue);

		const songs = [{
			id: 1,
			url: streamValue || audio,
			artist: playingArtist,
			title: playingTrack,
			artwork: require('../res/images/notification-logo.png'),
		}, {
			id: 2,
			url: audio,
			artist: playingArtist,
			title: playingTrack,
			artwork: require('../res/images/notification-logo.png'),
		}, {
			id: 3,
            url: require('../res/audio/blank.mp3'),
            artist: '«L» - радио',
            title: 'Ожидание потока',
            artwork: require('../res/images/notification-logo.png'),
		}];

      	console.log(songs);
      	await TrackPlayer.reset();
      	await TrackPlayer.add(songs);
      	TrackPlayer.setRepeatMode(RepeatMode.Queue);
      	if (isPlaying) TrackPlayer.play();
	}

    async getCurrentTrack() {
    	const { playingArtist, playingTrack } = this.state;
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
	                changed = true;
	                if (playingArtist !== (trackTitle[0].trim() || '«L» - радио') && (playingTrack !== trackTitle[1].trim())) {
	                	changed = true;
	                }
					this.setState({ 
						playingArtist: trackTitle[0].trim() || '«L» - радио', 
						playingTrack: trackTitle[1].trim() || ''
					});
					TrackPlayer.updateMetadataForTrack(0, {
						artist: playingArtist,
						title: playingTrack,
						artwork: require('../res/images/notification-logo.png')
					});

					console.log('AppState: ' + AppState.currentState);
	            }
			});
		} catch (error) {
		  	console.log(error);
		}
    }

	handlePlayAudio = async () => {
		const { location, stream, isPlaying } = this.state;
		console.log('handlePlayAudio', isPlaying);
		if (!isPlaying) {
	    	const location = await this.props.restoreData('location');
	    	const stream = await this.props.restoreData('stream');
			TrackPlayer.stop();
			TrackPlayer.play();
			//this.setState({ isPlaying: true });
			console.log(`https://api.lradio.ru/statistics?stream=${stream}&city={"city": "${location.localitie}", "region": "${location.area}"}`);
			fetch(`https://api.lradio.ru/statistics?stream=${stream}&city={"city": "${location.localitie}", "region": "${location.area}"}`);
		} else {
			TrackPlayer.pause();
			//this.setState({ isPlaying: false });
		}
	}

	componentDidMount() {
		//this.props.storeData('location', null);
		this.setupTrackPlayer();
		/*
		BackgroundTimer.runBackgroundTimer(() => { 
			this.getCurrentTrack();
		}, 5000);
		*/
	    this.onFocusCall = this.props.navigation.addListener('focus', () => {
	      	console.log('REFRESH');
	      	this.setupPlaylist();
	    });
	}

	componentWillUnmount() {
		//BackgroundTimer.stopBackgroundTimer();
		this.onFocusCall;
	}

	render() {
		const { audio, location, isPlaying, statePlayer, isBusy, playingArtist, playingTrack } = this.state;
        const statePlayerString = {
        	ready: 'Поток на паузе',
        	playing: 'Поток проигрывается',
        	paused: 'Поток на паузе',
        	stopped: 'Поток на паузе',
        	ended: 'Поток на паузе',
        	buffering: 'Буферизация данных',
        	loading: 'Загрузка данных',
        	error: 'Ошибка потока',
        };
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
					    <Button
					    	variant="unstyled"
					    	_android={{
								style: {
									position: 'absolute',
									top: 0,
									left: 0,
									zIndex: 10
								},
								py: 2
					    	}}
					    	_ios={{
								style: {
									position: 'absolute',
									top: 24,
									left: 0,
									zIndex: 10
								},
								py: 4
							}}
					        onPress={() => { this.props.navigation.navigate('Cities') }}
					    >
					    	<HStack
					    		alignItems="center"
					    		space={2}
					    	>
								<Image 
									source={ images.location } 
									height="30"
									width="30"
									alt=""
								/>
								<Text 
									fontSize="sm"
									color="#ff7900"
								>
									{ location.value }
								</Text>
							</HStack>
					    </Button>
						<Box
							width="100%"
							maxH="60%"
							alignItems="center"
							position="relative"
						>
							<Image 
								key={`play-${images.logo}`}
								source={images.logo}
								maxH="100%"
								maxW="100%"
								height="100%"
								width="100%"
								alt="" 
								style={ isPlaying ? {resizeMode: 'contain'} : {tintColor: 'gray', resizeMode: 'contain'} }
							/>
							{ !isPlaying ?
								<Image 
									key={`pause-${images.logo}`}
									source={images.logo} 
									maxH="100%"
									maxW="100%"
									height="100%"
									width="100%"
									alt="" 
									style={{
										position: 'absolute',
										top: 0,
										opacity: 0.7,
										resizeMode: 'contain'
									}}
	  							/>
							:
								<>
		  						</>
							}
						</Box>
						<Button
							variant="unstyled"
							style={{
								marginTop: -50,
							}}
							onPress={() => this.handlePlayAudio()}
						>
							<Image 
								key={ isPlaying ? images.pause : images.play } 
								source={ isPlaying ? images.pause : images.play } 
								size="md" 
								alt=""
							/>
						</Button>
						<Text 
							mt="3" 
							fontSize="lg"
							bold
							color="white"
						>
							{statePlayer === 'playing' ? `${playingArtist}` : ``}
						</Text>
						<Text 
							mt="2"
							px="2"
							fontSize="sm"
							color="amber.500"
						>
							{statePlayer === 'playing' ? `${playingTrack}` : statePlayerString[statePlayer]}
						</Text>
					</Box>
				</>
			);
		}
		return null;
	}
}

export default Player;