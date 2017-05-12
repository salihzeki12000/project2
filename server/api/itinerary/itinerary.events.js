/**
 * Itinerary model events
 */

'use strict';

import {EventEmitter} from 'events';
var Itinerary = require('./itinerary.model');
var ItineraryEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ItineraryEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Itinerary.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    ItineraryEvents.emit(event + ':' + doc._id, doc);
    ItineraryEvents.emit(event, doc);
  }
}

export default ItineraryEvents;
