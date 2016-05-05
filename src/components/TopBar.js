import React, { Component, View, Text, TouchableHighlight, StyleSheet, PropTypes, Platform, InteractionManager } from 'react-native';
import ExNavigator from '@exponent/react-native-navigator';
import { connect } from 'react-redux/native';
import Subscribable from 'Subscribable';
import reactMixin from 'react-mixin';

import {Icon} from 'react-native-icons';

import ConfirmButton from './ConfirmButton'
import MenuButton from './MenuButton';
import { swipeable } from './GestureRecognizer';

import {EVENT_SWIPE, EVENT_CONFIRM} from '../constants';

export default class TopBar extends Component {

  constructor(props){
    super(props);
    this.state = {
    };
  }

  static propTypes = {
    emitter: PropTypes.object,
    viewName: PropTypes.string
  };

	_onWeekPress(){
    InteractionManager.runAfterInteractions(() => {
      if (this.props.viewName !== 'week' ){
        this.props.emitter.emit(EVENT_SWIPE, {source: this.props.viewName, direction: this.props.viewName == 'month' ? 'SWIPE_RIGHT': 'SWIPE_DOUBLE_RIGHT'});
      }
    });
	}

  _onYearPress(){
    InteractionManager.runAfterInteractions(() => {
      if (this.props.viewName !== 'year') {
        // this.jumpToView(navigator, 'year');
        this.props.emitter.emit(EVENT_SWIPE, {source: this.props.viewName, direction: this.props.viewName == 'week' ? 'SWIPE_DOUBLE_LEFT' : 'SWIPE_LEFT'});
      }
    });
	}

  _onMonthPress(){
    InteractionManager.runAfterInteractions(() => {
      if (this.props.viewName !== 'month' ){
        this.props.emitter.emit(EVENT_SWIPE, {source: this.props.viewName, direction: this.props.viewName == 'week' ? 'SWIPE_LEFT' : 'SWIPE_RIGHT'});
      }
    });
	}

  _onConfirmPress(){
    InteractionManager.runAfterInteractions(() => {
      this.props.emitter.emit(EVENT_CONFIRM);
    });
	}

	render(){
		return(
      <View style={{position: 'absolute', top: Platform.OS === 'ios' ? 24 : 0, left: 0, right: 0, height: 64, alignItems: 'center',
                    flexDirection: 'row', backgroundColor: '#2c3e50', paddingHorizontal: 10 }}>
        <MenuButton
          pressRetentionOffset={ExNavigator.Styles.barButtonPressRetentionOffset}>
          <Icon
            name='fontawesome|bars'
            size={25}
            color={'#96c9c4'}
            style={{width: 25, height: 25}} />
        </MenuButton>
        <View style={{flexDirection: 'row', flex: 1, justifyContent: 'flex-end'}}>
          {
            this.props.viewName == 'week' &&
            <ConfirmButton onPress={this._onConfirmPress.bind(this)} />
          }
          <TouchableHighlight
            pressRetentionOffset={ExNavigator.Styles.barButtonPressRetentionOffset}
            onPress={this._onWeekPress.bind(this)}
            underlayColor={'#3087ce'}
            style={[styles.rightNavbarButton, this.props.viewName == 'week' ? {backgroundColor: '#3087ce'} : {}]}>
            <Text style={styles.barButtonLabel}>W</Text>
          </TouchableHighlight>
          <View style={styles.navButtonSeparator} />
          <TouchableHighlight
            pressRetentionOffset={ExNavigator.Styles.barButtonPressRetentionOffset}
            onPress={this._onMonthPress.bind(this)}
            underlayColor={'#3087ce'}
            activeOpacity={0.2}
            style={[styles.rightNavbarButton, this.props.viewName == 'month' ? {backgroundColor: '#3087ce'} : {}]}>
            <Text style={styles.barButtonLabel}>M</Text>
          </TouchableHighlight>
          <View style={styles.navButtonSeparator} />
          <TouchableHighlight
            pressRetentionOffset={ExNavigator.Styles.barButtonPressRetentionOffset}
            onPress={this._onYearPress.bind(this)}
            underlayColor={'#3087ce'}
            activeOpacity={0.2}
            style={[styles.rightNavbarButton, this.props.viewName == 'year' ? {backgroundColor: '#3087ce'} : {}]}>
            <Text style={styles.barButtonLabel}>Y</Text>
          </TouchableHighlight>
        </View>
      </View>
		);
	}
}

reactMixin(TopBar.prototype, Subscribable.Mixin);

export default connect(
    state => ({viewName: state.generalVal.viewName}))(TopBar);

var styles = StyleSheet.create({
  rightNavbarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#96c9c4',
    justifyContent: 'center',
    alignItems: 'center'
  },
  barButtonLabel: {
    color: '#000720',
    fontSize: 17,
    fontWeight: 'bold'
  },
  navButtonSeparator: {
    height: 3,
    width: 10,
    backgroundColor: '#96c9c4',
    alignSelf: 'center'
  }
});
