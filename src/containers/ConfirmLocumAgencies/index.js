import React, { Component, PropTypes, Text, TextInput, View, ScrollView, TouchableHighlight, Image, TouchableNativeFeedback, LayoutAnimation, StyleSheet, AsyncStorage } from 'react-native';
import Button from '../../components/native-button/Button';
import { connect } from 'react-redux/native';

import Routes from '../../routes';

class ConfirmLocumAgenciesScreen extends Component {

	static propTypes = {
    locumAgencies: PropTypes.array
  };

  static defaultProps = {
  	locumAgencies: []
  };

	constructor(props) {
		super(props);
		this._goNext = this._goNext.bind(this);
	}

	_goNext() {
		this.props.navigator.push(Routes.getHomeNavigatorRoute());
	}

	render() {
		return (
			<View style={styles.container}>
				<ScrollView style={{flex: 1}}>
					<Text style={styles.label}>{'The following locum agencies have permission to receive your availability data.'}</Text>
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
				</ScrollView>
				<Button
					disabled={this.props.loading}
					wrapperStyle={[styles.submitButtonWrapper, {backgroundColor: '#a2c4c9'}]}
					style={[styles.submitButton, {color: 'black'}]}
					onPress={this._goNext} >
					{'OK'}
				</Button>

			</View>
		);
	}
}

export default connect(
	state => ({locumAgencies: state.auth.user ? state.auth.user.locum_agencies: []})
)(ConfirmLocumAgenciesScreen);

var styles = StyleSheet.create({
	container: {
			flex: 1,
			backgroundColor: '#f3f3f3',
			paddingHorizontal: 15,
			paddingVertical: 20
	},
	submitButtonWrapper: {
		padding: 15,
		marginTop: 10,
		backgroundColor: '#2c3e50'
	},
	submitButton: {
		color: 'white'
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
