import React, { Component, Text, View, ScrollView, TouchableOpacity, TouchableHighlight, Platform, StyleSheet, AsyncStorage } from 'react-native';
import ExNavigator from '@exponent/react-native-navigator';
import EventEmitter from 'EventEmitter';
import SideMenu from 'react-native-side-menu';
import moment from 'moment';
import {Icon} from 'react-native-icons';

import LoginScreen from './containers/Login/';
import SignupScreen from './containers/Signup/';
import ResetPasswordScreen from './containers/ResetPassword/';
import UpdatePasswordScreen from './containers/UpdatePassword/';
import ConfirmLocumAgenciesScreen from './containers/ConfirmLocumAgencies/';
import SettingsScreen from './containers/Settings/';
import YearScreen from './containers/Year/';
import MonthScreen from './containers/Month/';
import WeekScreen from './containers/Week/';

import IconButton from './components/IconButton';
import MenuButton from './components/MenuButton';
import TopBar from './components/TopBar';
import { swipeable } from './components/GestureRecognizer';
import {EVENT_LOGOUT, EVENT_SWIPE, EVENT_CONFIRM} from './constants';

const { directions: { SWIPE_UP, SWIPE_LEFT, SWIPE_DOWN, SWIPE_RIGHT } } = swipeable;

const dimensions = require('Dimensions').get('window');

let emitter = new EventEmitter();

const routes = {

  getLoginRoute: () => ({
		renderScene(navigator) {
			return (
        <LoginScreen
          navigator={navigator}
          routeEvents={emitter} />
      );
		},
		getTitle() {
			return '';
		}
	}),

	getSignupRoute: () => ({
		renderScene(navigator) {
			return (
        <SignupScreen
          navigator={navigator} />
      );
		}
	}),

	getResetPasswordRoute: () => ({
		renderScene(navigator) {
			return (
        <ResetPasswordScreen
          navigator={navigator} />
      );
		}
	}),

  getUpdatePasswordRoute: () => ({
		renderScene(navigator) {
			return (
        <UpdatePasswordScreen
          navigator={navigator} />
      );
		}
	}),

	getConfirmLocumAgenciesRoute: () => ({
		renderScene(navigator) {
			return (
        <ConfirmLocumAgenciesScreen
          navigator={navigator} />
      );
		}
	}),

	getSettingsRoute: () => ({
		renderScene(navigator) {
			return (
        <SettingsScreen
          navigator={navigator} />
      );
		}
	}),

	getHomeNavigatorRoute: () => ({
		renderScene(navigator) {
			const date = new Date();
			const menu = (
				<ScrollView style={styles.menu}>
	        <View style={styles.separator} />
	        <MenuButton onPress={() => navigator.push(routes.getSettingsRoute())}>
	          <View style={styles.itemPadding}>
	          	<Text style={styles.item}>{'Settings'}</Text>
	          </View>
	        </MenuButton>
	        <View style={styles.separator} />
	        <TouchableOpacity onPress={() => emitter.emit(EVENT_LOGOUT, {})}>
	        	<View style={styles.itemPadding}>
	          	<Text style={styles.item}>{'Logout'}</Text>
	          </View>
	        </TouchableOpacity>
	        <View style={styles.separator} />
	      </ScrollView>
      );

      const routeStack = [routes.getScreenRoute('week'), routes.getScreenRoute('month'), routes.getScreenRoute('year')];

	    return (
      	<SideMenu menu={menu} touchToClose={true} openMenuOffset={200}>
          <ExNavigator
            navigator={navigator}
            showNavigationBar={false}
            initialRoute={routeStack[0]}
            initialRouteStack={routeStack}
            sceneStyle={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 24 : 0 }} />
          <TopBar emitter = {emitter} />
	      </SideMenu>
      );
    },

    configureScene() {
	    return ExNavigator.SceneConfigs.FloatFromRight;
	  },

    getTitle() {
			return `${year} - ${month}`;
		},

		renderLeftButton(navigator) {
			return null;
		},

		renderTitle(navigator) {
      return (
      	<View style={{height: 0}} />
      );
    }
	}),

	getScreenRoute: (viewName) => ({

		routeNames: ['week', 'month', 'year'],

		renderScene(navigator) {
			let TargetScreen = null;
			switch(viewName){
				case 'year':
					TargetScreen = YearScreen;
					break;
				case 'month':
					TargetScreen = MonthScreen;
					break;
				case 'week':
					TargetScreen = WeekScreen;
					break;
			}
			const swipeDecoratorStyle = {
				flex: 1,
				width: dimensions.width
			}

			return (
				<View style={{flex: 1, marginTop: 64}}>
					<TargetScreen navigator={navigator} routeEvents={emitter} onSwipeEnd={this.onSwipeEnd} swipeDecoratorStyle={swipeDecoratorStyle} />
				</View>
			);
		},

    configureScene() {
	    return ExNavigator.SceneConfigs.FloatFromRight;
	  },

    onSwipeEnd({ direction, distance, velocity }) {
	    // x and y values are hardcoded for an iphone6 screen			
			emitter.emit(EVENT_SWIPE, {source: viewName, direction: direction});
	  }
	})
};

var styles = StyleSheet.create({
	menu: {
    flex: 1,
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: '#c0c0c0',
    padding: 10,
    marginTop: Platform.OS === 'ios' ? 20 : 0
  },
  itemPadding: {
  	padding: 15
  },
  item: {
    fontSize: 20,
    fontWeight: '300'
  },
  separator: {
    height: 1,
    backgroundColor: 'black',
  }
});

export default routes;
