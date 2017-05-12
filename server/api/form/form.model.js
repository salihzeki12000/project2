'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './form.events';

var FormSchema = new mongoose.Schema({
  user: {},
  traveltype: [String],
  travelers: String,
  startdate: String,
  enddate: String,
  destination: String,
  created : { type : Date, default : Date.now },
  itiid: String,
  errormsg: String
});

registerEvents(FormSchema);
export default mongoose.model('Form', FormSchema);
