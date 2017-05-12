/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/itinerarys              ->  index
 * POST    /api/itinerarys              ->  create
 * GET     /api/itinerarys/:id          ->  show
 * PUT     /api/itinerarys/:id          ->  update
 * DELETE  /api/itinerarys/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Itinerary from './itinerary.model';

var mongoose = require('bluebird').promisifyAll(require('mongoose'))

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.assign(entity, updates);
    return updated.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Itinerarys
export function index(req, res) {
  // Itinerary.find({active:true},{name:1, created:1,days:1}).limit(10).sort({created:-1}).populate('owner','name')
  Itinerary.aggregate([{$match:{active:true}},{$project:{name:1,created:1,itilength:{$size:{$ifNull:['$days',[]]}}}},{$sort:{created:-1}},{$limit:50}])
    .execAsync()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets an itinerary by owner
export function indexOwner(req, res) {
  Itinerary.find({'owner':req.params.owner, '_id':req.params.id}).populate('owner','name').sort({ $natural: -1 }).limit(1)
    .execAsync()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of itineraries by owner
export function itinerariesOwner(req, res) {
  // Itinerary.find({'owner':req.params.owner}).sort({ created: -1 })
  // console.log('owner',req.params.owner)
  Itinerary.aggregate([{$match:{'owner':mongoose.Types.ObjectId(req.params.owner)}},{$project:{name:1,created:1,notes:1,itilength:{$size:{$ifNull:['$days',[]]}}}},{$sort:{created:-1}}])
    .execAsync()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of itineraries by place
export function itinerariesPlace(req, res) {
  // Itinerary.find({active:true, name:req.params.place},{name:1}).sort({ $natural: -1 })
  Itinerary.aggregate([{$match:{active:true,name:req.params.place}},{$project:{name:1,itilength:{$size:{$ifNull:['$days',[]]}}}},{$sort:{created:-1}}])
    .execAsync()
    .then(respondWithResult(res))
    .catch(handleError(res));
}


// Gets a single Itinerary from the DB
export function show(req, res) {
  Itinerary.find({_id:req.params.id,active:true}).populate('owner','name')
    .execAsync()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Return true if Itinerary exists from the DB
export function ownerExist(req, res) {
  // console.log('owner',req.params.owner);
  Itinerary.find({owner:req.params.owner}).limit(1)
    .execAsync()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Itinerary in the DB
export function create(req, res) {
  Itinerary.createAsync(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Itinerary in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Itinerary.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Itinerary from the DB
export function destroy(req, res) {
  Itinerary.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
