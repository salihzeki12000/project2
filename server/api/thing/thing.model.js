'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var ThingSchema = new mongoose.Schema({
  name: {},
  info: String,
  active: Boolean
});

export default mongoose.model('Thing', ThingSchema);
