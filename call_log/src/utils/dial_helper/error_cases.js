const ERROR_CASES = {
  InvalidNumber: {
    header: 'invalidNumberToDialTitle',
    content: 'invalidNumberToDialMessage',
    translated: false
  },
  NumberBlocked: {
    content: 'numberBlockedMessage',
    translated: false
  },
  NoNetwork: {
    header: 'emergencyDialogTitle',
    content: 'emergencyDialogBodyBadNumber',
    translated: false
  },
  RadioNotAvailable: {
    header: 'callAirplaneModeTitle',
    content: 'callAirplaneModeMessage',
    translated: false
  },
  DeviceNotAccepted: {
    header: 'emergencyDialogTitle',
    content: 'emergencyDialogBodyDeviceNotAccepted',
    translated: false
  },
  Busy: {
    header: 'numberIsBusyTitle',
    content: 'numberIsBusyMessage',
    translated: false
  },
  FDNBlocked: {
    header: 'fdnIsActiveTitle',
    content: 'fdnIsActiveMessage',
    containNumber: true,
    translated: false
  },
  FdnCheckFailure: {
    header: 'fdnIsActiveTitle',
    content: 'fdnIsActiveMessage',
    containNumber: true,
    translated: false
  },
  OtherConnectionInUse: {
    header: 'otherConnectionInUseTitle',
    content: 'otherConnectionInUseMessage',
    translated: false
  },
  EmergencyCallOnly: {
    header: 'emergency-call-only',
    content: 'emergency-call-error',
    containNumber: true,
    translated: false
  },
  Default: {
    content: 'CallFailed',
    translated: false
  }
};

export default ERROR_CASES;
