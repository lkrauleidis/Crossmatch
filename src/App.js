import React, { Component, AsyncStorage, View } from 'react-native';
import { Provider } from 'react-redux/native';
import configureStore from './redux/configStore';
import RootView from './RootView';
import ExNavigator from '@exponent/react-native-navigator';
var Firebase = require('firebase');

export default class App extends Component{
  /**
   * Render
   *
   * @return {jsx} Render <Provider /> component
   */
  render(){
    return (
        <Provider store={ configureStore() }>
            { () =>
                <RootView style={{ flex: 1 }} />
            }
        </Provider>
    );
  }

}
