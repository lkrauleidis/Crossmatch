import React, { Component, PropTypes, Text, TextInput, View, ScrollView, TouchableHighlight, Image, TouchableNativeFeedback, LayoutAnimation, StyleSheet, Platform, AsyncStorage } from 'react-native';
import Button from 'react-native-button';
import {Icon} from 'react-native-icons';
import { connect } from 'react-redux/native';

import Routes from '../../routes';

class SettingsScreen extends Component {

	static propTypes = {
    locumAgencies: PropTypes.array
  };

  static defaultProps = {
  	locumAgencies: []
  };

	constructor(props) {
		super(props);
		this._goBack = this._goBack.bind(this);
	}

	_goBack() {
		this.props.navigator.pop();
	}

	render() {
		return (
			<View style={styles.container}>
				<View style={styles.navbar}>
					<TouchableHighlight
		        onPress={this._goBack}
		        activeOpacity={0.2}
		        underlayColor={'transparent'}
		        style={{position: 'absolute'}}>
		        <Icon
	            name='fontawesome|arrow-left'
	            size={30}
	            color={'white'}
	            style={{width: 30, height: 30}} />
		      </TouchableHighlight>
		      <Text style={styles.navbarTitle}>{'Settings'}</Text>
		    </View>
				<ScrollView style={{flex: 1}}>
					<View style={styles.titleContainer}>
						<Text style={[styles.label, {textAlign: 'center'}]}>{'Locum agencies receiving availability data'}</Text>
					</View>
					<View style={{paddingHorizontal: 20, paddingVertical: 5}}>
						<View style={styles.agenciesLabelContainer}>
							{this.props.locumAgencies.length == 0 ?
								<Text style={styles.label}>{'There are no locum agencies wishing to view your availability data. Please contact your agencies and tell them you wish to use the Crossmatch app. \n\nYou can still use the app and add agencies at a later date.'}</Text>
							:
								<View style={{alignItems: 'center'}}>
									{this.props.locumAgencies.map((agency, index) => <Text key={index} style={styles.label}>{agency.name}</Text>)}
								</View>
							}
						</View>
						<Text style={styles.label}>{'Please get in touch with any of the listed agencies you believe should not be receiving your data.'}</Text>
						<Text style={styles.label}>{'If you would like additional agencies to access your data please request they use the crossmatch system.'}</Text>
					</View>
				</ScrollView>
			</View>
		);
	}
}

export default connect(
	state => ({locumAgencies: state.auth.user.locum_agencies})
)(SettingsScreen);


var styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f3f3f3',
		paddingVertical: Platform.OS === 'ios' ? 20 : 0
	},
	navbar: {
		backgroundColor: '2c3e50',
		alignItems: 'center',
		padding: 10,
		position: 'relative'
	},
	navbarTitle: {
		color: 'white',
		fontSize: 24
	},
	titleContainer: {
		backgroundColor: '#d9d9d9',
		borderColor:'black',
		borderBottomWidth: 2
	},
	label: {
		fontSize: 17,
		fontFamily: 'Helvetica Neue',
		color: 'black',
		marginTop: 10,
		marginBottom: 10
	},
	agenciesLabelContainer: {
		backgroundColor: '#d0e0e3',
		alignSelf: 'center',
		alignItems: 'center',
		paddingVertical: 10,
		paddingHorizontal: 30,
		marginTop: 10,
		marginBottom: 10
	}
});
