import React, { Component, PropTypes, Text, TextInput, View, TouchableHighlight, Image, TouchableNativeFeedback, LayoutAnimation, Alert, AlertIOS, StyleSheet, AsyncStorage } from 'react-native';
import Button from '../../components/native-button/Button';
import { connect } from 'react-redux/native';
import {Icon} from 'react-native-icons';

import LoadingIndicator from '../../components/LoadingIndicator';

import {resetPassword} from '../../redux/actions/AuthActions';

class ResetPasswordScreen extends Component {
  static propTypes = {
    resetSuccess: PropTypes.bool,
    error: PropTypes.object,
    loading: PropTypes.bool,
    resetPassword: PropTypes.func
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
			loadingText: 'Submitting password reset request...'
		};
		this._onSubmit = this._onSubmit.bind(this);
		this._goBack = this._goBack.bind(this);
	}

	componentWillReceiveProps(newProps) {
		if (!this.props.resetSuccess && newProps.resetSuccess) {
			console.log('reset password success');
			Alert.alert('Success', 'Your password reset request has been submitted successfully.');
		}else if (!this.props.error && newProps.error) {
			// login fail action
			Alert.alert(newProps.error.code, newProps.error.message);
		}
	}

	_onSubmit() {
		const {email, gmcNumber} = this.state;
		let errors = {};
		if(email == '' && gmcNumber == '') {
			Object.assign(errors, {emailError: '*Email address or GMC number is required.'});
		}else if(email != '' && !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)){
			Object.assign(errors, {emailError: '*Email address is not valid.'});
		}else if(gmcNumber != '' && !/^\d{7}$/gi.test(gmcNumber)){
			Object.assign(errors, {gmcNumberError: '*GMC number should be in 7-digits format.'});
		}
		if(Object.keys(errors).length > 0) {
			this.setState(errors);
			return;
		}
		this.props.resetPassword({email, GMC: gmcNumber});
	}

	_goBack() {
		this.props.navigator.pop();
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
					<Text style={{fontSize: 18, paddingVertical: 5, textAlign: 'center', marginBottom: 3}}>{'OR'}</Text>
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
						wrapperStyle={styles.submitButtonWrapper}
						style={styles.submitButton}
						onPress={this._onSubmit} >
						{'RESET PASSWORD'}
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
						{!!this.state.gmcNumberError && (
							<Text style={styles.errorLabel}>{this.state.gmcNumberError}</Text>
						)}
	        </View>
				</View>
			</View>
		);
	}
}

export default connect(
	state => ({resetSuccess: state.auth.resetPasswordSuccess, error: state.auth.resetPasswordError, loading: state.auth.loading}),
  { resetPassword }
)(ResetPasswordScreen);

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
	}
});
