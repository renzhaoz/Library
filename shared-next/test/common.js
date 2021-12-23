require('jest');

function insertDomToBody(doc, dom) {
  doc.getElementsByTagName('body')[0].appendChild(dom);
}

function dispatchEvent(eventName, eventData) {
  const event = new CustomEvent(eventName, eventData);
  window.dispatchEvent(event);
}

exports.insertDomToBody = insertDomToBody;
exports.dispatchEvent = dispatchEvent;
