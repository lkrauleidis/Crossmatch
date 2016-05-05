import React, { Component, DeviceEventEmitter, PropTypes, ScrollView, Text, View, Alert,
  TouchableOpacity, Platform, StyleSheet, ListView, InteractionManager } from 'react-native';
import {Icon} from 'react-native-icons';
import moment from 'moment';
import { connect } from 'react-redux/native';
import _ from 'lodash';

import EventEmitter from 'EventEmitter';
import Subscribable from 'Subscribable';
import reactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';

import LoadingIndicator from '../../components/LoadingIndicator';
import {removeFirebaseUnconfirmedBookingData, setFirebaseRefusedBookingData,
  setFirebaseAcceptedBookingData, setFirebaseAvailabilityData} from '../../redux/actions/FirebaseValueActions';
import {firebaseRef} from '../../config';
import {BOOKING_AGENCY} from '../../constants';
import {firebaseVal} from '../../redux/reducers/firebaseVal';

var dataMap;

const dimensions = require('Dimensions').get('window');
const spaceText = " ";
const pointText = ".";
const commaText = ",";
const hyphenText = "-";

const defaultShiftTimes = {
  day: {start: 7, end: 15},
  evening: {start: 15, end: 23},
  night: {start: 23, end: 31}
};

export default class BookingScreen extends Component {

  constructor(props){
    super(props);
    this.state = {
      unConfirmedRecords: {},
      refusedRecords: {},
      acceptedRecords: {},
      availabilityRecords: {},
      agency:""
    };
  }

  static propTypes = {
    user: PropTypes.object,
    unconfirmedBookingData: PropTypes.object,
    isBookingUnconfirmedVal: PropTypes.bool,
    isBookingRefusedVal: PropTypes.bool,
    isBookingAcceptedVal: PropTypes.bool,
    isSettingAvailabilityVal: PropTypes.bool,
    setFirebaseUnconfirmedBookingData: PropTypes.func,
    setFirebaseRefusedBookingData: PropTypes.func,
    setFirebaseAcceptedBookingData: PropTypes.func,
    setFirebaseAvailabilityData: PropTypes.func
  };

  componentWillReceiveProps(newProps) {
    if(this.props.unconfirmedBookingData != newProps.unconfirmedBookingData){
      this.setState({unConfirmedRecords: newProps.unconfirmedBookingData});

      const firstKey = Object.keys(newProps.unconfirmedBookingData)[0];
      const agency = newProps.unconfirmedBookingData[firstKey].agency;
      this.setState({agency: agency});

      this.refused_BookingRef = firebaseRef.child(`availability/${this.props.user.GMC}`);
      this.refused_BookingRef.once('value', this.onAvailabilityChange, (error) => {}, this);

      this.acceptedBookingRef = firebaseRef.child(`accepted_bookings/${this.props.user.GMC}`);
      this.acceptedBookingRef.once('value', this.onAcceptedBookingChange, (error) => {}, this);

      this.refused_BookingRef = firebaseRef.child(`refused_bookings/${this.props.user.GMC}`);
      this.refused_BookingRef.once('value', this.onRefusedBookingChange, (error) => {}, this);
    }
  }

  onAvailabilityChange(snap){
    if(snap.val()){
      this.setState({availabilityRecords: _.extend({}, snap.val())});
    }
    else{
      this.setState({availabilityRecords: {}});
    }
  }

  onAcceptedBookingChange(snap){
    if(snap.val()){
      this.setState({acceptedRecords: _.extend({}, snap.val())});
    }
    else{
      this.setState({acceptedRecords: {}});
    }
  }

  onRefusedBookingChange(snap){
    if(snap.val()){
      this.setState({refusedRecords: _.extend({}, snap.val())});
    }
    else{
      this.setState({refusedRecords: {}});
    }
  }

  onConfirm(){
    let bookingData = {};

    //Set Refused Booking Data
    bookingData[`refused_bookings/${this.props.user.GMC}`] = this.state.refusedRecords;
    this.props.setFirebaseRefusedBookingData(bookingData);

    //Set Accepted Booking Data
    bookingData = {};

    this.setState({acceptedRecords: _.extend(this.state.acceptedRecords, this.state.unConfirmedRecords)});
    bookingData[`accepted_bookings/${this.props.user.GMC}`] = this.state.acceptedRecords;
    this.props.setFirebaseAcceptedBookingData(bookingData);

    //Set Availability Data
    const availabilityBaseUrl = `availability/${this.props.user.GMC}/`;
    let availabilityData = {};
    const availabilityRecords = this.getAvailabilities(this.state.unConfirmedRecords);
    availabilityData[`availability/${this.props.user.GMC}`] = availabilityRecords;

    this.props.setFirebaseAvailabilityData(availabilityData);

    //Set Uncofirmed Booking Data
    bookingData = {};
    bookingData[`unconfirmed_bookings/${this.props.user.GMC}`] = null;
    this.props.removeFirebaseUnconfirmedBookingData(bookingData);
  }

  onClose(key){
     let unconfirmedBookingData = this.state.unConfirmedRecords;
     let refusedRecords = {};
     refusedRecords[key] = unconfirmedBookingData[key];
     this.setState({refusedRecords: _.extend(this.state.refusedRecords, refusedRecords)});

     delete unconfirmedBookingData[key];
     this.setState({unConfirmedRecords: unconfirmedBookingData});
  }

  getAvailabilities(acceptedRecords){

    Object.keys(acceptedRecords).map((key) => {

      const curDate = key;
      let shiftTimesData = {};

      let shiftData = _.extend({}, this.state.availabilityRecords[key]);
      let startTime = acceptedRecords[key].start.substring(0, 2);

      let endTime = Number(acceptedRecords[key].end.substring(0, 2));
      const endDate = Number(acceptedRecords[key].endDate);


      if(startTime < 7){
        startTime = 24 + startTime;
      }
      if(endTime < 7){
        endTime = 24 + endTime;
      }

      if(endTime > startTime){

        shiftTimesData = this.getShiftTimesData(shiftData, startTime, endTime);
        this.state.availabilityRecords[curDate] = shiftTimesData;
      }
      else{
          const preDate = moment(curDate).subtract(1, 'day').format('YYYYMMDD');
          const firstStartTime = startTime;
          const firstEndTime = 31;
          const secondStartTime = 7;
          const secondEndTime = endTime;

          const preShiftData = _.extend({}, this.state.availabilityRecords[preDate]);
          const firstShiftTimesData = this.getShiftTimesData(preShiftData, firstStartTime, firstEndTime);
          this.state.availabilityRecords[preDate] = firstShiftTimesData;
          if(!endDate){
            this.state.availabilityRecords[preDate] = firstShiftTimesData;
          }
          else{
            this.state.availabilityRecords[curDate] = firstShiftTimesData;
          }

          const secondShiftTimesData = this.getShiftTimesData(shiftData, secondStartTime, secondEndTime);
          if(!endDate){
            this.state.availabilityRecords[curDate] = firstShiftTimesData;
          }
          else{
            this.state.availabilityRecords[endDate] = firstShiftTimesData;
          }
      }
    });

    return this.state.availabilityRecords;
  }

  getShiftTimesData(shiftData, startTime, endTime){

    const shiftTimesData = _.clone(shiftData, true);

    Object.keys(defaultShiftTimes).map((time) => {
      if((startTime >= defaultShiftTimes[time].start && startTime < defaultShiftTimes[time].end) ||
         (endTime > defaultShiftTimes[time].start && endTime <= defaultShiftTimes[time].end) ||
         (startTime < defaultShiftTimes[time].start && endTime > defaultShiftTimes[time].end)){
           shiftTimesData[time] = null;
      }
    });

    return shiftTimesData;
  }

  /**
   * Render
   *
   * @return {jsx}
   */
  render() {
    const viewRecords = this.state.unConfirmedRecords;
    const bookingRows = Object.keys(viewRecords).map((key) => this._renderRow(viewRecords, key));

    return (
      <View style={ styles.container }>
        <View style={ styles.subContainer }>
          <View style={styles.titleView}>
            <Text style={styles.titleText}>{this.state.agency + spaceText + BOOKING_AGENCY}</Text>
          </View>
          <View style={styles.scrollContanier}>
            <ScrollView style={styles.scrollView}>
              { bookingRows }
            </ScrollView>
          </View>
          <TouchableOpacity
            onPress={this.onConfirm.bind(this)}
            style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
        {(this.props.isBookingUnconfirmedVal || this.props.isBookingRefusedVal || this.props.isBookingAcceptedVal || this.props.isSettingAvailabilityVal) &&
          <LoadingIndicator style={styles.loadingContainer} />
        }
      </View>
    );
  }

  _renderRow(viewRecords, key) {
    const rowText = key.substring(6, 8) + pointText + key.substring(4, 6) + pointText + key.substring(0, 4) +
    spaceText + viewRecords[key].agency +
    commaText + spaceText + viewRecords[key].location +
    commaText + spaceText + viewRecords[key].start + hyphenText + viewRecords[key].end;

    return (
      <View key = {key} style={styles.rowView}>
        <Text style={styles.rowText}>{ rowText }</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={ this.onClose.bind(this, key) }>
        <Icon
          name='fontawesome|times-circle'
          size={30}
          color={'#ff0018'}
          style={styles.closeIcon} />
        </TouchableOpacity>
      </View>
    );
  }
}

reactMixin(BookingScreen.prototype, Subscribable.Mixin);

export default connect(
    state => ({
      user: state.auth.user,
      unconfirmedBookingData: state.firebaseVal.unconfirmedBookingData,
      isBookingUnconfirmedVal: state.firebaseVal.isBookingUnconfirmedVal,
      isBookingRefusedVal: state.firebaseVal.isBookingRefusedVal,
      isBookingAcceptedVal: state.firebaseVal.isBookingAcceptedVal,
      isSettingAvailabilityVal: state.firebaseVal.isSettingAvailabilityVal
    }),
    {removeFirebaseUnconfirmedBookingData, setFirebaseRefusedBookingData, setFirebaseAcceptedBookingData, setFirebaseAvailabilityData}
  )(BookingScreen);

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3f3',
    flexDirection: 'column'
  },
  subContainer:{
    flex: 15,
    backgroundColor: '#f3f3f3',
    flexDirection: 'column',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 25 : 2,
    left: 20,
    bottom: 20,
    right: 20
  },
  titleView: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleText:{
    flex:1,
    fontSize: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: 'Helvetica Neue',
  },
  scrollContanier:{
    flex: 12,
    backgroundColor: '#f3f3f3',
    flexDirection: 'column',
    borderColor: 'black',
    borderRadius: 5,
    borderWidth: 1,
    paddingTop: 1,
    paddingBottom:1
  },
  scrollView:{
    backgroundColor: '#f3f3f3',
    flexDirection: 'column',
    padding: 10
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  confirmButton: {
    flex: 1,
		padding:10,
		backgroundColor: '#2c3e50',
		justifyContent: 'center',
		alignItems: 'center',
    marginTop:10
	},
  confirmButtonText:{
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color:'white'
  },
  rowView:{
    flex: 1,
    flexDirection: 'row',
    borderColor: 'black',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom:10
  },
  rowText:{
    flex:0.9,
    justifyContent: 'center',
    textAlign: 'left',
    fontSize: 18,
    fontFamily: 'Helvetica Neue',
    color:'black',
    padding:10
  },
  closeIcon:{
    width:30,
    height:30
  },
  closeButton:{
    marginRight:10
  }
});
