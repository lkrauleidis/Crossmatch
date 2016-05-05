import React, { Component, PropTypes, TouchableOpacity } from 'react-native';
import SideMenu from 'react-native-side-menu';

class MenuButton extends Component {
  handlePress(e) {
    this.context.menuActions.toggle();
    if (this.props.onPress) {
      this.props.onPress(e);
    }
  }

  render() {
    return (
      <TouchableOpacity
        touchRetentionOffset={this.props.touchRetentionOffset}
        onPress={this.handlePress.bind(this)}
        style={this.props.style} >
        {this.props.children}
      </TouchableOpacity>
    );
  }
}

MenuButton.contextTypes = {
  menuActions: PropTypes.object.isRequired
};

export default MenuButton;
