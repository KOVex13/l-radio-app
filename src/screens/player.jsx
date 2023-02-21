import React from 'react';
import { StyleSheet } from 'react-native';
//import * as eva from '@eva-design/eva';
//import { Layout, Text, Avatar, Input, Button } from '@ui-kitten/components';
import { Text, Box, Button, Container, Icon, Image } from 'native-base';
//import { LinearGradient } from 'expo-linear-gradient';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { images } from '../res/images';
import { app } from '../library/networking';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 20,
		fontWeight: 'bold',
        textAlign: 'center',
        margin: 10,
    },
    subtitle: {
        fontSize: 13,
        textAlign: 'center',
		marginBottom: 20
    },
    image: {
        marginBottom: 20,
    },
	button: {
	},
	input: {
		borderTopWidth: 0,
		borderLeftWidth: 0,
		borderRightWidth: 0,
		backgroundColor: '#ffffff',
		marginBottom: 10
	},
	login: {
        flex: 1,
		flexDirection: 'column',
		width: '75%',
		maxWidth: 300
	}
});

class Player extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			playingRecording: false,
			isBusy: false,
			intervalId: null,
			playingArtist: '',
			playingTrack: '',
			soundObject: undefined 
		}

		//this.handlerNext = this.handlerNext.bind(this);
		this.handlePlayAudio = this.handlePlayAudio.bind(this);
		this.getCurrentTrack = this.getCurrentTrack.bind(this);
	}

    async getCurrentTrack() {
    	try {
			const response = await fetch('https://air.unmixed.ru/status-json.xsl');
			const json = await response.json();
			json.icestats.source.forEach((track) => {
	            if (track.listenurl.match(/\/lradiomaster1$/)) {
	                const trackTitleEncoded = decodeURIComponent(escape(track.title));
	                const trackTitle = trackTitleEncoded.replace("'", "\'").split('-');
	                if (trackTitle[0].trim() === '«L»') {
	                	trackTitle[0] = '«L» - радио';
	                	trackTitle[1] = '';
	                }
					this.setState({ 
						playingArtist: trackTitle[0].trim() || '«L» - радио', 
						playingTrack: trackTitle[1].trim() || ''
					});
	            }
			});
		} catch (error) {
		  	console.log(error);
		}
		console.log(this.state);
    }


	handlePlayAudio = ({ audio }) => {
		const { soundObject, playingRecording, isBusy } = this.state
		console.log('handlePlayAudio');

		if (isBusy) return;

		this.setState({ isBusy: true });

		//If playing - stop
		if (soundObject) {
			soundObject
				.stopAsync()
				.then(() => {
					return soundObject.unloadAsync()
				})
				.then(() => {
					this.setState({ isBusy: false });
				})
				.catch((error) => console.log(error))
		}

		//If id id different than last id play new
		console.log(playingRecording);
		if (!playingRecording) {
			Audio.setAudioModeAsync({
			    allowsRecordingIOS: false,
			    staysActiveInBackground: true,
			    interruptionModeIOS: InterruptionModeIOS.DuckOthers,
			    playsInSilentModeIOS: true,
			    shouldDuckAndroid: true,
			    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
			    playThroughEarpieceAndroid: false
			})
				.then(() => {
					console.log('New');
					const newSoundObject = new Audio.Sound()
					newSoundObject
						.loadAsync({ uri: audio })
						.then((response) => {
							newSoundObject.setOnPlaybackStatusUpdate((statusData) => {
								const { didJustFinish } = statusData
								if (didJustFinish) {
									this.setState({ playingRecording: false, soundObject: undefined, isBusy: false })
								}
							})
							return newSoundObject.playAsync()
						})
						.then(() => {
							this.setState({ playingRecording: true, soundObject: newSoundObject, isBusy: false })
						})
						.catch((error) => {
							console.log(error)
						})
				})
				.catch((e) => console.log(e))
		} else {
			//If id is the same reset state
			//await playingAudio.pauseAsync();
			this.setState({ playingRecording: false, soundObject: undefined })
		}
	}

	componentDidMount() {
		const { intervalId } = this.state;
		if (!intervalId) {
	        const Id = setInterval(() => {
	            this.getCurrentTrack();
	        }, 5000);
	        this.setState({ intervalId: Id });
		}
	}

	componentWillUnmount() {
		const { intervalId } = this.state;
		if (intervalId) {
			clearInterval(intervalId);
	        this.setState({ intervalId: null });
		}
	}

	render() {
		const { playingRecording, isBusy, playingArtist, playingTrack } = this.state;
		//const { containerStyle, currentMessage, user } = this.props
		const audio = 'https://air.unmixed.ru/lradio256chelyabinsk';

		if (audio) {

	        //this.getCurrentTrack();

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
							onPress={() => this.handlePlayAudio({ audio })}
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