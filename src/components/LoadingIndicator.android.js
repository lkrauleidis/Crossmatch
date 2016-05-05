import React, { Component, PropTypes, View, StyleSheet } from 'react-native';

import ProgressBar from 'ProgressBarAndroid';

export default class LoadingIndicator extends Component {
  constructor(props){
    super(props);
  }

  static propTypes = {
    isSmall: PropTypes.bool,
    color: PropTypes.string,
    style: PropTypes.any
  };

  static defaultProps = {
  	isSmall: false
  };

  render() {
  	const colorProps = this.props.color ? {color: this.props.color} : {};
  	return (
  		<View style={[this.props.style, styles.container]}>
  			<ProgressBar styleAttr={this.props.isSmall ? 'Small' : 'Inverse'} {...colorProps} />
  		</View>
  	);
  }
};

var styles = StyleSheet.create({
  container: {
    justifyContent: 'center'
  }
});
