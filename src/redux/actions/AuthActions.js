import {AsyncStorage} from 'react-native';
import {LOGIN_REQUESTED, LOGIN_SUCCESS, LOGIN_FAILED, CURRENT_EMAIL, CURRENT_PASSWORD,
	SIGNUP_REQUESTED, SIGNUP_SUCCESS, SIGNUP_FAILED, RESET_PASSWORD_REQUESTED, RESET_PASSWORD_SUCCESS, RESET_PASSWORD_FAILED,
	UPDATE_PASSWORD_REQUESTED, UPDATE_PASSWORD_SUCCESS, UPDATE_PASSWORD_FAILED, LOGOUT, SET_LOCUM_AGENCIES} from '../../constants';
import {firebaseRef} from '../../config';
import _ from 'lodash';
/* ... */

export function loginWithEmailPassword(email, password) {
	return (dispatch) => {
		dispatch({
      type: LOGIN_REQUESTED,
      result: {}
    });

    AsyncStorage.multiSet([[CURRENT_EMAIL, email], [CURRENT_PASSWORD, password]]).done();

	  firebaseRef.authWithPassword({email, password}, loginHandler(dispatch, false));
	};
}

export function loginWithCacheToken(token) {
  return (dispatch) => {
    dispatch({
      type: LOGIN_REQUESTED,
      result: {}
    });

    firebaseRef.authWithCustomToken(token, loginHandler(dispatch, false));
  };
}

export function resetPassword(userData) {
  return (dispatch) => {
    dispatch({
      type: RESET_PASSWORD_REQUESTED,
      result: {}
    });
    if(userData.email) {
      firebaseRef.child('users').orderByChild('email').equalTo(userData.email).once('value', (snap) => {
        if (snap.exists()) {
          const email = snap.val()[Object.keys(snap.val())].email;
          firebaseRef.resetPassword({email: email}, resetPasswordHandler(dispatch));
        }else {
          dispatch({
            type: RESET_PASSWORD_FAILED,
            result: {code: 'Fail', message: 'Email address has not been registered with crossmatch.'}
          });
        }
      }, (error) => {
        dispatch({
          type: RESET_PASSWORD_FAILED,
          result: error
        });
      });
    }else if(userData.GMC) {
      firebaseRef.child('users').orderByChild('GMC').equalTo(userData.GMC).once('value', (snap) => {
        if (snap.exists()) {
          const email = snap.val()[Object.keys(snap.val())].email;
          firebaseRef.resetPassword({email: email}, resetPasswordHandler(dispatch));
        }else {
          dispatch({
            type: RESET_PASSWORD_FAILED,
            result: {code: 'Fail', message: 'GMC has not been registered with crossmatch.'}
          });
        }
      }, (error) => {
        dispatch({
          type: RESET_PASSWORD_FAILED,
          result: error
        });
      });
    }else {
      dispatch({
        type: RESET_PASSWORD_FAILED,
        result: {code: 'Fail', message: 'Invalid email or GMC.'}
      });
    }
  };
}

export function updatePassword(userData) {

  return (dispatch) => {
    dispatch({
      type: UPDATE_PASSWORD_REQUESTED,
      result: {}
    });
		firebaseRef.changePassword({
		  email: userData.email,
		  oldPassword: userData.oldPassword,
		  newPassword: userData.newPassword
		}, updatePasswordHandler(dispatch));
  };
}

export function signup(userData) {
  return (dispatch) => {
    dispatch({
      type: SIGNUP_REQUESTED,
      result: {}
    });
    firebaseRef.child('users').once('value', (snap) => {
      const isExisting = snap.forEach((snap1) => {
        if (snap1.child('email').val().toLowerCase() == userData.email.toLowerCase()) {
          dispatch({
            type: SIGNUP_FAILED,
            result: {code: 'Duplicate Email', message: 'Email address has already been signed up with crossmatch.'}
          });
          return true;
        }
        if (snap1.child('GMC').val() == userData.GMC) {
          dispatch({
            type: SIGNUP_FAILED,
            result: {code: 'Duplicate GMC', message: '', existing_email: snap1.child('email').val()}
          });
          return true;
        }
      });
      if(!isExisting) {
        firebaseRef.createUser({email: userData.email, password: userData.password}, (error1, signupUser) => {
          if (error1) {
            dispatch({
              type: SIGNUP_FAILED,
              result: error1
            });
          }else {
            firebaseRef.child(`users/${signupUser.uid}`).set({email: userData.email, GMC: userData.GMC}, (error2) => {
              if(error2) {
                dispatch({
                  type: SIGNUP_FAILED,
                  result: error2
                });
              }else {
                firebaseRef.authWithPassword({email: userData.email, password: userData.password}, loginHandler(dispatch, true));
              }
            });
          }
        });
      }
    }, (error) => {
      dispatch({
        type: SIGNUP_FAILED,
        result: error
      });
    });
  };
}

export function logout() {
  return {
    type: LOGOUT,
    result: {}
  };
}

export function setLocumAgencies(agencies) {
  return {
    type: SET_LOCUM_AGENCIES,
    result: agencies
  };
}

function loginHandler(dispatch, isSignup) {
  const fail_code = isSignup ? SIGNUP_FAILED : LOGIN_FAILED;
  const success_code = isSignup ? SIGNUP_SUCCESS : LOGIN_SUCCESS;
  return (error, authData) => {

    if (error) {
      dispatch({
        type: fail_code,
        result: error
      });
    }else{
      let userData = {uid: authData.uid, token: authData.token};
      firebaseRef.child(`users/${authData.uid}`).once('value', (snap) => {
        let val = snap.val();
        userData = { ...userData, ...val};
        firebaseRef.child(`doctors/${userData.GMC}`).once('value', (snap1) => {
          let val1 = snap1.val();
          userData = {...userData, ...val1};
          let locum_agencies = userData.locum_agencies || [];
          firebaseRef.child('locum_agencies').once('value', (snap2) => {

            /* snap2.forEach((snap3) => {
              if (snap3.hasChild(`doctors/${userData.GMC}`)) {
                locum_agencies.push({id: snap3.key(), name: snap3.child('name').val()});
              }
            }); */
            const all_agencies = snap2.val();
            locum_agencies = Object.keys(all_agencies).filter((k) => _.includes(Object.keys(locum_agencies), k)).map( (k) => { return {id: k, name: all_agencies[k].name}; });
            userData = {...userData, ...{locum_agencies}};            
            dispatch({
              type: success_code,
              result: userData
            });
          }, (error3) => {
            dispatch({
              type: fail_code,
              result: error3
            });
          });
        }, (error2) => {
          dispatch({
            type: fail_code,
            result: error2
          });
        });
      }, (error1) => {
        dispatch({
          type: fail_code,
          result: error1
        });
      });
    }
  };
}

function resetPasswordHandler(dispatch) {
  return (error) => {
    if (error) {
      dispatch({
        type: RESET_PASSWORD_FAILED,
        result: error
      });
    }else {
      dispatch({
        type: RESET_PASSWORD_SUCCESS,
        result: true
      });
    }
  };
}

function updatePasswordHandler(dispatch) {
	return (error) => {
    if (error) {
      dispatch({
        type: UPDATE_PASSWORD_FAILED,
        result: error
      });
    }else {
      dispatch({
        type: UPDATE_PASSWORD_SUCCESS,
        result: true
      });
    }
  };
}

function signupHandler(dispatch) {
  return (error) => {
    if (error) {
      dispatch({
        type: SIGNUP_FAILED,
        result: error
      });
    }else {
      dispatch({
        type: SIGNUP_SUCCESS,
        result: true
      });
    }
  };
}
