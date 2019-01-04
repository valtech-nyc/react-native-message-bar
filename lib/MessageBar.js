/**
 * Name: MessageBar
 * Description: A Message Bar Component displayed at the top of screen
 * https://github.com/valtech-nyc/react-native-message-bar
 */
'use strict';

import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableWithoutFeedback,
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    StatusBar,
} from 'react-native';
import colors from './colors';
import alertTypes from './alertTypes';
import positions from './positions';
import animationTransformTypes from './animationTransformTypes';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// Try to get the status bar height; if it cannot be determined (iOS bug),
// default to the height of the iOS status bar
const statusBarHeight = StatusBar.currentHeight === undefined ? 20 : StatusBar.currentHeight;

const closeIcons = {
    [colors.white]: require('../img/closeCrossWhiteBigHitbox.png'),
    [colors.black]: require('../img/closeCrossBlackBigHitbox.png'),
};

/**
 * The default stylesheets for each alert type.
 */
const defaultStylesheets = StyleSheet.create({
    warning: {
        backgroundColor: colors.peige,
        color: colors.black,
    },
    error: {
        backgroundColor: colors.rouge,
        color: colors.white,
    },
});

const defaults = {
    alertType: alertTypes.warning,
    duration: 3000,
    shouldHideAfterDelay: true,
    durationToShow: 650,
    durationToHide: 650,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    textsPaddingTop: 26,
    textsPaddingBottom: 26,
    textsPaddingLeft: 38,
    textsPaddingRight: 38,
    position: positions.top,
    animationType: animationTransformTypes.slideFromTop,
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        flexDirection: 'column',
        alignSelf: 'stretch',
        justifyContent: 'center',
        marginLeft: 10,
        position: 'relative',
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
    },
    closeIconWrapper: {
        position: 'absolute',
        zIndex: 9999,
        top: 11,
        right: 19,
        height: 24,
        width: 24,
    },
    closeIcon: {
        width: 24,
        height: 24,
    },
});

/**
 * The message bar component.
 */
class MessageBar extends Component {
    /**
     * Constructor.
     * @param {object} props - Props for the component.
     */
    constructor(props) {
        super(props);

        this.animatedValue = new Animated.Value(0);
        this.notifyAlertHiddenCallback = null;
        this.alertShown = false;
        this.timeoutHide = null;

        this.state = MessageBar.getNewState(props);
    }

    /**
     * Called after the component mounts. Sets the initial state of the message bar.
     */
    componentDidMount() {
        // Configure the offsets prior to recieving updated props or recieving the first alert
        // This ensures the offsets are set properly at the outset based on the initial position.
        // This prevents the bar from appearing  and covering half of the screen when the
        // device is started in landscape and then rotated to portrait.
        // This does not happen after the first alert appears, as getNewState() is called on each
        // alert and calls _getOffsetByPosition()
        this.setState(MessageBar._getOffsetByPosition(this.state.position));
    }

    /**
     * Sets the state of the component.
     * @param {object} state - The new state to set the component to.
     * @param {function} [callback] - An optional callback to execute after the state is set.
     */
    setNewState(state, callback = () => {}) {
        this.setState(MessageBar.getNewState(state), callback);
    }

    /**
     * Gets the new state.
     * @param {object} [params] - The params to base the new state off of.
     * @returns {object} The new state, derived by the props.
     */
    static getNewState(params = {}) {
        return {
            // Default values, will be overridden
            animationTypeTransform: animationTransformTypes.slideFromTop,

            /* Cusomisation of the alert: Title, Message, Alert alertType, Duration for Alert keep shown */
            title: params.title,
            message: params.message,
            children: params.children,
            alertType: params.alertType || defaults.alertType,
            duration: params.duration || defaults.duration,

            /* Hide shouldHideAfterDelay setter */
            get shouldHideAfterDelay() {
                if (params.shouldHideAfterDelay !== undefined) {
                    return params.shouldHideAfterDelay;
                }
                else {
                    return defaults.shouldHideAfterDelay;
                }
            },

            /* Callbacks method on Alert Tapped, on Alert Show, on Alert Hide */
            onCloseIconTapped: params.onCloseIconTapped,
            onShow: params.onShow,
            onHide: params.onHide,

            /* Duration of the animation */
            durationToShow: params.durationToShow || defaults.durationToShow,
            durationToHide: params.durationToHide || defaults.durationToHide,

            // Margin of the View, useful if you have a navigation bar
            // or if you want the alert be shown below another component
            // instead of the top of the screen
            marginTop: params.marginTop || defaults.marginTop,
            marginBottom: params.marginBottom || defaults.marginBottom,
            marginLeft: params.marginLeft || defaults.marginLeft,
            marginRight: params.marginRight || defaults.marginRight,

            // Padding of the view, useful if you want to apply
            // a padding at your alert content
            paddingTop: params.paddingTop || defaults.paddingTop,
            paddingBottom: params.paddingBottom || defaults.paddingBottom,
            paddingLeft: params.paddingLeft || defaults.paddingLeft,
            paddingRight: params.paddingRight || defaults.paddingRight,

            // Padding around the content,
            // useful if you want a tiny message bar
            textsPaddingTop: params.textsPaddingTop || defaults.textsPaddingTop,
            textsPaddingBottom: params.textsPaddingBottom || defaults.textsPaddingBottom,
            textsPaddingLeft: params.textsPaddingLeft || defaults.textsPaddingLeft,
            textsPaddingRight: params.textsPaddingRight || defaults.textsPaddingRight,

            // Number of Lines for Title and Message
            titleNumberOfLines: params.titleNumberOfLines === undefined ? 1 : params.titleNumberOfLines,
            messageNumberOfLines: params.messageNumberOfLines === undefined ? 2 : params.messageNumberOfLines,

            // Style for the text elements
            titleStyle: {
                fontWeight: 'bold',
                marginBottom: 12,
                fontSize: 12,
                fontFamily: 'Helvetica-Bold',
                letterSpacing: -0.05,
                textAlign: 'center',
                ...params.titleStyle,
            },
            messageStyle: {
                fontSize: 12,
                fontFamily: 'Helvetica-Light',
                letterSpacing: -0.05,
                textAlign: 'center',
                ...params.messageStyle,
            },

            // Position of the alert and Animation Type the alert is shown;
            // override the opposition style position regarding the state position
            // in order to have the alert stick to that position
            ...(MessageBar._getOffsetByPosition(params.position || defaults.position)),

            // Type of animation
            animationType: params.animationType || defaults.animationType,
        };
    }

    /**
     * Shows the alert.
     */
    showMessageBarAlert() {
        // If an alert is already show or doesn't have a title or a message, do nothing
        if (
            this.isMessageBarShown() ||
            this.state.title == null && this.state.message == null && this.state.children == null
        ) {
            return;
        }

        // Set the data of the alert in the state
        this.alertShown = true;

        // Display the alert by animating it from the top of the screen
        // Auto-Hide it after a delay set in the state
        Animated.timing(this.animatedValue, {
            toValue: 1,
            duration: this.state.durationToShow,
            useNativeDriver: true
        }).start(this._showMessageBarAlertComplete());
    }

    /**
     * Hides the alert after a delay, typically used for auto-hiding.
     */
    _showMessageBarAlertComplete() {
        // Execute onShow callback if any
        this._onShow();

        // If the duration is null, do not hide the message bar
        if (this.state.shouldHideAfterDelay) {
            this.timeoutHide = setTimeout(() => {
                this.hideMessageBarAlert();
            }, this.state.duration);
        }
    }

    /**
     * Returns true if the MessageBar is currently displayed, otherwise false.
     * @returns {boolean} Whether or not the message bar is shown.
     */
    isMessageBarShown() {
        return this.alertShown;
    }

    /**
     * Hides the alert, typically used when user tap the alert.
     * @param {boolean} [hideImmediately] - Whether or not to immediately hide the animation
     */
    hideMessageBarAlert(hideImmediately = false) {
        // Hide the alert after a delay set in the state only if the alert is still visible
        if (!this.alertShown) {
            return;
        }

        clearTimeout(this.timeoutHide);

        // Animate the alert to hide it to the top of the screen
        Animated.timing(this.animatedValue, {
            toValue: 0,
            duration: hideImmediately ? 0 : this.state.durationToHide,
            useNativeDriver: true,
        }).start(this._hideMessageBarAlertComplete());
    }

    /**
     * Called when the message bar is finished hiding.
     * @private
     */
    _hideMessageBarAlertComplete() {
        // The alert is not shown anymore
        this.alertShown = false;

        this._notifyAlertHidden();

        // Execute onHide callback if any
        this._onHide();
    }

    /**
     * Callback executed to tell the observer the alert is hidden.
     * @private
     */
    _notifyAlertHidden() {
        if (this.notifyAlertHiddenCallback) {
            this.notifyAlertHiddenCallback();
        }
    }

    /**
     * Callback executed when the user tap the alert.
     * @private
     */
    _alertCloseIconTapped() {
        // Hide the alert
        this.hideMessageBarAlert();

        // Execute the callback passed in parameter
        if (this.state.onCloseIconTapped) {
            this.state.onCloseIconTapped();
        }
    }

    /**
     * Callback executed when alert is shown.
     * @private
     */
    _onShow() {
        if (this.state.onShow) {
            this.state.onShow();
        }
    }

    /**
     * Callback executed when alert is hidden.
     * @private
     */
    _onHide() {
        if (this.state.onHide) {
            this.state.onHide();
        }
    }

    /**
     * Get the new state to apply for view<Position>Offset property depending on the position
     * @param {string} position - The position to offset from.
     * @returns {object} The new state to apply to get the proper offset.
     * @private
     */
    static _getOffsetByPosition(position) {
        switch (position) {
            case positions.bottom:
                return {
                    marginTop: null
                };
            case positions.top:
            default:
                return {
                    marginBottom: null
                };
        }
    }

    /**
     * Set the animation transformation depending on the chosen animationType,
     * or depending on the state's position if animationType is not overridden.
     * @private
     */
    _applyAnimationTypeTransformation() {
        const position = this.state.position;
        let animationType = this.state.animationType;

        if (animationType === undefined) {
            if (position === positions.bottom) {
                animationType = animationTransformTypes.slideFromBottom;
            } else {
                // Top by default
                animationType = animationTransformTypes.slideFromTop;
            }
        }

        let translation;
        switch (animationType) {
            case animationTransformTypes.slideFromBottom:
                translation = this.animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [windowHeight, 0]
                });
                this.animationTypeTransform = [{ translateY: translation }];
                break;
            case animationTransformTypes.slideFromLeft:
                translation = this.animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-windowWidth, 0]
                });
                this.animationTypeTransform = [{ translateX: translation }];
                break;
            case animationTransformTypes.slideFromRight:
                translation = this.animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [windowWidth, 0]
                });
                this.animationTypeTransform = [{ translateX: translation }];
                break;
            case animationTransformTypes.slideFromTop:
            default:
                translation = this.animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-windowHeight, 0]
                });
                this.animationTypeTransform = [{ translateY: translation }];
                break;
        }
    }

    /**
     * Renders the image.
     * @returns {string} The rendered image.
     * @private
     */
    _renderCloseIcon() {
        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    this._alertCloseIconTapped();
                }}
            >
                <View
                    style={styles.closeIconWrapper}
                >
                    <Image
                        source={closeIcons[defaultStylesheets[this.state.alertType].color]}
                        style={styles.closeIcon}
                    />
                </View>
            </TouchableWithoutFeedback>
        );
    }

    /**
     * Renders the title.
     * @returns {string} The rendered title.
     * @private
     */
    _renderTitle() {
        if (this.state.title != null) {
            return (
                <Text
                    numberOfLines={this.state.titleNumberOfLines}
                    style={{
                        ...this.state.titleStyle,
                        color: defaultStylesheets[this.state.alertType].color,
                    }}
                >
                    {this.state.title}
                </Text>
            );
        }
    }

    /**
     * Renders the message.
     * @returns {string} The rendered message.
     * @private
     */
    _renderMessage() {
        const controls = [];
        if (this.state.message != null) {
            controls.push(
                <Text
                    key='message'
                    numberOfLines={this.state.messageNumberOfLines}
                    style={{
                        ...this.state.messageStyle,
                        color: defaultStylesheets[this.state.alertType].color,
                    }}
                >
                    {this.state.message}
                </Text>
            );
        }
        if (this.state.children != null) {
            controls.push(
                this.state.children
            );
        }
        return controls;
    }

    /**
     * Renders the component.
     * @returns {string} The rendered component.
     */
    render() {
        // Set the animation transformation depending on the chosen animationType,
        // or depending on the state's position if animationType is not overridden
        this._applyAnimationTypeTransformation();

        const styles = StyleSheet.create({
            alertAnimation: {
                transform: this.animationTypeTransform,
                backgroundColor: defaultStylesheets[this.state.alertType].backgroundColor,
                position: 'absolute',
                top: this.state.marginTop - statusBarHeight,
                bottom: this.state.marginBottom,
                left: this.state.marginLeft,
                right: this.state.marginRight,
                paddingTop: this.state.paddingTop + statusBarHeight,
                paddingBottom: this.state.paddingBottom,
                paddingLeft: this.state.paddingLeft,
                paddingRight: this.state.paddingRight
            },
            textsView: {
                flex: 1,
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: this.state.textsPaddingTop,
                paddingBottom: this.state.textsPaddingBottom,
                paddingLeft: this.state.textsPaddingLeft,
                paddingRight: this.state.textsPaddingRight,
            },
        });

        return (
            <Animated.View
                style={styles.alertAnimation}
            >
                <View
                    style={styles.wrapper}
                >
                    {this._renderCloseIcon()}
                    <View
                        style={styles.textsView}
                    >
                        {this._renderTitle()}
                        {this._renderMessage()}
                    </View>
                </View>
            </Animated.View>
        );
    }
}

module.exports = MessageBar;
