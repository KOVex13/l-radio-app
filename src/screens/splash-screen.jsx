import React from 'react';
import { StyleSheet } from 'react-native';
import * as eva from '@eva-design/eva';
import { Layout, Text, Avatar, Input, Button } from '@ui-kitten/components';
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

class SplashScreen extends React.Component {
	constructor(props) {
		super(props);

		this.handlerNext = this.handlerNext.bind(this);
	}

	handlerNext() {
		app.getUser({
		}).then(res => {
			console.log(res);
			if (res.login) {
				this.props.navigation.navigate('TopicsList');
			} else {
				this.props.navigation.navigate('Login');
			}
        }).catch(err => {
            console.error(err);
			this.setState({
				isLoading: false
			});
        });
	};

	render() {
		return (
			<Layout style={styles.container}>
				<Avatar style={styles.image} size='giant' source={images.logo} />
				<Text style={styles.title}>Flexites Support Hub</Text>
				<Text style={styles.subtitle}>v. 0.1.2022.03.20</Text>
				<Button 
					style={styles.button} 
					size='small' 
					appearance='outline' 
					status='primary'
					onPress={() => this.handlerNext()}
				>
					Начать
				</Button>
			</Layout>
		);
	}
}

export default SplashScreen;