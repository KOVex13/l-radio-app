import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Avatar } from '@ui-kitten/components';

const styles = StyleSheet.create({
	avatar: {
		marginEnd: 10
	},
	avatarNull: {
		marginEnd: 10,
		borderRadius: 14,
		width: 32,
		maxWidth: 32,
		minWidth: 32,
		height: 32,
		backgroundColor: '#f0f0f0',
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	avatarNullAbr: {
		fontSize: 10,
	}
});

class AvatarUser extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
	}

	render() {
		return (
			<>
				{this.props.photo ? 
					<Avatar 
						style={styles.avatar} 
						size='small' 
						source={{ uri: this.props.photo }}
					/>
				:
					<View
						style={styles.avatarNull}
					>
						<Text
							style={styles.avatarNullAbr}
						>
							{this.props.abr}	
						</Text>
					</View>
				}
			</>
		);
	}
}

export default AvatarUser;