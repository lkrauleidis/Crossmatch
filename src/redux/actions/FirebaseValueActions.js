import {WEEKDATA_SETVALUE_START, FIREBASE_SETVALUE_SUCCESS, FIREBASE_SETVALUE_FAIL,
  BOOKING_UNCONFIRMED_LOCAL_DATA, EVENT_SWIPE, WEEKDATA_LOADED, WEEKDATA_CHANGED, AVAILABILITY_SETVALUE_START, AVAILABILITY_SETVALUE_FINISH,
  BOOKING_UNCONFIRMED_SETVALUE_START, BOOKING_REFUSED_SETVALUE_START, BOOKING_ACCEPTED_SETVALUE_START,
  BOOKING_UNCONFIRMED_SETVALUE_FINISH, BOOKING_REFUSED_SETVALUE_FINISH, BOOKING_ACCEPTED_SETVALUE_FINISH} from '../../constants';
import {firebaseRef} from '../../config';
import _ from 'lodash';
import React, {InteractionManager} from 'react-native';
var {
  FirebaseManager
} = require('NativeModules');

var weeDataMap = {};

/* ... */


/**
*  Set the values of all children changed
*/
export function setAllWeekVal(dataMap, emitter, direction) {
	return (dispatch) => {

		dispatch({
      type: WEEKDATA_SETVALUE_START,
    });

    // weekDataMap = Object.assign({}, dataMap);
    // setFirebaseVal(dispatch);
	  FirebaseManager.setFirebaseVal(dataMap,
		  (result) => {
				onSetWeekValComplete(dispatch, result, emitter, direction);
		  }
		);
	};
}

export function weekDataLoaded(){
	return (dispatch) => {
		dispatch({
      type: WEEKDATA_LOADED
    });
	};
}

export function weekDataChanged(){
	return (dispatch) => {
		dispatch({
      type: WEEKDATA_CHANGED
    });
	};
}

export function setLocalUnconfirmedBookingData(data){
  return (dispatch) => {
		dispatch({
      type: BOOKING_UNCONFIRMED_LOCAL_DATA,
      result: data
    });
	};
}

export function removeFirebaseUnconfirmedBookingData(dataMap){
  return (dispatch) => {

		dispatch({
      type: BOOKING_UNCONFIRMED_SETVALUE_START,
    });

	  FirebaseManager.removeFirebaseVal(dataMap,
		  (result) => {
				onRemoveUnconfirmedBookingValComplete(dispatch, result);
		  }
		);
	};
}

export function setFirebaseRefusedBookingData(dataMap){
  return (dispatch) => {

		dispatch({
      type: BOOKING_REFUSED_SETVALUE_START,
    });

	  FirebaseManager.setFirebaseVal(dataMap,
		  (result) => {
				onSetRefusedBookingValComplete(dispatch, result);
		  }
		);
	};
}

export function setFirebaseAcceptedBookingData(dataMap){
  return (dispatch) => {

		dispatch({
      type: BOOKING_ACCEPTED_SETVALUE_START,
    });

	  FirebaseManager.setFirebaseVal(dataMap,
		  (result) => {
				onSetAcceptedBookingValComplete(dispatch, result);
		  }
		);
	};
}

export function setFirebaseAvailabilityData(dataMap){
  return (dispatch) => {

		dispatch({
      type: AVAILABILITY_SETVALUE_START,
    });

	  FirebaseManager.setFirebaseVal(dataMap,
		  (result) => {
				onSetAvailabilityValComplete(dispatch, result);
		  }
		);
	};
}
/**
*  Firebase setValue handler
*/
// function onSetWeekValComplete(dispatch) {
//
//   return (error) => {
//
//     var firstKey = Object.keys(weekDataMap)[0];
//     delete weekDataMap[firstKey];
//
//     if(!isEmpty(weekDataMap)){
//       setFirebaseVal(dispatch);
//     }
//     else{
//       if(error){
//         dispatch({
//     			type: FIREBASE_SETVALUE_FAIL
//     		});
//       }
//       else{
//         dispatch({
//     			type: FIREBASE_SETVALUE_SUCCESS
//     		});
//       }
//     }
//   };
// }

function onSetWeekValComplete(dispatch, result, emitter, direction){
  if(result){
    dispatch({
			type: FIREBASE_SETVALUE_SUCCESS
		});
  }
  else{
    dispatch({
			type: FIREBASE_SETVALUE_FAIL
		});
  }

  if(direction){
    emitter.emit(EVENT_SWIPE, {source: 'week', direction: direction});
  }
}

function onRemoveUnconfirmedBookingValComplete(dispatch, result){
  dispatch({
		type: BOOKING_UNCONFIRMED_SETVALUE_FINISH
	});
}

function onSetRefusedBookingValComplete(dispatch, result){
  dispatch({
		type: BOOKING_REFUSED_SETVALUE_FINISH
	});
}

function onSetAcceptedBookingValComplete(dispatch, result){
  dispatch({
		type: BOOKING_ACCEPTED_SETVALUE_FINISH
	});
}

function onSetAvailabilityValComplete(dispatch, result){
  dispatch({
		type: AVAILABILITY_SETVALUE_FINISH
	});
}

/**
*  Set the value of a child changed
*/
function setFirebaseVal(dispatch){

  if(!isEmpty(weekDataMap)){
    var firstKey = Object.keys(weekDataMap)[0];
    var firstValue = weekDataMap[firstKey];

    firebaseRef.child(firstKey).set(firstValue, onSetWeekValComplete(dispatch));
  }
}

/**
*  Check if the Object is empty or not.
*/
// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}
