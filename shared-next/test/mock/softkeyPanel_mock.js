 require('./softkey_register_mock.js')

const MockSoftkeyPanel = jest.fn();
const FORM_ID = 'softkeyPanel';
MockSoftkeyPanel.prototype.show = jest.fn();
MockSoftkeyPanel.prototype.hide = jest.fn();
MockSoftkeyPanel.prototype.initSoftKeyPanel = jest.fn();
MockSoftkeyPanel.prototype.stopListener = jest.fn();
MockSoftkeyPanel.prototype.startListener = jest.fn();
MockSoftkeyPanel.prototype.getLeftKey = jest.fn();

exports.MockSoftkeyPanel = MockSoftkeyPanel;
exports.FORM_ID = FORM_ID;

