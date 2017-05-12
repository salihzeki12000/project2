'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var itineraryCtrlStub = {
  index: 'itineraryCtrl.index',
  show: 'itineraryCtrl.show',
  create: 'itineraryCtrl.create',
  update: 'itineraryCtrl.update',
  destroy: 'itineraryCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var itineraryIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './itinerary.controller': itineraryCtrlStub
});

describe('Itinerary API Router:', function() {

  it('should return an express router instance', function() {
    itineraryIndex.should.equal(routerStub);
  });

  describe('GET /api/itinerarys', function() {

    it('should route to itinerary.controller.index', function() {
      routerStub.get
        .withArgs('/', 'itineraryCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/itinerarys/:id', function() {

    it('should route to itinerary.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'itineraryCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/itinerarys', function() {

    it('should route to itinerary.controller.create', function() {
      routerStub.post
        .withArgs('/', 'itineraryCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/itinerarys/:id', function() {

    it('should route to itinerary.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'itineraryCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/itinerarys/:id', function() {

    it('should route to itinerary.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'itineraryCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/itinerarys/:id', function() {

    it('should route to itinerary.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'itineraryCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
