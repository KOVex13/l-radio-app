import TrackPlayer, {Event} from 'react-native-track-player';

module.exports = async function(): Promise<void> {
  	TrackPlayer.addEventListener(Event.RemoteDuck, (e) => {
    	console.log(e);
    	if (e.paused) {
      		TrackPlayer.pause();
    	} else {
      		TrackPlayer.play();
    	}
  	});
    TrackPlayer.addEventListener(Event.RemotePlay, () => {
    	TrackPlayer.play()
    });
    TrackPlayer.addEventListener(Event.RemotePause, () => {
    	TrackPlayer.pause()
    });
}