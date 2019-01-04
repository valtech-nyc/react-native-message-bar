/**
 * Name: Message Bar Manager
 * Description: A manager to show/hide and handle a queue of alerts
 * https://github.com/valtech-nyc/react-native-message-bar
 */
'use strict';

module.exports = {
    _currentMessageBarAlert: null,
    _messageAlerts: [],

    /**
     * Registers the message bar with the app.
     * @param {MessageBar} messageBar - The message bar to register.
     */
    registerMessageBar(messageBar) {
        this._currentMessageBarAlert = messageBar;
    },

    /**
     * Unregisters the current message bar from the app.
     */
    unregisterMessageBar() {
        this._currentMessageBarAlert = null;
    },

    /**
     * Shows the message bar.
     * @param {{ title: string, message: string, alertType: string, duration: number, shouldHideAfterDelay: bool, onCloseIconTapped: function, onShow: function, onHide: function, durationToShow: number, durationToHide: number, marginTop: number, marginBottom: number, marginLeft: number, marginRight: number, paddingTop: number, paddingBottom: number, paddingLeft: number, paddingRight: number, textsPaddingTop: number, textsPaddingBottom: number, textsPaddingLeft: number, textsPaddingRight: number, titleNumberOfLines: number, messageNumberOfLines: number, titleStyle: style, messageStyle: style, position: string, animationType: string, children: object }} newState - The new state to set the message bar to.
     */
    showAlert(newState = null) {
        if (this._currentMessageBarAlert === null) {
            return;
        }

        // Hide the current alert
        this.hideAlert(true);

        // Get the current alert's duration to hide
        const durationToHide = this._currentMessageBarAlert.alertShown ? this._currentMessageBarAlert.state.durationToHide : 0;

        setTimeout(() => {
            // Show the new alert if there is a new state, otherwise
            if (newState != null) {
                // Clear current state
                this._currentMessageBarAlert.setNewState({
                    durationToHide: 1,
                    durationToShow: 1,
                }, () => {
                    this._currentMessageBarAlert.setNewState(newState, () => {
                        this._currentMessageBarAlert.notifyAlertHiddenCallback = null;
                        this._currentMessageBarAlert.showMessageBarAlert();
                    });
                });
            }
        }, durationToHide);
    },

    /**
     * Hides the message bar.
     * @param {boolean} [hideImmediately] - Whether or not to immediately hide the animation
     */
    hideAlert(hideImmediately = false) {
        if (this._currentMessageBarAlert !== null) {
            this._currentMessageBarAlert.hideMessageBarAlert(hideImmediately);
        }
    }
};
