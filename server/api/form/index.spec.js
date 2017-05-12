'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var formCtrlStub = {
  index: 'formCtrl.index',
  show: 'formCtrl.show',
  create: 'formCtrl.create',
  upsert: 'formCtrl.upsert',
  patch: 'formCtrl.patch',
  destroy: 'formCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var formIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './form.controller': formCtrlStub
});

describe('Form API Router:', function() {
  it('should return an express router instance', function() {
    formIndex.should.equal(routerStub);
  });

  describe('GET /y', function() {
    it('should route to form.controller.index', function() {
      routerStub.get
        .withArgs('/', 'formCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /y/:id', function() {
    it('should route to form.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'formCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /y', function() {
    it('should route to form.controller.create', function() {
      routerStub.post
        .withArgs('/', 'formCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /y/:id', function() {
    it('should route to form.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'formCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /y/:id', function() {
    it('should route to form.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'formCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /y/:id', function() {
    it('should route to form.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'formCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
