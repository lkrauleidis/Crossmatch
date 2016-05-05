import React, { Component, PropTypes, Text, TextInput, View, TouchableHighlight, TouchableOpacity, Image, TouchableNativeFeedback, LayoutAnimation, Alert, AlertIOS, StyleSheet, AsyncStorage } from 'react-native';
import Button from '../../components/native-button/Button';
import { connect } from 'react-redux/native';
import {Icon} from 'react-native-icons';
import Modal from 'react-native-modalbox';
import _ from 'lodash';

import LoadingIndicator from '../../components/LoadingIndicator';

import {signup} from '../../redux/actions/AuthActions';
import {firebaseRef} from '../../config';

const dimensions = require('Dimensions').get('window');

class SignupScreen extends Component {
  static propTypes = {
    user: PropTypes.object,
    error: PropTypes.object,
    loading: PropTypes.bool,
    signup: PropTypes.func
  };

	constructor(props) {
		super(props);
		this.state = {
			email: '',
			emailError: '',
			password: '',
			passwordError: '',
			confirmPassword: '',
			confirmPasswordError: '',
			gmcNumber: '',
			gmcNumberError: '',
			loadingText: 'Signing up...'
		};
		this._onSubmit = this._onSubmit.bind(this);
		this._goBack = this._goBack.bind(this);
	}

	componentWillReceiveProps(newProps) {
		if (!this.props.user && newProps.user) {
			console.log('signup success');
			//this.props.navigator.popToTop();
		}else if (!this.props.error && newProps.error) {
			// login fail action
			if (newProps.error.code == 'Duplicate GMC') {
				this.refs.duplicateGMCModal.open();
			}else {
				Alert.alert(newProps.error.code, newProps.error.message);
			}
		}
	}

	_onSubmit() {
		const {email, password, confirmPassword, gmcNumber} = this.state;
		let errors = {};
		if(email == '') {
			Object.assign(errors, {emailError: '*Email address is required.'});
		}
		if(password == '') {
			Object.assign(errors, {passwordError: '*Password is required.'});
		}
		if(confirmPassword == '') {
			Object.assign(errors, {confirmPasswordError: '*Password Confirm is required.'});
		}
		if(password != '' && confirmPassword != '' && password != confirmPassword) {
			Object.assign(errors, {passwordError: '*Password does not match.'});
		}
		if(gmcNumber == '') {
			Object.assign(errors, {gmcNumberError: '*GMC number is required.'});
		}else if(!/^\d{7}$/gi.test(gmcNumber)){
			Object.assign(errors, {gmcNumberError: '*GMC number should be in 7-digits format.'});
		}
		if(Object.keys(errors).length > 0) {
			this.setState(errors);
			return;
		}
		this.props.signup({email, password, GMC: gmcNumber});
	}

	_goBack() {
		this.props.navigator.pop();
	}

	getSecureExistingEmail() {
		if (this.props.error && this.props.error.existing_email) {
			let existing_email = this.props.error.existing_email;
			const id_part = existing_email.substring(0, existing_email.indexOf('@'));
			const domain_part = existing_email.substring(existing_email.indexOf('@'));
			if (id_part.length > 4) {
				existing_email = id_part.substring(0, 2) + _.repeat('*', id_part.length - 4) + id_part.substring(id_part.length - 2) + domain_part;
			}
			return existing_email;
		}
		return '';
	}

	handleDuplicateGMC(e) {
		this.refs.duplicateGMCModal.close();
		firebaseRef.child('issues').push({
			issue: 'duplication',
			GMC: this.state.gmcNumber,
			attempted_email: this.state.email
		}, (error) => {
			if (error == null) {
				Alert.alert('Info',
					'Your report has been submitted sucessfully.',
					[ {text: 'OK', onPress: () => this._goBack()}]
				);
			}
		});
	}

	render() {
		return (
			<View style={styles.container}>
				<TouchableHighlight
	        onPress={this._goBack}
	        activeOpacity={0.2}
	        underlayColor={'transparent'}>
	        <Icon
            name='fontawesome|arrow-left'
            size={30}
            color={'black'}
            style={{width: 30, height: 30}} />
	      </TouchableHighlight>
				<View style={{flex: 1, marginTop: 20}}>
					<TextInput
							autoCapitalize="none"
							autoCorrect={false}
							autoFocus={true}
							returnKeyType="next"
							editable={!this.props.loading}
							keyboardType="email-address"
							placeholder="Email address"
							style={styles.formInput}
							placeholderTextColor={'#999'}
							onChangeText={(email) => this.setState({email, emailError: ''})}
							value={this.state.email} />
					<TextInput
							autoCapitalize="none"
							autoCorrect={false}
							returnKeyType="go"
							editable={!this.props.loading}
							placeholder="Password"
							secureTextEntry={true}
							style={styles.formInput}
							placeholderTextColor={'#999'}
							onSubmitEditing={this._onSubmit}
							onChangeText={(password) => this.setState({password, passwordError: ''})}
							value={this.state.password} />
					<TextInput
							autoCapitalize="none"
							autoCorrect={false}
							returnKeyType="go"
							editable={!this.props.loading}
							placeholder="Confirm Password"
							secureTextEntry={true}
							style={styles.formInput}
							placeholderTextColor={'#999'}
							onSubmitEditing={this._onSubmit}
							onChangeText={(confirmPassword) => this.setState({confirmPassword, confirmPasswordError: ''})}
							value={this.state.confirmPassword} />
					<TextInput
							autoCapitalize="none"
							autoCorrect={false}
							returnKeyType="go"
							editable={!this.props.loading}
							keyboardType="numeric"
							placeholder="GMC number"
							style={styles.formInput}
							placeholderTextColor={'#999'}
							onSubmitEditing={this._onSubmit}
							onChangeText={(gmcNumber) => this.setState({gmcNumber, gmcNumberError: ''})}
							value={this.state.gmcNumber} />
					<Button
						disabled={this.props.loading}
						wrapperStyle={[styles.submitButtonWrapper, {backgroundColor: '#a2c4c9'}]}
						style={[styles.submitButton, {color: 'black'}]}
						onPress={this._onSubmit} >
						{'CREATE ACCOUNT'}
					</Button>
					{this.props.loading &&
						<View style={styles.loadingContainer}>
							<LoadingIndicator isSmall={true} color={'grey'} />
	            <Text>{this.state.loadingText}</Text>
	          </View>
	        }
	        <View style={{marginTop: 30}}>
		        {!!this.state.emailError && (
							<Text style={styles.errorLabel}>{this.state.emailError}</Text>
						)}
	        	{!!this.state.passwordError && (
							<Text style={styles.errorLabel}>{this.state.passwordError}</Text>
						)}
	        	{!!this.state.confirmPasswordError && (
							<Text style={styles.errorLabel}>{this.state.confirmPasswordError}</Text>
						)}
						{!!this.state.gmcNumberError && (
							<Text style={styles.errorLabel}>{this.state.gmcNumberError}</Text>
						)}
	        </View>
				</View>
				<Modal style={styles.duplicateGMCModal} position={'center'} animationDuration={200} ref={'duplicateGMCModal'}>
					<TouchableOpacity onPress={(e) => { this.refs.duplicateGMCModal.close(); } }>
            <Text style={styles.closeModalBtn}>x</Text>
          </TouchableOpacity>
          <View style={{flex: 1, justifyContent: 'center'}}>
	          <Text style={styles.modalText}>
	          	{'GMC number '}
	          	<Text style={[styles.modalText, {fontWeight: 'bold'}]}>
	          		{this.state.gmcNumber}
	          	</Text>
	          	{' is already associated with the following email address: '}
	          </Text>
	          <Text style={[styles.modalText, {fontWeight: 'bold', textAlign: 'center'}]}>{this.getSecureExistingEmail()}</Text>
	          <Text style={styles.modalText}>{'If this address is yours please login with this.'}</Text>
	          <Text style={styles.modalText}>
	          	{'If you believe an error has occured, please '}
		          <Text style={[styles.modalText, {fontWeight: 'bold'}]} onPress={this.handleDuplicateGMC.bind(this)}>
		          	{'click here (see Duplication reporting)'}
		          </Text>
	          	{' to flag this duplication with the crossmatch team who will investigate and resolve the issue.'}
	          </Text>
          </View>
        </Modal>
			</View>
		);
	}
}

export default connect(
	state => ({user: state.auth.user, error: state.auth.signupError, loading: state.auth.loading}),
  { signup }
)(SignupScreen);

var styles = StyleSheet.create({
	container: {
			flex: 1,
			backgroundColor: '#f3f3f3',
			alignItems: 'stretch',
			paddingHorizontal: 15,
			paddingVertical: 20
	},
	logo: {
		height: 100,
		marginTop: 25,
		marginBottom: 25
	},
	label: {
		fontSize: 15,
		width: 75,
		fontFamily: 'Helvetica Neue',
		color: '#2c3e50',
		textAlign: 'right',
		marginRight: 10
	},
	errorLabel: {
		color: 'red',
		marginBottom: 3
	},
	formInput: {
		height: 60,
		padding: 15,
		backgroundColor: 'white',
		borderColor: 'black',
		borderWidth: 1,
		marginBottom: 3,
	},
	submitButtonWrapper: {
		padding: 15,
		marginTop: 10,
		backgroundColor: '#2c3e50'
	},
	submitButton: {
		color: 'white'
	},
	loadingContainer: {
		alignItems: 'center',
		marginTop: 10
	},
  duplicateGMCModal: {
  	padding: 10,
  	width: dimensions.width - 50,
    height: 300
  },
  modalText: {
    color: 'black',
    fontSize: 15,
    marginVertical: 5
  },
  closeModalBtn: {
  	color: 'black',
  	fontSize: 22,
  	textAlign: 'right',
  	fontWeight: 'bold'
  }
});
