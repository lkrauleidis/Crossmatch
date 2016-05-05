import React, { Component, AsyncStorage, View, PropTypes, StyleSheet} from 'react-native';
import { connect } from 'react-redux/native';
import _ from 'lodash';
import Subscribable from 'Subscribable';
import reactMixin from 'react-mixin';

import configureStore from './redux/configStore';
import Routes from './routes';
import BookingScreen from './containers/BookingScreen/';
import ExNavigator from '@exponent/react-native-navigator';
import {firebaseRef} from './config';
import {setLocalUnconfirmedBookingData} from './redux/actions/FirebaseValueActions';

export default class RootView extends Component{

  constructor(props){
    super(props);
    this.state = {
      user:null,
      isUnconfirmedBookingData: false
    };
  }

  static propTypes = {
    user: PropTypes.object,
    setLocalUnconfirmedBookingData: PropTypes.func
  };

  componentWillReceiveProps(newProps){
    if(this.props.user && this.state.user != this.props.user){
      this.setState({user: newProps.user});
      this.bookingRef = firebaseRef.child(`unconfirmed_bookings/${this.props.user.GMC}`);
      // this.bookingRef.on('value', this.onBookingChange, (error) => {}, this);
    }
  }

  onBookingChange(snap){
    if(snap.val()){
      this.setState({isUnconfirmedBookingData: true});
      this.props.setLocalUnconfirmedBookingData(snap.val());
    }
    else{
      this.setState({isUnconfirmedBookingData: false});
      this.props.setLocalUnconfirmedBookingData(null);
    }
  }
  /**
   * Render
   *
   * @return {jsx} Render <Provider /> component
   */
  render(){
    return (
      <View style={{ flex: 1 }}>
        <ExNavigator
          initialRoute={ Routes.getLoginRoute() }
          showNavigationBar={false}
          style={styles.ChildScreen}  />
        {this.state.isUnconfirmedBookingData && <BookingScreen style={styles.ChildScreen} /> }
      </View>
    );
  }
}

reactMixin(RootView.prototype, Subscribable.Mixin);

export default connect(
    state => ({user: state.auth.user}),
    {setLocalUnconfirmedBookingData}
  )(RootView);

const styles = StyleSheet.create({
  ChildScreen:{
    flex: 1,
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  }
});
