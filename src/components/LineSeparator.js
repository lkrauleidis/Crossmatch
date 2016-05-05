import React, { Component, PropTypes, View, StyleSheet } from 'react-native';

export default class LineSeparator extends Component{

  static propTypes = {
    color: PropTypes.string,
    isVertical: PropTypes.bool
  };

  render() {
    return (
        <View style={[this.props.isVertical ? styles.verticalSeparator : styles.horizontalSeparator, this.props.color ? {backgroundColor: this.props.color} : {}]} />
    )
  }
}

var styles = StyleSheet.create({
  horizontalSeparator: {
    height: 1,
    backgroundColor: 'black'
  },
  verticalSeparator: {
    width: 1,
    backgroundColor: 'black'
  }
});
