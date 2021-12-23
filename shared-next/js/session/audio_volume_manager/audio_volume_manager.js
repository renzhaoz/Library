/* exported AudioVolumeManager */
/* global taskScheduler, lib_audiovolume */

const AudioVolumeManager = {
  _observersArray: [],
  connected: false,
  initFlag: false,
  AudioVolumeState: {},

  init() {
    if (!this.initFlag) {
      this.initFlag = true;
      window.addEventListener('session-disconnected', () => {
        this.connected = false;
      });
      window.addEventListener('services-load-complete', () => {
        if (!this.connected) {
          this.connected = true;
          if (typeof lib_audiovolume !== 'undefined') {
            this.AudioVolumeState = lib_audiovolume.AudioVolumeState;
          }
          this.processPendingRequest();
        }
      });
    }
  },

  requestVolumeDown() {
    return taskScheduler.request({
      serverName: taskScheduler.AUDIO_VOLUME,
      funcName: 'requestVolumeDown'
    });
  },

  requestVolumeShow() {
    return taskScheduler.request({
      serverName: taskScheduler.AUDIO_VOLUME,
      funcName: 'requestVolumeShow'
    });
  },

  requestVolumeUp() {
    return taskScheduler.request({
      serverName: taskScheduler.AUDIO_VOLUME,
      funcName: 'requestVolumeUp'
    });
  },

  observeAudioVolumeChanged(callback) {
    if (this.connected) {
      window.api.audiovolumemanager.addEventListener(
        window.api.audiovolumemanager.AUDIO_VOLUME_CHANGED_EVENT,
        callback
      );
    }
    this._observersArray.push(callback);
  },

  unobserveAudioVolumeChanged(callback) {
    if (this.connected) {
      window.api.audiovolumemanager.removeEventListener(
        window.api.audiovolumemanager.AUDIO_VOLUME_CHANGED_EVENT,
        callback
      );
      let removeFlag = false;
      this._observersArray.forEach((cb, index) => {
        if (!removeFlag && cb === callback) {
          this._observersArray.splice(index, 1);
          removeFlag = true;
        }
      });
    }
  },

  processPendingRequest() {
    this._observersArray.forEach(callback => {
      if (this.connected) {
        window.api.audiovolumemanager.addEventListener(
          window.api.audiovolumemanager.AUDIO_VOLUME_CHANGED_EVENT,
          callback
        );
      }
    });
  }
};
AudioVolumeManager.init();
window.AudioVolumeManager = AudioVolumeManager;
