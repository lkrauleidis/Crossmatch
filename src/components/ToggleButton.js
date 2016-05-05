import React, { Component, Text, TouchableHighlight, StyleSheet, InteractionManager } from 'react-native';

export default class ToggleButton extends Component {
    constructor(props){
        super(props);
        this.state = {
            active: this.props.isActive
        }
    }

    static propTypes = {
        activeColor: React.PropTypes.string.isRequired,
        isActive: React.PropTypes.bool,
    };

    static defaultProps = {
        color: '#f3f3f3',
        textColor: '#7d6b5d',
        isActive: false
    };

    componentWillReceiveProps (newProps) {
        if(this.props.isActive !== newProps.isActive) {
            this.setState({active: newProps.isActive});
        }
    }
    _onPress () {

        if(this.props.onPress) {
          this.setState({active: !this.state.active});
          InteractionManager.runAfterInteractions(() => {
            this.props.onPress();
          });
        }
    }

    render() {
        return (
            <TouchableHighlight
              onPress={this._onPress.bind(this)}
              style={[this.props.style, toggleButtonStyles.button, {backgroundColor: this.state.active ? this.props.activeColor: this.props.color}]}
              underlayColor={this.state.active ? this.props.activeColor: this.props.color}>
                <Text style={[toggleButtonStyles.text, {color: this.props.textColor}]}>{this.props.children}</Text>
            </TouchableHighlight>
        );
    }
}

const toggleButtonStyles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        flex: 1
    },
    text: {
        textAlign: 'center',
        fontSize: 17,
        fontWeight: 'bold'
    }
});
