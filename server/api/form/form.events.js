/**
 * Form model events
 */

'use strict';

import {EventEmitter} from 'events';
var FormEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
FormEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Form) {
  for(var e in events) {
    let event = events[e];
    Form.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    FormEvents.emit(event + ':' + doc._id, doc);
    FormEvents.emit(event, doc);
  };
}

export {registerEvents};
export default FormEvents;
