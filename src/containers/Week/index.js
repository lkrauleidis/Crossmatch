import React, { Component, DeviceEventEmitter, PropTypes, Text, View, Alert, TouchableHighlight,
  TouchableOpacity, Platform, StyleSheet, ListView, InteractionManager } from 'react-native';
import moment from 'moment';
import { connect } from 'react-redux/native';
import _ from 'lodash';
import Modal from 'react-native-modalbox';

import EventEmitter from 'EventEmitter';
import Subscribable from 'Subscribable';
import reactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';

import ToggleButton from '../../components/ToggleButton';
import LineSeparator from '../../components/LineSeparator';
import { swipeable } from '../../components/GestureRecognizer';
import LoadingIndicator from '../../components/LoadingIndicator';
import {setWeek, setMonth, setYearMonth} from '../../redux/actions/CalendarNavActions';
import {setLocumAgencies} from '../../redux/actions/AuthActions';
import {setAllWeekVal, weekDataLoaded, weekDataChanged} from '../../redux/actions/FirebaseValueActions';
import {setViewName} from '../../redux/actions/GeneralActions';
import {firebaseRef} from '../../config';
import {EVENT_SWIPE, EVENT_CONFIRM} from '../../constants';
import {firebaseVal} from '../../redux/reducers/firebaseVal';

var dataMap;

const { directions: { SWIPE_UP, SWIPE_LEFT, SWIPE_DOWN, SWIPE_RIGHT } } = swipeable;

const dimensions = require('Dimensions').get('window');
const bookingMiddleTextBoxMinWidth = 60;

const spaceText = " ";
const pointText = ".";
const commaText = ",";
const hyphenText = "-";
const enterText = "\n";

const shiftTimes = {
  day: {start: 7, end: 15},
  evening: {start: 15, end: 23},
  night: {start: 23, end: 7}
};

class WeekScreen extends Component {

  constructor(props){
    super(props);
    this.state = {
      records: {},
      acceptedRecords: {},
      bookingRecords: {},
      rowWidth:0,
      modalBookingText: ""
    };
  }

  static propTypes = {
    startingWeek: PropTypes.object,
    routeEvents: PropTypes.object,
    loading: PropTypes.bool,
    isConfirmData: PropTypes.bool,
    setViewName:PropTypes.func,
    weekDataLoaded: PropTypes.func,
    weekDataChanged: PropTypes.func,
    setAllWeekVal: PropTypes.func,
  };

  componentDidMount() {
    this.props.setViewName('week');

    this.addListenerOn(this.props.routeEvents, EVENT_SWIPE, this.onSwipe.bind(this));
    this.addListenerOn(this.props.routeEvents, EVENT_CONFIRM, this.onConfirm.bind(this, null));
    InteractionManager.runAfterInteractions(() => {
      this.loadWeekData(this.props.startingWeek);
      this.props.weekDataLoaded();
      this.locumAgenciesRef = firebaseRef.child(`doctors/${this.props.user.GMC}/locum_agencies`);
      this.locumAgenciesRef.on('value', this.onLocumAgenciesChange, (error) => {}, this);

      this.acceptedBookingRef = firebaseRef.child(`accepted_bookings/${this.props.user.GMC}`);
      this.acceptedBookingRef.on('value', this.onAcceptedBookingChange, (error) => {}, this);
    });

    dataMap = {};
  }

  componentWillReceiveProps(newProps) {
    if (!this.props.startingWeek.isSame(newProps.startingWeek)){
      // this.setState({records: []});
      if (this.weekRef) {
        this.weekRef.off('value', this.onValueChange, this);
      }

      dataMap = {};
      this.loadWeekData(newProps.startingWeek);
      this.props.weekDataLoaded();
    }
  }

  componentWillUnmount() {
    if (this.weekRef) {
      this.weekRef.off('value', this.onValueChange, this);
    }

    if (this.locumAgenciesRef) {
      this.locumAgenciesRef.off('value', this.onLocumAgenciesChange, this);
    }
  }

  onSwipe(args) {
    if(args.source == 'week') {
      this.showAlertDlg(args.direction);
    }
  }

  onConfirm(direction){
    var copyDataMap = Object.assign({}, dataMap);
    this.props.setAllWeekVal(copyDataMap, this.props.routeEvents, direction);
    dataMap = {};
  }

  onValueChange(snap) {
    if(!this.props.loading){
      const val = snap.val();
      this.setState({records: _.extend({}, this.boilerPlateState, val)});
    }
  }

  onLocumAgenciesChange(snap) {
    console.log('Firebase changed: ', snap);
    let locum_agencies = snap.val();
    firebaseRef.child('locum_agencies').once('value', (snap2) => {
      const all_agencies = snap2.val();
      locum_agencies = Object.keys(all_agencies).filter((k) => _.includes(Object.keys(locum_agencies), k)).map( (k) => { return {id: k, name: all_agencies[k].name}; });
      this.props.setLocumAgencies(locum_agencies);
    }, (err) => {} );
  }

  onAcceptedBookingChange(snap) {
    if(snap.val()){
      this.setState({acceptedRecords: _.extend({}, snap.val())});
      this.getBookingData();
    }
    else{
      this.setState({acceptedRecords: {}});
      this.setState({bookingRecords: {}});
    }
  }

  showAlertDlg(direction){
    if(this.props.isConfirmData){
      Alert.alert(
        'Warning',
        'You have not saved your changes. What do you want to do? SAVE or DISCARD',
        [
          {text: 'SAVE', onPress: () => this.onConfirm(direction)},
          {text: 'DISCARD', onPress: () => this.swipeView(direction)}
        ]
      );
    }
    else{
      this.swipeView(direction);
    }
  }

  swipeView(direction){
    switch(direction) {
      case SWIPE_LEFT:
        this.navigateToMonthView(this.getCurrentISOCalendarMonth());
        break;
      case 'SWIPE_DOUBLE_LEFT':
        this.navigateToYearView(this.props.startingWeek.clone().startOf('month'));
        break;
      case SWIPE_DOWN:
        this.navigateToPrevWeek();
        break;
      case SWIPE_UP:
        this.navigateToNextWeek();
        break;
      default:
        break;
    }
  }

  getViewRecords(records) {

    const bookingRecords = this.state.bookingRecords;
    Object.keys(records).map((key) =>
    {
      if(bookingRecords[key]){

        const bookingArray = [];
        bookingRecords[key].map((bookingObj) => {
          const bookingData = {};

          bookingData["bookingMiddleText"] = bookingObj.location;

          let endDate = "";
          if(bookingObj.endDate){
            endDate = bookingObj.endDate + commaText + spaceText + enterText;
          }
          bookingData["bookingBigText"] = bookingObj.agency + commaText + spaceText + enterText + bookingObj.location +
          commaText + spaceText + enterText + bookingObj.startDate +
          commaText + spaceText + enterText + endDate + bookingObj.start + hyphenText + bookingObj.end;

          const rowWidth = dimensions.width * 3 / 3.5;

          //Get the width of BookingDisableBox
          let bookingDisableBoxCount = 0;
          Object.keys(shiftTimes).map((time) => {
            if(bookingObj[time]){
              bookingDisableBoxCount++;
            }
          });

          const bookingDisableBoxWidth = (this.state.rowWidth - 2 )* bookingDisableBoxCount / 3 + (bookingDisableBoxCount - 1);
          bookingData["bookingDisableBoxWidth"] = bookingDisableBoxWidth;

          //Get the left of BookingDisableBox
          let bookingDisableBoxLeft = 0;
          let bookingDisableStartTime = 0;


          if(bookingObj.day){
            bookingDisableBoxLeft = 0;
            bookingDisableStartTime = 7;
          }
          else if(bookingObj.evening){
            bookingDisableBoxLeft = (this.state.rowWidth - 2)  / 3 + 1;
            bookingDisableStartTime = 15;
          }
          else if(bookingObj.night){
            bookingDisableBoxLeft = (this.state.rowWidth - 2) * 2 / 3 + 2;
            bookingDisableStartTime = 23;
          }

          bookingData["bookingDisableBoxLeft"] = bookingDisableBoxLeft;

          //Get the width of BookingTextBox
          const duration = bookingObj.realEndTime - bookingObj.realStartTime;
          const bookingTextBoxWidth = this.state.rowWidth * duration / 24;
          bookingData["bookingTextBoxWidth"] = bookingTextBoxWidth;

          //Get the left BookingTextBox
          const bookingTextBoxLeft = bookingDisableBoxWidth * (bookingObj.realStartTime - bookingDisableStartTime) / (bookingDisableBoxCount * 8);
          bookingData["bookingTextBoxLeft"] = bookingTextBoxLeft;

          bookingArray.push(bookingData);
        });

        records[key].bookingArray = bookingArray;
      }
    });

    return Object.keys(records).map((key, index) => {
      const shifts = Object.keys(records[key]);
      return {
        date: moment(key, 'YYYYMMDD'), isDayActive: shifts.indexOf('day') >= 0, isEveningActive: shifts.indexOf('evening') >= 0,
        isNightActive: shifts.indexOf('night') >= 0, bookingArray: records[key].bookingArray
      };
    });
  }

  getBookingData(){

    const acceptedRecords = _.extend({}, this.state.acceptedRecords);
    const bookingRecords = {};
    Object.keys(acceptedRecords).map((key) => {
      const curDate = key;
      let shiftDataArr = [];
      let shiftData = {};
      let startTime = Number(acceptedRecords[key].start.substring(0, 2)) + Number(acceptedRecords[key].start.substring(3, 5)) / 60;
      let endTime = Number(acceptedRecords[key].end.substring(0, 2)) + Number(acceptedRecords[key].end.substring(3, 5)) / 60;
      const endDate = acceptedRecords[key].endDate;
      const startDateWithFormat = moment(key, 'YYYYMMDD').format('ll');
      let endDateWithFormat = null;
      if(endDate){
        endDateWithFormat = moment(endDate, 'YYYYMMDD').format('ll');
      }

      if(startTime < 7){
        startTime = 24 + startTime;
      }
      if(endTime < 7){
        endTime = 24 + endTime;
      }

      shiftData['start'] = acceptedRecords[key].start;
      shiftData['end'] = acceptedRecords[key].end;
      shiftData['agency'] = acceptedRecords[key].agency;
      shiftData['location'] = acceptedRecords[key].location;
      shiftData['startDate'] = startDateWithFormat;
      shiftData['endDate'] = endDateWithFormat;

      if(endTime > startTime){
        shiftDataArr = [];
        shiftData['realStartTime'] = startTime;
        shiftData['realEndTime'] = endTime;

        const shiftTimesData = this.getShiftTimesData(shiftData, startTime, endTime);

        shiftDataArr.push(shiftTimesData);
        bookingRecords[curDate] = shiftDataArr;
      }
      else{
          const preDate = moment(curDate).subtract(1, 'day').format('YYYYMMDD');
          const firstStartTime = startTime;
          const firstEndTime = 31;
          const secondStartTime = 7;
          const secondEndTime = endTime;

          if(!endDate){
            shiftData['startDate'] = moment(preDate, 'YYYYMMDD').format('ll');
            shiftData['endDate'] = moment(curDate, 'YYYYMMDD').format('ll');
          }
          else{
            shiftData['startDate'] = startDateWithFormat;
            shiftData['endDate'] = endDateWithFormat;
          }


          shiftDataArr = [];
          shiftData['realStartTime'] = firstStartTime;
          shiftData['realEndTime'] = firstEndTime;

          const firstShiftTimesData = this.getShiftTimesData(shiftData, firstStartTime, firstEndTime);
          shiftDataArr.push(firstShiftTimesData);

          if(!endDate){
            bookingRecords[preDate] = shiftDataArr;
          }
          else{
            bookingRecords[curDate] = shiftDataArr;
          }

          shiftDataArr = [];
          shiftData['realStartTime'] = secondStartTime;
          shiftData['realEndTime'] = secondEndTime;

          const secondShiftTimesData = this.getShiftTimesData(shiftData, secondStartTime, secondEndTime);
          shiftDataArr.push(secondShiftTimesData);

          if(!endDate){
            bookingRecords[curDate] = shiftDataArr;
          }
          else{
            bookingRecords[endDate] = shiftDataArr;
          }
      }      
    });

    this.setState({bookingRecords: bookingRecords});
  }

  getShiftTimesData(shiftData, startTime, endTime){
    const defaultShiftTimes = {
      day: {start: 7, end: 15},
      evening: {start: 15, end: 23},
      night: {start: 23, end: 31}
    };

    const shiftTimesData = _.clone(shiftData, true);

    Object.keys(defaultShiftTimes).map((time) => {
      shiftTimesData[time] = null;
      if((startTime >= defaultShiftTimes[time].start && startTime < defaultShiftTimes[time].end) ||
         (endTime > defaultShiftTimes[time].start && endTime <= defaultShiftTimes[time].end) ||
         (startTime < defaultShiftTimes[time].start && endTime > defaultShiftTimes[time].end)){
           shiftTimesData[time] = defaultShiftTimes[time];
      }
    });

    return shiftTimesData;
  }

  loadWeekData(date) {
    const {GMC} = this.props.user;
    /* let dt = date.clone();
    if (dt.weekday() == 0) {
      dt.subtract(1, 'day');
    }
    let startingDate = dt.startOf('week').add(1, 'day'); */
    let startingDate = date.clone();

    this.boilerPlateState = {};
    _.range(7).forEach((d) => { this.boilerPlateState[startingDate.clone().add(d, 'day').format('YYYYMMDD')] = {}; });
    this.weekRef = firebaseRef.child(`availability/${GMC}`)
      .orderByKey()
      .startAt(startingDate.format('YYYYMMDD'))
      .endAt(startingDate.clone().add(6, 'days').format('YYYYMMDD'));
    this.weekRef.on('value', this.onValueChange, (error) => {}, this);
  }

  getStartOfCurrentWeek() {
    /* let dt = this.props.startingWeek.clone();
    if (dt.weekday() == 0) {
      dt.subtract(1, 'day');
    }
    return dt.startOf('week').add(1, 'day'); */
    return this.props.startingWeek.clone();
  }

  getCurrentISOCalendarMonth() {
    const endOfWeek = this.props.startingWeek.clone().add(6, 'day');
    if (this.props.startingWeek.isSame(endOfWeek, 'month')) {
      return this.props.startingWeek.clone().startOf('month');
    }
    if (endOfWeek.clone().startOf('month').diff(this.props.startingWeek, 'days') >= 4) {
      return this.props.startingWeek.clone().startOf('month');
    }
    return endOfWeek.clone().startOf('month');
  }
  /**
   * Render
   *
   * @return {jsx}
   */
  render() {
    const viewRecords = this.getViewRecords(_.clone(this.state.records, true));
    const dateRows = viewRecords.map( (data, index) => this._renderRow(data, 0, index));
    /* let dt = this.props.startingWeek.clone();
    if (dt.weekday() == 0) {
      dt.subtract(1, 'day');
    }
    const startingDate = dt.startOf('week').add(1, 'day'); */
    return (
      <View style={ styles.container }>
        <LoadingIndicator style={styles.loadingContainer} />
        <Text style={styles.subTitle}>{this.getCurrentISOCalendarMonth().format('YYYY MMMM')}</Text>
        {dateRows}
        {this.props.loading && <LoadingIndicator style={styles.loadingContainer} />}
        <Modal style={styles.bookingTextModal} position={'center'} animationDuration={200} ref={'bookingTextModal'}>
          <Text style={styles.modalText}>
            { this.state.modalBookingText }
          </Text>
        </Modal>
      </View>
    );
  }

  _renderRow(rowData: any, sectionID: number, rowID: number) {
  	return (
  		<View key={rowID} style={styles.listRow} >
        <View style={styles.date}>
          <Text style={styles.dayOfWeek}>{rowData.date.format('D')}</Text>
          <Text style={styles.dayNumber}>{rowData.date.format('ddd')}</Text>
        </View>
        <View style={styles.toggleView} onLayout={(event) => { this.setState({rowWidth: event.nativeEvent.layout.width});  }}>
          <ToggleButton activeColor={'#fde5cd'} isActive={rowData.isDayActive} onPress={this.toggleShift.bind(this, rowData, 'Day')}>Day</ToggleButton>
          { //!rowData.isDayActive && !rowData.isEveningActive &&
            <LineSeparator isVertical={true} color={'#ccc'} />
          }
          <ToggleButton activeColor={'#f9ca9e'} isActive={rowData.isEveningActive} onPress={this.toggleShift.bind(this, rowData, 'Evening')}>Evening</ToggleButton>

          { //!rowData.isEveningActive && !rowData.isNightActive &&
            <LineSeparator isVertical={true} color={'#ccc'} />
          }
          <ToggleButton activeColor={'#f7b16b'} isActive={rowData.isNightActive} onPress={this.toggleShift.bind(this, rowData, 'Night')}>Night</ToggleButton>
          {
            rowData.bookingArray &&
            rowData.bookingArray.map((bookingObj, index) => {
              return(
                <View key={index} style={[styles.acceptedRowView, {width: bookingObj.bookingDisableBoxWidth, left: bookingObj.bookingDisableBoxLeft}]}>
                  <TouchableOpacity onPress={this.openBookingTextModal.bind(this, bookingObj.bookingBigText)}
                    style={[styles.bookingTextButton, {width: bookingObj.bookingTextBoxWidth, left: bookingObj.bookingTextBoxLeft}]}>
                    <Text style={styles.bookingText}>
                      { bookingObj.bookingTextBoxWidth >= bookingMiddleTextBoxMinWidth && bookingObj.bookingMiddleText }
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          }
        </View>
      </View>
  	);
  }

  openBookingTextModal(bookingText){
    this.setState({modalBookingText: bookingText});
    this.refs.bookingTextModal.open();
  }

  _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
  	return (
  		<View key={rowID} style={styles.separator} />
  	)
  }

  toggleShift(rowData, name) {
    this.props.weekDataChanged();

    const lowercaseName = name.toLowerCase();
    const key = rowData.date.format('YYYYMMDD');
    const {GMC} = this.props.user;
    let data = _.clone(this.state.records[key], true);
    let tempRecords = _.clone(this.state.records, true);

    if(rowData[`is${name}Active`]) {
      data = _.omit(data, lowercaseName);
    }else {
      data = _.extend(data, {[lowercaseName]: shiftTimes[lowercaseName]});
    }

    tempRecords[key] = data;
    this.setState({records: tempRecords});

    dataMap[`availability/${GMC}/${key}`] = data;
  }

  navigateToMonthView(month) {
    InteractionManager.runAfterInteractions(() => {
      this.props.setMonth(month);
      this.props.navigator.jumpTo(this.props.navigator.getCurrentRoutes()[1]);
      this.props.setViewName('month');
    });
  }

  navigateToYearView(month) {
    InteractionManager.runAfterInteractions(() => {
      this.props.setYearMonth(month);
      this.props.navigator.jumpTo(this.props.navigator.getCurrentRoutes()[2]);
      this.props.setViewName('year');
    });
  }

  navigateToPrevWeek() {
    InteractionManager.runAfterInteractions(() => {
      this.props.setWeek(this.getStartOfCurrentWeek().subtract(1, 'week'));
    });
  }

  navigateToNextWeek() {
    InteractionManager.runAfterInteractions(() => {
      this.props.setWeek(this.getStartOfCurrentWeek().add(1, 'week'));
    });
  }
}

reactMixin(WeekScreen.prototype, Subscribable.Mixin);

export default connect(
    state => ({user: state.auth.user, startingWeek: state.calendarnav.startingWeek,
      loading: state.firebaseVal.loading, isConfirmData: state.firebaseVal.isConfirmData}),
    {setWeek, setMonth, setYearMonth, setLocumAgencies, setAllWeekVal, weekDataLoaded, weekDataChanged, setViewName}
  )(swipeable({
    horizontal:true,
    vertical: true,
    continuous: false,
    initialVelocityThreshold: 0.7
  })(WeekScreen));

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column'
  },
  subTitle: {
    fontSize: 20,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 5 : 2,
    backgroundColor: '#d8d8d8'
  },
  listView: {
    flex: 1,
    flexDirection: 'column'
  },
  listRow: {
    flexDirection: 'row',
    flex: 3.5,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: 'black'
  },
  date: {
    flex: 0.5,
    justifyContent: 'space-between',
    padding: 5
  },
  dayOfWeek: {
    fontSize: 20
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  toggleView:{
    flexDirection: 'row',
    flex: 3,
    justifyContent: 'space-between',
  },
  acceptedRowView:{
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: '#d1e1f3',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 5
  },
  bookingTextButton:{
    flex: 1,
    backgroundColor: '#69a2db',
    justifyContent: 'center',
    alignItems:'center',
    flexDirection: 'column',
    paddingHorizontal: 5
  },
  bookingText:{
    backgroundColor: '#69a2db',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Helvetica Neue',
    color:'black'
  },
  modalText:{
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: '#69a2db',
    justifyContent: 'center',
    textAlign: 'left',
    fontSize: 14,
    fontFamily: 'Helvetica Neue',
    color:'black',
    padding: 10,
  },
  bookingTextModal:{
    padding: 10,
  	width: 150,
    height: 100
  },
  separator: {
  	flex: 1,
  	height: 1,
  	backgroundColor: 'black'
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)'
  }
});
