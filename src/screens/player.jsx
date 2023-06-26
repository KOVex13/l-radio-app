import React from 'react';
import { AppState, StyleSheet } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import { Text, Box, Button, Container, Image } from 'native-base';
import { images } from '../res/images';
import TrackPlayer, {
	AppKilledPlaybackBehavior,
	Capability,
	useTrackPlayerEvents,
	usePlaybackState,
	TrackPlayerEvents,
	STATE_PLAYING,
	Event,
} from 'react-native-track-player';

class Player extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			appState: AppState.currentState,
			audio: 'https://air.unmixed.ru/lradio256chelyabinsk',
			isPlaying: false,
			playingArtist: '',
			playingTrack: '',
		}

		this.handlePlayAudio = this.handlePlayAudio.bind(this);
		this.getCurrentTrack = this.getCurrentTrack.bind(this);
		this.setupTrackPlayer = this.setupTrackPlayer.bind(this);
	}

	async setupTrackPlayer() {
		const { audio, playingArtist, playingTrack } = this.state;

		const songs = [{
			id: 1,
			url: audio,
			artist: playingArtist,
			title: playingTrack,
			artwork: require('../res/images/notification-logo.png'),
		}];

	    TrackPlayer.setupPlayer().then(async () => {
	      	console.log('Player ready');
		    await TrackPlayer.addEventListener(Event.PlaybackState, (e) => {
		    	console.log('Player state:', e.state === 'playing');
		    	let isPlaying = e.state === 'playing';
		    	this.setState({ isPlaying: isPlaying });
		    });
	      	await TrackPlayer.reset();
	      	await TrackPlayer.add(songs);
	      	//TrackPlayer.play();
	      	//this.setState({ isPlaying: true });

	      	await TrackPlayer.updateOptions({
	        	stopWithApp: false,
	        	alwaysPauseOnInterruption: true,
	        	capabilities: [
	          		Capability.Play,
	          		Capability.Pause,
	        	],
			    android: {
			        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback
			    },
			    icon: 'ic_launcher_round',
	      	});
	    });
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
					/*
					if (AppState.currentState.match(/inactive|background/)) {
						//console.log(changed);
						if (changed) this.DisplayNotification();
					} else {
						this.onCancelNotification();
					}
					*/
	            }
			});
		} catch (error) {
		  	console.log(error);
		}
    }

	handlePlayAudio = () => {
		const { isPlaying } = this.state;
		console.log('handlePlayAudio', isPlaying);
		if (!isPlaying) {
			TrackPlayer.play();
			this.setState({ isPlaying: true });
		} else {
			TrackPlayer.pause();
			this.setState({ isPlaying: false });
		}
	}

	componentDidMount() {
		this.setupTrackPlayer();
		BackgroundTimer.runBackgroundTimer(() => { 
			this.getCurrentTrack();
		}, 5000);
	}

	componentWillUnmount() {
		BackgroundTimer.stopBackgroundTimer();
	}

	render() {
		const { audio, isPlaying, isBusy, playingArtist, playingTrack } = this.state;
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
								style={ isPlaying ? '' : {tintColor: 'gray'} }
							/>
							{ !isPlaying ?
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
							{playingArtist}
						</Text>
						<Text 
							mt="2" 
							fontSize="sm"
							color="amber.500"
						>
							{ isPlaying ? `${playingTrack}` : `Поток на паузе` }
						</Text>
					</Box>
				</>
			);
		}
		return null;
	}
}

export default Player;