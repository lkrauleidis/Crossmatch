import {AsyncStorage} from 'react-native';

import {LOCAL_STORAGE_TOKEN_KEY, IS_TEMPORARY_PASSWORD, LOGIN_REQUESTED, LOGIN_SUCCESS, LOGIN_FAILED,
	SIGNUP_REQUESTED, SIGNUP_SUCCESS, SIGNUP_FAILED, RESET_PASSWORD_REQUESTED, RESET_PASSWORD_SUCCESS, RESET_PASSWORD_FAILED,
	UPDATE_PASSWORD_REQUESTED, UPDATE_PASSWORD_SUCCESS, UPDATE_PASSWORD_FAILED, LOGOUT, SET_LOCUM_AGENCIES} from '../../constants';
var initialState = {};

export default function auth(state = initialState, action) {
	switch(action.type) {
		case LOGIN_REQUESTED:
			return {
				...state,
				loading: true,
				isNew: false,
				user: null,
				loginError: null
			};
		case LOGIN_SUCCESS:
		AsyncStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, action.result.token).done();
			return {
				...state,
				loading: false,
				user: action.result
			};
		case LOGIN_FAILED:
			return {
				...state,
				loading: false,
				loginError: action.result
			};
		case RESET_PASSWORD_REQUESTED:
			return {
				...state,
				loading: true,
				resetPasswordSuccess: false,
				resetPasswordError: null
			};
		case RESET_PASSWORD_SUCCESS:
      AsyncStorage.setItem(IS_TEMPORARY_PASSWORD, 'Temporary password exists').done();
			return {
				...state,
				loading: false,
				resetPasswordSuccess: action.result
			};
		case RESET_PASSWORD_FAILED:
			return {
				...state,
				loading: false,
				resetPasswordError: action.result
			};
		case UPDATE_PASSWORD_REQUESTED:
			return {
				...state,
				loading: true,
				updatePasswordSuccess: false,
				updatePasswordError: null
			};
		case UPDATE_PASSWORD_SUCCESS:
      AsyncStorage.removeItem(IS_TEMPORARY_PASSWORD).done();
			return {
				...state,
				loading: false,
				updatePasswordSuccess: action.result
			};
		case UPDATE_PASSWORD_FAILED:
			return {
				...state,
				loading: false,
				updatePasswordError: action.result
			};
		case SIGNUP_REQUESTED:
			return {
				...state,
				loading: true,
				isNew: false,
				user: null,
				signupError: null
			};
		case SIGNUP_SUCCESS:
			AsyncStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, action.result.token).done();			
			return {
				...state,
				loading: false,
				isNew: true,
				user: action.result
			};
		case SIGNUP_FAILED:
			return {
				...state,
				loading: false,
				signupError: action.result
			};
		case LOGOUT:
			AsyncStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY).done();
			return {
				...state,
				user: null
			};
		case SET_LOCUM_AGENCIES:
			//AsyncStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY).done();
			return {
				...state,
				user: {
					...state.user,
					locum_agencies: action.result
				}
			};
		default:
			return state;
	}

	return state;
}
