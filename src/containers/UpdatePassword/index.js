import React, { Component, PropTypes, Text, TextInput, View, TouchableHighlight, TouchableOpacity,
  Image, TouchableNativeFeedback, LayoutAnimation, Alert, AlertIOS, StyleSheet, AsyncStorage } from 'react-native';
import Button from '../../components/native-button/Button';
import { connect } from 'react-redux/native';
import {Icon} from 'react-native-icons';
import Modal from 'react-native-modalbox';
import _ from 'lodash';

import LoadingIndicator from '../../components/LoadingIndicator';

import {updatePassword} from '../../redux/actions/AuthActions';
import {firebaseRef} from '../../config';
import {CURRENT_EMAIL, CURRENT_PASSWORD} from '../../constants';

const dimensions = require('Dimensions').get('window');

class UpdatePasswordScreen extends Component {
  static propTypes = {
    updateSuccess: PropTypes.bool,
    error: PropTypes.object,
    loading: PropTypes.bool,
    updatePassword: PropTypes.func
  };

	constructor(props) {
		super(props);
		this.state = {
			password: '',
			passwordError: '',
			confirmPassword: '',
			confirmPasswordError: '',
			loadingText: 'Submitting password update request...'
		};
		this._onSubmit = this._onSubmit.bind(this);
		this._goBack = this._goBack.bind(this);
	}

  componentWillReceiveProps(newProps) {
		if (!this.props.updateSuccess && newProps.updateSuccess) {
			console.log('update password success');
			Alert.alert('Success', 'Your password update request has been submitted successfully.');
		}else if (!this.props.error && newProps.error) {
			// login fail action
			Alert.alert(newProps.error.code, newProps.error.message);
		}
	}

	_onSubmit() {
		const {password, confirmPassword} = this.state;
		let errors = {};

		if(password == '') {
			Object.assign(errors, {passwordError: '*Password is required.'});
		}
		if(confirmPassword == '') {
			Object.assign(errors, {confirmPasswordError: '*Password Confirm is required.'});
		}
		if(password != '' && confirmPassword != '' && password != confirmPassword) {
			Object.assign(errors, {passwordError: '*Password does not match.'});
		}

		if(Object.keys(errors).length > 0) {
			this.setState(errors);
			return;
		}

    AsyncStorage.multiGet([CURRENT_EMAIL, CURRENT_PASSWORD]).then((value) => {
      if(value){
      	const currentEmail = value[0][1];
        const currentPassword = value[1][1];

        let userData = Object.assign({}, {'email': currentEmail, 'oldPassword': currentPassword, 'newPassword': password});
    		this.props.updatePassword(userData);
      }
    }).done();
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
					<Button
            disabled={this.props.loading}
            wrapperStyle={styles.submitButtonWrapper}
            style={styles.submitButton}
            onPress={this._onSubmit}>
						{'UPDATE PASSWORD'}
					</Button>
					{this.props.loading &&
						<View style={styles.loadingContainer}>
							<LoadingIndicator isSmall={true} color={'grey'} />
	            <Text>{this.state.loadingText}</Text>
	          </View>
	        }
	        <View style={{marginTop: 30}}>
            {!!this.state.passwordError && (
              <Text style={styles.errorLabel}>{this.state.passwordError}</Text>
            )}
            {!!this.state.confirmPasswordError && (
              <Text style={styles.errorLabel}>{this.state.confirmPasswordError}</Text>
            )}
	        </View>
        </View>
			</View>
		);
	}
}

export default connect(
	state => ({updateSuccess: state.auth.updatePasswordSuccess, error: state.auth.updatePasswordError,
    loading: state.auth.loading}),
  { updatePassword }
)(UpdatePasswordScreen);

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
