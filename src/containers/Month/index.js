import React, { Component, PropTypes, Text, View, TouchableHighlight, TouchableOpacity, Platform, StyleSheet, ListView, InteractionManager } from 'react-native';
import moment from 'moment';
import { connect } from 'react-redux/native';
import _ from 'lodash';

import EventEmitter from 'EventEmitter';
import Subscribable from 'Subscribable';
import reactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';

import ToggleButton from '../../components/ToggleButton';
import { swipeable } from '../../components/GestureRecognizer';
import LoadingIndicator from '../../components/LoadingIndicator';
import {setWeek, setMonth, setYearMonth} from '../../redux/actions/CalendarNavActions';
import {setViewName} from '../../redux/actions/GeneralActions';
import {firebaseRef} from '../../config';
import {EVENT_SWIPE} from '../../constants';

const { directions: { SWIPE_UP, SWIPE_LEFT, SWIPE_DOWN, SWIPE_RIGHT } } = swipeable;

const dimensions = require('Dimensions').get('window');

const shiftTimes = {
  day: {start: 7, end: 15},
  evening: {start: 15, end: 23},
  night: {start: 23, end: 7}
};

const show_label = false;
const dayRowArray = ['Day', 'Evening', 'Night'];

const spaceText = " ";
const pointText = ".";
const commaText = ",";
const hyphenText = "-";
const enterText = "\n";

/*const getSectionData = (dataBlob, sectionID) => {
  return dataBlob[sectionID];
};

const getRowData = (dataBlob, sectionID, rowID) => {
  return dataBlob[sectionID + ':' + rowID];
};*/

/*const ds = new ListView.DataSource({
  getSectionData: getSectionData,
  getRowData: getRowData,
  rowHasChanged: (row1, row2) => row1 !== row2,
  sectionHeaderHasChanged: (s1, s2) => s1 !== s2
});*/

export default class MonthScreen extends Component {
  constructor(props){
    super(props);
    this.state = {
      records: [],
      dayColumnHeight: 0,
      bookingRecords: {},
      modalBookingText: ""
    };
  }

  static propTypes = {
    startingMonth: PropTypes.object,
    setViewName: PropTypes.func
  };

  componentDidMount() {
    this.addListenerOn(this.props.routeEvents, EVENT_SWIPE, this.onSwipe.bind(this));
    InteractionManager.runAfterInteractions(() => {
      this.loadMonthData(this.props.startingMonth);
      this.acceptedBookingRef = firebaseRef.child(`accepted_bookings/${this.props.user.GMC}`);
      // this.acceptedBookingRef.on('value', this.onAcceptedBookingChange, (error) => {}, this);
    });
  }

  componentWillReceiveProps(newProps) {
    if (!this.props.startingMonth.isSame(newProps.startingMonth)){
      // this.setState({records: []});
      if (this.monthRef) {
        this.monthRef.off('value', this.onValueChange, this);
      }
      this.loadMonthData(newProps.startingMonth);
    }
  }

  componentWillUnmount() {
    if (this.monthRef) {
      this.monthRef.off('value', this.onValueChange, this);
    }
  }

  getViewRecords(records) {
    let weeks = [];
    let availabilities = [];

    const bookingRecords = this.state.bookingRecords;
    Object.keys(records).forEach((key, index) => {
      if(bookingRecords[key]){
        records[key].isAcceptedBookingRow = true;

        //Get the width of BookingDisableBox
        let bookingDisableBoxCount = 0;
        Object.keys(shiftTimes).map((time) => {
          if(bookingRecords[key][time]){
            bookingDisableBoxCount++;
          }
        });

        const bookingDisableBoxHeight = (this.state.dayColumnHeight - 2 )* bookingDisableBoxCount / 3 + (bookingDisableBoxCount - 1);
        records[key].bookingDisableBoxHeight = bookingDisableBoxHeight;

        //Get the left of BookingDisableBox
        let bookingDisableBoxTop = 0;
        let bookingDisableStartTime = 0;


        if(bookingRecords[key].day){
          bookingDisableBoxTop = 0;
          bookingDisableStartTime = 7;
        }
        else if(bookingRecords[key].evening){
          bookingDisableBoxTop = (this.state.dayColumnHeight - 2)  / 3 + 1;
          bookingDisableStartTime = 15;
        }
        else if(bookingRecords[key].night){
          bookingDisableBoxTop = (this.state.dayColumnHeight - 2) * 2 / 3 + 2;
          bookingDisableStartTime = 23;
        }

        records[key].bookingDisableBoxTop = bookingDisableBoxTop;

        //Get the width of bookingBox
        const duration = bookingRecords[key].realEndTime - bookingRecords[key].realStartTime;
        const bookingBoxHeight = this.state.dayColumnHeight * duration / 24;
        records[key].bookingBoxHeight = bookingBoxHeight;

        //Get the left bookingBox
        const bookingBoxTop = bookingDisableBoxHeight * (bookingRecords[key].realStartTime - bookingDisableStartTime) / (bookingDisableBoxCount * 8);
        records[key].bookingBoxTop = bookingBoxTop;
      }
      else{
        records[key].isAcceptedBookingRow = false;
      }

      const shifts = Object.keys(records[key]);
      availabilities.push({
        isDayActive: shifts.indexOf('day') >= 0, isEveningActive: shifts.indexOf('evening') >= 0,
        isNightActive: shifts.indexOf('night') >= 0, isAcceptedBookingRow: records[key].isAcceptedBookingRow,
        bookingDisableBoxHeight: records[key].bookingDisableBoxHeight, bookingDisableBoxTop: records[key].bookingDisableBoxTop,
        bookingBoxHeight: records[key].bookingBoxHeight, bookingBoxTop: records[key].bookingBoxTop
      });
      if(index % 7 == 6) {
        weeks.push({startingDate: moment(key, 'YYYYMMDD').subtract(6, 'day'), availabilities: availabilities.slice(index - 6, index + 1)});
      }
    });
    return weeks;
  }

  getBookingData(){
    const defaultShiftTimes = {
      day: {start: 7, end: 15},
      evening: {start: 15, end: 23},
      night: {start: 23, end: 31}
    };

    const acceptedRecords = _.extend({}, this.state.acceptedRecords);
    const bookingRecords = {};
    Object.keys(acceptedRecords).map((key) => {
      const curDate = key;
      let shiftData = {};
      let startTime = Number(acceptedRecords[key].start.substring(0, 2)) + Number(acceptedRecords[key].start.substring(3, 5)) / 60;
      let endTime = Number(acceptedRecords[key].end.substring(0, 2)) + Number(acceptedRecords[key].end.substring(3, 5)) / 60;
      const endDate = acceptedRecords[key].endDate;

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


      if(endTime > startTime){
        shiftData['realStartTime'] = startTime;
        shiftData['realEndTime'] = endTime;

        const shiftTimesData = this.getShiftTimesData(shiftData, startTime, endTime);

        bookingRecords[curDate] = shiftTimesData;
      }
      else{
        const preDate = moment(curDate).subtract(1, 'day').format('YYYYMMDD');
        const firstStartTime = startTime;
        const firstEndTime = 31;
        const secondStartTime = 7;
        const secondEndTime = endTime;


        shiftDataArr = [];
        shiftData['realStartTime'] = firstStartTime;
        shiftData['realEndTime'] = firstEndTime;

        const firstShiftTimesData = this.getShiftTimesData(shiftData, firstStartTime, firstEndTime);

        if(!endDate){
          bookingRecords[preDate] = firstShiftTimesData;
        }
        else{
          bookingRecords[curDate] = firstShiftTimesData;
        }

        shiftDataArr = [];
        shiftData['realStartTime'] = secondStartTime;
        shiftData['realEndTime'] = secondEndTime;

        const secondShiftTimesData = this.getShiftTimesData(shiftData, secondStartTime, secondEndTime);

        if(!endDate){
          bookingRecords[curDate] = secondShiftTimesData;
        }
        else{
          bookingRecords[endDate] = secondShiftTimesData;
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

  onSwipe(args) {
    if(args.source == 'month') {
      switch(args.direction) {
        case SWIPE_LEFT:
          this.navigateToYearView(this.props.startingMonth.clone());
          break;
        case SWIPE_RIGHT:
          this.navigateToBack();
          break;
        case SWIPE_DOWN:
          this.navigateToPrevMonth();
          break;
        case SWIPE_UP:
          this.navigateToNextMonth();
          break;
        default:
          break;
      }
    }
  }

  onValueChange(snap) {
    const val = snap.val();
    // console.log('month availabilities: ', val);
    this.setState({records: _.extend({}, this.boilerPlateState, val)});
  }

  onAcceptedBookingChange(snap) {
    if(snap.val()){
      this.setState({acceptedRecords: snap.val()});
      this.getBookingData();
    }
    else{
      this.setState({acceptedRecords: {}});
      this.setState({bookingRecords: {}});
    }
  }

  loadMonthData(date) {
    let dt = date.clone();
    if (dt.weekday() == 0) {
      dt.subtract(1, 'day');
    }
    const startingDate =dt.startOf('week').add(1, 'day');
    const endOfMonth = date.clone().endOf('month');
    let iterator = startingDate.clone();

    this.boilerPlateState = {};

    while( !endOfMonth.isBefore(iterator) ) {
      _.range(7).forEach((d) => { this.boilerPlateState[iterator.clone().add(d, 'day').format('YYYYMMDD')] = {}; });
      iterator.add(7, 'days');
    }

    const {GMC} = this.props.user;
    this.monthRef = firebaseRef.child(`availability/${GMC}`)
      .orderByKey()
      .startAt(startingDate.format('YYYYMMDD'))
      .endAt(endOfMonth.endOf('week').add(1, 'day').format('YYYYMMDD'));

     this.monthRef.on('value', this.onValueChange, (error) => {}, this);
  }

	render() {
    const viewRecords = this.getViewRecords(this.state.records);
    const weekRows = viewRecords.map((week, index) => {
      return (
        <View key={index} style={styles.fillParent}>
          {this._renderSectionHeader(week.startingDate)}
          <TouchableOpacity style={styles.fillParent} activeOpacity={0.5} onPress={this.navigateToWeekView.bind(this, week)}>
            {this._renderRow(week, 0)}
          </TouchableOpacity>
        </View>
      )
    }, this);
		return (
			<View style={ styles.container }>
        <LoadingIndicator style={styles.loadingContainer} />
        <Text style={styles.subTitle}>{this.props.startingMonth.format('YYYY MMMM')}</Text>
        {this._renderHeader()}
        {weekRows}
      </View>
		);
	}

  _renderHeader() {
    return (
      <View style={styles.headerTitle} >
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((e, i)=> (<View key={i} style={styles.headerCellWrapper}><Text style={styles.headerCell}>{e}</Text></View>))}
      </View>
    );
  }

  _renderSectionHeader(sectionData) {

    return (
      <View style={styles.headerTitle} >
        {_.range(7).map((e, i)=>{
          const curDate = sectionData.clone().add(i, 'days');
          return (
            <View key={i} style={styles.headerCellWrapper}>
              <Text style={[{textAlign: 'center', fontWeight: 'bold'}, (curDate.isBefore(this.props.startingMonth) || curDate.isAfter(this.props.startingMonth.clone().endOf('month'))) ? {color: 'lightgrey'} : {} ]}>
                {curDate.format('D')}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }

  _renderRow(rowData, sectionID) {
    // return <Text>{`${sectionID}:${rowID}`}</Text>;
    return (
      <View style={styles.listRow}>
        { rowData.availabilities.map((av, i) => this._renderDay(av, i)) }
      </View>
    );
  }

  _renderDay(dayData, index){
    return (
      <View key={index} style={styles.dayColumn}
      onLayout={(event) => { this.setState({dayColumnHeight: event.nativeEvent.layout.height});  }}>
        {dayRowArray.map((rowID) => (
          <View key={rowID} style={[styles.shiftCell, {backgroundColor: (dayData[`is${rowID}Active`] ? this.getCellActiveColor(rowID.charAt(0)) : 'lightgrey')}]}>
            { show_label && <Text style={styles.shiftCellText}>{ rowID.charAt(0) }</Text> }
          </View>)
        )}
        {
          dayData.isAcceptedBookingRow &&
          <View style={[styles.acceptedDayView, {height: dayData.bookingDisableBoxHeight, top: dayData.bookingDisableBoxTop}]}>
            <View style={[styles.bookingBox, {height: dayData.bookingBoxHeight, top: dayData.bookingBoxTop}]} />
          </View>
        }
      </View>
    );
  }

  getCellActiveColor(key) {
    return key == 'D' ? '#fde5cd' : (key == 'E' ? '#f9ca9e' : '#f7b16b');
  }

  toggleShift(date, cellName, cellValue) {
    /*return new Promise((resolve, reject) => {

    });*/
    const lowercaseName = cellName.toLowerCase();
    const key = date.format('YYYYMMDD');
    const {GMC} = this.props.user;
    let data = _.clone(this.state.records[key], true);

    if(cellValue) {
      data = _.omit(data, lowercaseName);
    }else {
      _.extend(data, {[lowercaseName]: shiftTimes[lowercaseName]});
    }
    firebaseRef.child(`availability/${GMC}/${key}`).set(data);
  }

  navigateToWeekView(week) {
    InteractionManager.runAfterInteractions(() => {
      this.props.setWeek(week.startingDate);
      this.props.navigator.jumpTo(this.props.navigator.getCurrentRoutes()[0]);
      this.props.setViewName('week');
    });
  }

  navigateToYearView(month) {
    InteractionManager.runAfterInteractions(() => {
      this.props.setYearMonth(month);
      this.props.navigator.jumpTo(this.props.navigator.getCurrentRoutes()[2]);
      this.props.setViewName('year');
    });
  }

  navigateToBack() {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigator.jumpTo(this.props.navigator.getCurrentRoutes()[0]);
      this.props.setViewName('week');
    });
  }

  navigateToPrevMonth() {
    InteractionManager.runAfterInteractions(() => {
      this.props.setMonth(this.props.startingMonth.clone().subtract(1, 'month'));
    });
  }

  navigateToNextMonth() {
    InteractionManager.runAfterInteractions(() => {
      this.props.setMonth(this.props.startingMonth.clone().add(1, 'month'));
    });
  }
}

reactMixin(MonthScreen.prototype, Subscribable.Mixin);

export default connect(
    state => ({user: state.auth.user, startingMonth: state.calendarnav.startingMonth}),
    {setWeek, setMonth, setYearMonth, setViewName}
  )(swipeable({
    horizontal:true,
    vertical: true,
    continuous: false,
    initialVelocityThreshold: 0.7
  })(MonthScreen));

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  subTitle: {
    fontSize: 20,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 5 : 2,
    backgroundColor: '#d8d8d8'
  },
  headerTitle: {
    flexDirection:'row',
    borderTopWidth: 1,
    borderColor: 'black',
    backgroundColor: '#eee'
  },
  listRow: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: 'black'
  },
  dayColumn: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-between',
    borderLeftWidth: 1,
    borderColor: '#eee',
  },
  acceptedDayView:{
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#d1e1f3',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  bookingView:{
    backgroundColor: '#69a2db'
  },
  bookingBox:{
    flex: 1,
    backgroundColor: '#69a2db',
    justifyContent: 'center',
    alignItems:'center',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  },
  headerCell: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  headerCellWrapper: {
    flex: 1,
    borderLeftWidth: 1,
    borderColor: '#eee'
  },
  shiftCell: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
  },
  shiftCellText: {
    textAlign: 'center'
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: 'black'
  },
  fillParent: {
    flex: 1
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
