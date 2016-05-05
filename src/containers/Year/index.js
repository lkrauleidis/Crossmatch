import React, { Component, PropTypes, Text, View, TouchableHighlight, TouchableOpacity, ListView, Platform, StyleSheet, InteractionManager } from 'react-native';
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
import {setWeek, setMonth, setYearMonth, startNavLoading, stopNavLoading} from '../../redux/actions/CalendarNavActions';
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

export default class YearScreen extends Component {
	constructor(props){
    super(props);
    this.state = {
      records: []
    };
  }

  static propTypes = {
    startingYearMonth: PropTypes.object,
    setViewName: PropTypes.func
  };

  componentDidMount() {
    this.addListenerOn(this.props.routeEvents, EVENT_SWIPE, this.onSwipe.bind(this));
    InteractionManager.runAfterInteractions(() => {
      this.loadYearData(this.props.startingYearMonth);
    });
  }

  componentWillReceiveProps(newProps) {
    if (!this.props.startingYearMonth.isSame(newProps.startingYearMonth)){
      // this.setState({records: []});
      if (this.yearRef) {
        this.yearRef.off('value', this.onValueChange, this);
      }

      this.loadYearData(newProps.startingYearMonth);
    }
  }

  componentWillUnmount() {
    if (this.yearRef) {
      this.yearRef.off('value', this.onValueChange, this);
    }
  }

  getViewRecords(records) {
    let months = [];
    let availabilities = [];
    if(Object.keys(records).length > 0){
      let cur_month = moment(Object.keys(records)[0], 'YYYYMMDD').startOf('month');
      Object.keys(records).forEach((key, index) => {
        const shifts = Object.keys(records[key]);
        if (!cur_month.isSame(moment(key, 'YYYYMMDD'), 'month')) {
          const chunks = _.chunk(availabilities.slice(0), 14);
          if(chunks.length > 0) {
            chunks[chunks.length - 1] = chunks[chunks.length - 1].concat(_.fill(Array(14 - chunks[chunks.length - 1].length), null));
          }
          months.push({startingMonth: cur_month, availabilities: chunks.map((chunk, index1) => { return {startingDate: cur_month.clone().add(2 * index1, 'weeks'), cells: chunk}; })});
          availabilities.splice(0, availabilities.length);
          cur_month = moment(key, 'YYYYMMDD').startOf('month');
        }
        availabilities.push(shifts.length);
      });
    }
    return months;
  }

  onSwipe(args) {
    if(args.source == 'year') {
      switch(args.direction) {
        case SWIPE_RIGHT:
          this.navigateToBack();
          break;
        case 'SWIPE_DOUBLE_RIGHT':
          this.navigateToWeekView();
          break;
        case SWIPE_DOWN:
          this.navigateToPrevYearMonth();
          break;
        case SWIPE_UP:
          this.navigateToNextYearMonth();
          break;
        default:
          break;
      }
    }
  }

  onValueChange(snap) {
    const val = snap.val();
    // console.log('year availabilities: ', val);
    this.setState({records: _.extend({}, this.boilerPlateState, val)});
    this.props.stopNavLoading();
  }

  loadYearData(date) {
    const startingDate = date.clone().subtract(2, 'month');
    const endingDate = startingDate.clone().add(5, 'month');
    let months = [];

    this.boilerPlateState = {};
    _.range(endingDate.diff(startingDate, 'days') + 1).forEach((d) => {
      this.boilerPlateState[startingDate.clone().add(d, 'day').format('YYYYMMDD')] = {};
    });

    const {GMC} = this.props.user;

    this.props.startNavLoading();

    this.yearRef = firebaseRef.child(`availability/${GMC}`)
      .orderByKey()
      .startAt(startingDate.format('YYYYMMDD'))
      .endAt(endingDate.clone().subtract(1, 'day').format('YYYYMMDD'));
    this.yearRef.on('value', this.onValueChange, (error) => {}, this);
  }

	render() {
    const viewRecords = this.getViewRecords(this.state.records);
    // console.log('view records: ', viewRecords);
    const monthRows = viewRecords.map( (month, index0) => {
      return (
        <View key={index0} style={styles.fillParent}>
          {this._renderSectionHeader(month.startingMonth)}
          <TouchableOpacity style={styles.fillParent} activeOpacity={0.5} onPress={this.navigateToMonthView.bind(this, month)}>
            {month.availabilities.map((fortnight, index1) => {
              return this._renderRow(fortnight, 0, index1);
            }, this)}
          </TouchableOpacity>
        </View>
      );
    }, this);
		return (
			<View style={ styles.container }>
        <LoadingIndicator style={styles.loadingContainer} />
        {!this.props.loading && monthRows}
      </View>
		);
	}

	_renderSectionHeader(sectionData, sectionID) {

    return (
      <View style={styles.subTitleWrapper}>
      	<Text style={styles.subTitle}>{sectionData.format('YYYY MMMM')}</Text>
      </View>
    );
  }

  _renderRow(rowData, sectionID, rowID) {
  	const startingDate = rowData.startingDate;
    return (
      <View key={rowID} style={styles.listRow}>
        {rowData.cells.map((e, i)=> (e != null ? (
            <View key={i} style={[styles.shiftCell, {backgroundColor: this.getCellBackgroundColor(e)}]}>
              <Text style={[styles.shiftCellText, {color: this.getCellTextColor(e)}]}>
                {startingDate.clone().add(i, 'days').date()}
              </Text>
            </View>)
          : <View key={i} style={styles.emptyShiftCell} />
        ))}
      </View>
    );
  }

  _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    return (
      <View key={sectionID + ':' + rowID + ':separator'} style={styles.separator} />
    )
  }

  getCellBackgroundColor(key) {
    switch(key) {
    	case 3:
    		return '#2e5a1b';
    	case 2:
    		return '#579b36';
    	case 1:
    		return '#e0efd2';
    	default:
    		return '#f3f3f5';
    }
  }

  getCellTextColor(key) {
    return (key > 1 ? 'white': 'black');
  }

  navigateToMonthView(month) {
    InteractionManager.runAfterInteractions(() => {
      this.props.setMonth(month.startingMonth);
      this.props.navigator.jumpTo(this.props.navigator.getCurrentRoutes()[1]);
      this.props.setViewName('month');
    });
  }

  navigateToBack() {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigator.jumpTo(this.props.navigator.getCurrentRoutes()[1]);
      this.props.setViewName('month');
    });
  }

  navigateToWeekView() {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigator.jumpTo(this.props.navigator.getCurrentRoutes()[0]);
      this.props.setViewName('week');
    });
  }

  navigateToPrevYearMonth() {
    InteractionManager.runAfterInteractions(() => {
      this.props.setYearMonth(this.props.startingYearMonth.clone().subtract(5, 'month'));
    });
  }

  navigateToNextYearMonth() {
    InteractionManager.runAfterInteractions(() => {
      this.props.setYearMonth(this.props.startingYearMonth.clone().add(5, 'month'));
    });
  }
}

reactMixin(YearScreen.prototype, Subscribable.Mixin);

export default connect(
    state => ({user: state.auth.user, startingYearMonth: state.calendarnav.startingYearMonth, loading: state.calendarnav.loading}),
    {setWeek, setMonth, setYearMonth, startNavLoading, stopNavLoading, setViewName}
  )(swipeable({
    horizontal:true,
    vertical: true,
    continuous: false,
    initialVelocityThreshold: 0.7
  })(YearScreen));

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  subTitleWrapper: {
    borderTopWidth: 1,
    borderColor: 'black'
  },
  subTitle: {
    fontSize: 20,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 5 : 2,
    backgroundColor: '#d8d8d8'
  },
  listRow: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: 'black'
  },
  shiftCell: {
    flex: 1,
    borderLeftWidth: 1,
    justifyContent: 'center',
  },
  shiftCellText: {
    textAlign: 'center',
  },
  emptyShiftCell: {
    flex: 1,
    backgroundColor: 'white'
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
