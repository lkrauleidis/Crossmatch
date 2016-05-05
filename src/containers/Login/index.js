import React, { Component, PropTypes, Text, TextInput, View, TouchableHighlight, TouchableOpacity, Image,
  TouchableNativeFeedback, LayoutAnimation, Alert, AlertIOS, StyleSheet, AsyncStorage } from 'react-native';
import Button from '../../components/native-button/Button';
import { connect } from 'react-redux/native';
import EventEmitter from 'EventEmitter';
import Subscribable from 'Subscribable';
import reactMixin from 'react-mixin';

import LoadingIndicator from '../../components/LoadingIndicator';

import Routes from '../../routes';
import {loginWithEmailPassword, loginWithCacheToken, logout} from '../../redux/actions/AuthActions';
import {firebaseRef} from '../../config';
import {EVENT_LOGOUT, LOCAL_STORAGE_TOKEN_KEY, IS_TEMPORARY_PASSWORD} from '../../constants';


class LoginScreen extends Component {
  static propTypes = {
    user: PropTypes.object,
    error: PropTypes.object,
    loading: PropTypes.bool,
    isNew: PropTypes.bool,
    loginWithEmailPassword: PropTypes.func,
    loginWithCacheToken: PropTypes.func,
    logout: PropTypes.func,
    routeEvents: PropTypes.object
  };

	constructor(props) {
		super(props);
		this.state = {
			email: '',
			emailError: '',
			password: '',
			passwordError: '',
			loadingText: 'Logging in...'
		};
		this.authHandler = this.authHandler.bind(this);
		this._onSubmit = this._onSubmit.bind(this);
		this._goToSignup = this._goToSignup.bind(this);
		this._goToResetPassword = this._goToResetPassword.bind(this);
	}

	componentDidMount() {
		firebaseRef.onAuth(this.authHandler);
		this.addListenerOn(this.props.routeEvents, EVENT_LOGOUT, (args) => this.props.logout());

		AsyncStorage.getItem(LOCAL_STORAGE_TOKEN_KEY).then((value) => {
      if(value){
      	console.log('cache token: ', value);
      	this.setState({loadingText: 'Logging in from cache token...'});
      	this.props.loginWithCacheToken(value);
      }
    }).done();
	}

	componentWillReceiveProps(newProps) {
		if (this.props.user && !newProps.user) {
			// logout action
      		console.log('logout success');
			this._logout();
		} else if (!this.props.user && newProps.user) {
			// login success action
			console.log('login success');

      		if (newProps.isNew) {
				this.props.navigator.push(Routes.getConfirmLocumAgenciesRoute());
			}else{
        		AsyncStorage.getItem(IS_TEMPORARY_PASSWORD).then((value) => {
	          		if(value){
	          			this.props.navigator.push(Routes.getUpdatePasswordRoute());
	          		} else {
	            		this.props.navigator.push(Routes.getHomeNavigatorRoute());
	          		}
        		}).done();
			}
			this.setState({email: '', password: ''});
		} else if (!this.props.error && newProps.error) {
			// login fail action
			Alert.alert(newProps.error.code, newProps.error.message);
		}
	}
	
	componentWillUnmount() {
		firebaseRef.offAuth(this.authHandler);
	}

	authHandler(authData) {
		console.log('authData change: ', authData);
		if(this.props.user && !authData) {
			this.props.logout();
		}
	}

	_logout() {
		if(firebaseRef.getAuth()) {
			firebaseRef.unauth();
		}
		this.props.navigator.popToTop();
	}

	_onSubmit() {
		const {email, password} = this.state;
		if(email == '' || password == '') {
			this.setState(Object.assign({}, email == '' ? {emailError: '*Email address is required.'} : {}, password == '' ? {passwordError: '*Password is required.'}: {} ));
			return;
		}
		this.setState({loadingText: 'Logging in...'});
  		this.props.loginWithEmailPassword(email, password);
	}

	_goToSignup() {
		this.props.navigator.push(Routes.getSignupRoute());
		this.setState({email: '', emailError: '', password: '', passwordError: ''});
	}

	_goToResetPassword() {
		this.props.navigator.push(Routes.getResetPasswordRoute());
		// this.props.navigator.push(Routes.getConfirmLocumAgenciesRoute());
		// this.props.navigator.push(Routes.getSettingsRoute());
		this.setState({email: '', emailError: '', password: '', passwordError: ''});
	}

	render() {
		return (
			<View style={styles.container}>
				<View style={{flex: 1, justifyContent: 'center'}}>
					<View style={{alignItems: 'center'}}>
						<Image style={styles.logo} resizeMode="contain" source={require('./crossmatch.png')} />
					</View>
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
					{!!this.state.emailError && (
						<Text style={styles.errorLabel}>{this.state.emailError}</Text>
					)}
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
					{!!this.state.passwordError && (
						<Text style={styles.errorLabel}>{this.state.passwordError}</Text>
					)}

					<Button
						disabled={this.props.loading}
						wrapperStyle={styles.submitButtonWrapper}
						style={styles.submitButton}
						onPress={this._onSubmit} >
						{'LOGIN'}
					</Button>
					{this.props.loading &&
						<View style={styles.loadingContainer}>
	            <LoadingIndicator isSmall={true} color={'grey'} />
	            <Text>{this.state.loadingText}</Text>
	          </View>
	        }
				</View>
				<Button
					disabled={this.props.loading}
					wrapperStyle={[styles.submitButtonWrapper, {backgroundColor: '#a2c4c9'}]}
					style={[styles.submitButton, {color: 'black'}]}
					onPress={this._goToSignup} >
					{'CREATE ACCOUNT'}
				</Button>
				<Button
					disabled={this.props.loading}
					wrapperStyle={[styles.submitButtonWrapper, {backgroundColor: '#a2c4c9'}]}
					style={[styles.submitButton, {color: 'black'}]}
					onPress={this._goToResetPassword} >
					{'RESET PASSWORD'}
				</Button>
			</View>
		);
	}
}

reactMixin(LoginScreen.prototype, Subscribable.Mixin);

export default connect(
	state => ({user: state.auth.user, error: state.auth.loginError, loading: state.auth.loading, isNew: state.auth.isNew}),
  { loginWithEmailPassword, loginWithCacheToken, logout}
)(LoginScreen);

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
