import React, { Component, TouchableOpacity, Platform} from 'react-native';
import {Icon} from 'react-native-icons';

export default class IconButton extends Component{

  statics: {
    title: 'Icon button',
    description: ''
  };

  componentWillMount() {
  }

  render() {
    return (
        <TouchableOpacity onPress={this.props.onPress}
          style={{width: this.props.size, height: this.props.size}}>
          <Icon
            name={this.props.icon}
            style={{width: this.props.size, height: this.props.size}}
            color={this.props.color}
            size={this.props.size}
            {...this.props} />
        </TouchableOpacity>
    )
  }
}
