/*
 * (c) 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED All rights reserved. This
 * file or any portion thereof may not be reproduced or used in any manner
 * whatsoever without the express written permission of KAI OS TECHNOLOGIES
 * (HONG KONG) LIMITED. KaiOS is the trademark of KAI OS TECHNOLOGIES (HONG KONG)
 * LIMITED or its affiliate company and may be registered in some jurisdictions.
 * All other trademarks are the property of their respective owners.
 */

/*
 * In order to make this file works, please aslo add '/shared/resources/aml.json'
 * in html and
 * "permissions": {
 *   ...
 *   "geolocation-noprompt":{},
 *   "mobileconnection":{},
 *   "settings":{ "access": "readwrite" },
 *   "battery":{}
 * }
 * in manifest.webapp .
 *
 */

/* global LazyLoader, SettingsObserver, WebActivity */

const AML = (function aml() {
  const conns = window.navigator.b2g.mobileConnections;
  const AML_VARIANT_FILE = '%SHARED_APP_ORIGIN%/resources/aml.json';
  const AML_BATTERY_AND_TIMEOUT = 'aml.config';
  const GEOLOCATION_ENABLED = 'geolocation.enabled';
  const WIFI_ENABLED = 'wifi.enabled';
  let t1Timeout = 20;
  let gettingInformation = false;
  let batteryLevel = 0.1;
  let battery = null;
  window.navigator.getBattery().then(result => {
    battery = result;
  });
  function getMCC(serviceId) {
    const conn = conns[serviceId];
    const { network } = conn.voice;
    if (network && network.mcc) {
      return network.mcc;
    }
    return '';
  }

  function getMNC(serviceId) {
    const conn = conns[serviceId];
    const { network } = conn.voice;
    if (network && network.mnc) {
      return network.mnc;
    }
    return '';
  }

  function getAMLInfo(mcc) {
    return LazyLoader.getJSON(AML_VARIANT_FILE)
      .then(amlList => {
        let amlInfo = {};
        if (mcc && amlList[mcc]) {
          amlInfo = amlList[mcc];
        }
        return amlInfo;
      })
      .catch(error => {
        console.error(`AML: getAMLInfo ${error}`);
        return '';
      });
  }

  function setSettingValue(name, value) {
    const obj = {
      name,
      value
    };
    return SettingsObserver.setValue([obj])
      .then(() => {
        return true;
      })
      .catch(error => {
        console.error(`AML: set setting ${name} ${error}`);
        return false;
      });
  }

  function getBatteryAndTimeout() {
    return SettingsObserver.getValue(AML_BATTERY_AND_TIMEOUT)
      .then(result => {
        if (result) {
          t1Timeout = result.t1Timeout || t1Timeout;
          batteryLevel = result.batteryForFiveMinutes || batteryLevel;
        }
      })
      .catch(error => {
        console.error(`AML: getBatteryAndTimeout ${error}`);
      });
  }

  function getSMSContent(serviceId) {
    gettingInformation = true;
    const enable = isBatteryAllowed();
    /*
     * Json in contentObj
     * header:
     * lt: optional
     * lg: optional
     * top:
     * pm:
     * si:
     * ei:
     * mcc:
     * mnc:
     *
     */
    const contentObj = {};
    return enableGPSWiFiToGetPosition(enable)
      .then(pos => {
        gettingInformation = false;
        let positioningMethod = 'N';
        const conn = conns[serviceId];
        if (pos && pos.coords) {
          const crd = pos.coords;
          contentObj.lt =
            crd.latitude > 0
              ? `+${crd.latitude.toFixed(5)}`
              : crd.latitude.toFixed(5);
          contentObj.lg =
            crd.longitude > 0
              ? `+${crd.longitude.toFixed(5)}`
              : crd.longitude.toFixed(5);
          contentObj.rd = parseInt(crd.accuracy, 10);
          switch (pos.positioningMethod) {
            case 'gnss':
              positioningMethod = 'G';
              break;
            case 'wifi':
              positioningMethod = 'W';
              break;
            case 'cell':
              positioningMethod = 'C';
              break;
            case 'wifi-and-cell':
              positioningMethod = crd.accuracy < 500 ? 'W' : 'C';
              break;
            default:
              if (crd.accuracy < 30) {
                positioningMethod = 'G';
              } else if (crd.accuracy >= 300) {
                positioningMethod = 'C';
              } else {
                positioningMethod = 'W';
              }
              break;
          }
        }
        contentObj.pm = positioningMethod;
        let date = null;
        if (pos && pos.gnssUtcTime) {
          date = new Date(pos.gnssUtcTime);
        } else {
          date = new Date();
        }
        contentObj.top =
          date.getFullYear() +
          (date.getMonth() + 1).toString().padStart(2, '0') +
          date
            .getDate()
            .toString()
            .padStart(2, '0') +
          date
            .getHours()
            .toString()
            .padStart(2, '0') +
          date
            .getMinutes()
            .toString()
            .padStart(2, '0') +
          date
            .getSeconds()
            .toString()
            .padStart(2, '0');

        const iccid = conn.iccId;
        const iccObj = navigator.b2g.iccManager.getIccById(iccid);
        contentObj.si = iccObj.iccInfo.imsi;
        contentObj.header = '2';
        contentObj.mcc = getMCC(serviceId);
        contentObj.mnc = getMNC(serviceId);
        const deviceInfo = conn.getDeviceIdentities();
        contentObj.ei = deviceInfo.imei;
        return contentObj;
      })
      .catch(error => {
        console.error(`AML: enableGPSWiFiToGetPosition ${error}`);
        gettingInformation = false;
        return contentObj;
      });
  }

  function isBatteryAllowed() {
    if (battery && battery.level) {
      return battery.level > batteryLevel;
    }
    return true;
  }

  function enableGPSWiFiToGetPosition(enable) {
    return new Promise(resolve => {
      SettingsObserver.getValue(GEOLOCATION_ENABLED).then(result => {
        if (enable === result) {
          enableWifiToGetPosition(enable).then(pos => {
            resolve(pos);
          });
        } else {
          setSettingValue(GEOLOCATION_ENABLED, enable).then(success => {
            setTimeout(() => {
              enableWifiToGetPosition(enable).then(pos => {
                if (success) {
                  setSettingValue(GEOLOCATION_ENABLED, !enable);
                }
                resolve(pos);
              });
            }, 250);
          });
        }
      });
    });
  }

  function enableWifiToGetPosition(enable) {
    return new Promise(resolve => {
      SettingsObserver.getValue(WIFI_ENABLED).then(result => {
        if (enable === result) {
          getCurrentPosition().then(pos => {
            resolve(pos);
          });
        } else {
          setSettingValue(WIFI_ENABLED, enable).then(success => {
            setTimeout(() => {
              getCurrentPosition().then(pos => {
                if (success) {
                  setSettingValue(WIFI_ENABLED, !enable);
                }
                resolve(pos);
              });
            }, 250);
          });
        }
      });
    });
  }

  function getCurrentPosition() {
    return new Promise(resolve => {
      const options = {
        enableHighAccuracy: true,
        timeout: t1Timeout * 1000,
        maximumAge: 0
      };
      // Keep the Geolocation service running even when the app is invisible.
      const lock = navigator.b2g.requestWakeLock('gps');

      navigator.geolocation.getCurrentPosition(
        pos => {
          lock.unlock();
          resolve(pos);
        },
        err => {
          console.error(
            `AML, Get position failed, err.message: ${err.message}`
          );
          lock.unlock();
          resolve('');
        },
        options
      );
    });
  }

  function triggerBySMS(serviceId) {
    return LazyLoader.getJSON(AML_VARIANT_FILE)
      .then(amlList => {
        const mcc = getMCC(serviceId);
        let allowed = false;
        if (mcc && amlList[mcc]) {
          allowed = amlList[mcc].AllowTriggerBySMS112;
        }
        if (allowed) {
          sendAMLSms(serviceId, '', true);
        }
      })
      .catch(error => {
        console.error(`AML: getJSON ${error}`);
      });
  }

  function sendAMLSms(serviceId, number, isSMS) {
    if (gettingInformation) {
      console.log('AML: gettingInformation...');
      return;
    }
    if (!conns) {
      return;
    }
    const conn = conns[serviceId];
    if (!conn || !conn.iccId) {
      return;
    }
    const mcc = getMCC(serviceId);
    if (!mcc) {
      return;
    }

    getAMLInfo(mcc).then(amlInfo => {
      if (
        isSMS ||
        (amlInfo &&
          amlInfo.triggerNumbers &&
          amlInfo.triggerNumbers.indexOf(number) !== -1)
      ) {
        getBatteryAndTimeout().then(() => {
          getSMSContent(serviceId).then(contentObj => {
            const options = {};
            for (const attr in contentObj) {
              options[attr] = contentObj[attr];
            }
            for (const attr in amlInfo) {
              options[attr] = amlInfo[attr];
            }
            const activity = new WebActivity('aml-msg', {
              id: serviceId,
              data: options
            });
            activity.start();
          });
        });
      }
    });
  }

  return {
    triggerBySMS,
    sendAMLSms
  };
})();

window.AML = AML;
