import {AsyncStorage} from 'react-native';

import {WEEKDATA_SETVALUE_START, FIREBASE_SETVALUE_SUCCESS, FIREBASE_SETVALUE_FAIL,
	WEEKDATA_LOADED, WEEKDATA_CHANGED, BOOKING_UNCONFIRMED_LOCAL_DATA, AVAILABILITY_SETVALUE_START, AVAILABILITY_SETVALUE_FINISH,
	BOOKING_UNCONFIRMED_SETVALUE_START, BOOKING_REFUSED_SETVALUE_START, BOOKING_ACCEPTED_SETVALUE_START,
  BOOKING_UNCONFIRMED_SETVALUE_FINISH, BOOKING_REFUSED_SETVALUE_FINISH, BOOKING_ACCEPTED_SETVALUE_FINISH} from '../../constants';
var initialState = {};

export default function firebaseVal(state = initialState, action) {

	switch(action.type) {
		case WEEKDATA_SETVALUE_START:
			return {
				...state,
				loading: true,
				isConfirmData: false
			};
		case FIREBASE_SETVALUE_SUCCESS:
			return {
				...state,
				loading: false,
				isConfirmData: false,
				isSetValueSuccess: true
			};
		case FIREBASE_SETVALUE_FAIL:
			return {
				...state,
				loading: false,
				isConfirmData: true,
				isSetValueSuccess: false
			};
		case WEEKDATA_LOADED:
			return {
				...state,
				isConfirmData: false,
			};
		case WEEKDATA_CHANGED:
			return {
				...state,
				isConfirmData: true,
			};
		case BOOKING_UNCONFIRMED_LOCAL_DATA:
			return {
				...state,
				unconfirmedBookingData: action.result
			}
    case BOOKING_UNCONFIRMED_SETVALUE_START:
		  return {
				...state,
				isBookingUnconfirmedVal: true,
			}
		case BOOKING_REFUSED_SETVALUE_START:
		  return {
				...state,
				isBookingRefusedVal: true,
			}
		case BOOKING_ACCEPTED_SETVALUE_START:
		  return {
				...state,
				isBookingAcceptedVal: true,
			}
		case AVAILABILITY_SETVALUE_START:
			return{
				...state,
				isSettingAvailabilityVal: true
			}
    case BOOKING_UNCONFIRMED_SETVALUE_FINISH:
		  return{
				...state,
				isBookingUnconfirmedVal: false
			}
		case BOOKING_REFUSED_SETVALUE_FINISH:
		  return{
				...state,
				isBookingRefusedVal: false
			}
		case BOOKING_ACCEPTED_SETVALUE_FINISH:
		  return{
				...state,
				isBookingAcceptedVal: false
			}
		case AVAILABILITY_SETVALUE_FINISH:
		  return{
				...state,
				isSettingAvailabilityVal: false
			}
		default:
			return state;
	}

	return state;
}
