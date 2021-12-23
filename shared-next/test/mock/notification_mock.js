let Notifications = [];

/**
 * This mock partly implements a Web Notification contructor, see
 * https://developer.mozilla.org/en-US/docs/Web/API/notification
 */
function Notification(title, options) {
  this.id = options.id || 0;
  this.title = title;
  this.icon = options.icon || undefined;
  this.body = options.body || undefined;
  this.tag = options.tag || undefined;
  this.mEvents = {};

  Notifications.push(this);
}

Notification.prototype.close = function close() {
  // Nothing to do
};

Notification.prototype.onshow = function onshow() {
  // Nothing to do
};

Notification.prototype.addEventListener = function addEventListener(
  evt,
  callback
) {
  this.mEvents[evt] = callback;
  callback();
};

Notification.prototype.removeEventListener = function removeEventListener(
  evt
) {
  delete this.mEvents[evt];
};

Notification.get = function get() {
  return {
    // eslint-disable-next-line no-empty-function
    then() {}
  };
};

Notification.mTeardown = function mTeardown() {
  Notifications = [];
};

Notification.requestPermission = function requestPermission() {};

window.Notification = Notification;
