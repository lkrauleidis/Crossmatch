import React, { Component, Text, TouchableHighlight, StyleSheet, PropTypes, InteractionManager } from 'react-native';
import { connect } from 'react-redux/native';
import Subscribable from 'Subscribable';
import reactMixin from 'react-mixin';
import Button from './native-button/Button';

class ConfirmButton extends Component {

  constructor(props){
    super(props);
    this.state = {
    };
  }

  static propTypes = {
    onPress: PropTypes.func,
    isConfirmData: PropTypes.bool,
    isSetValueSuccess: PropTypes.bool,
    loading: PropTypes.bool
  };

	_onPress(){
    this.props.onPress && this.props.onPress();
	}

	render(){
		return(
			<Button
				disabled={ !this.props.isConfirmData }
				wrapperStyle={[styles.confirmButtonWrapper, {backgroundColor: '#a2c4c9'}]}
				style={[styles.confirmButton, {color: 'black'}]}
				onPress={this._onPress.bind(this)}>
        {(() => {
          if(!this.props.loading && this.props.isSetValueSuccess && !this.props.isConfirmData) {
            return 'Saved'
          }
          else{
            return 'Confirm'
          }
        })()}
			</Button>
		);
	}
}

reactMixin(ConfirmButton.prototype, Subscribable.Mixin);
export default connect(
    state => ({
      isConfirmData: state.firebaseVal.isConfirmData,
      isSetValueSuccess: state.firebaseVal.isSetValueSuccess,
      loading: state.firebaseVal.loading
    }))(ConfirmButton);

var styles = StyleSheet.create({

	confirmButtonWrapper: {
		width: 80,
		height: 40,
		borderRadius: 5,
		backgroundColor: '#96c9c4',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 10
	},
	confirmButton: {
		color: 'white'
	}
});
