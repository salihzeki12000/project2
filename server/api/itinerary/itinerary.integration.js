'use strict';

var app = require('../..');
import request from 'supertest';

var newItinerary;

describe('Itinerary API:', function() {

  describe('GET /api/itinerarys', function() {
    var itinerarys;

    beforeEach(function(done) {
      request(app)
        .get('/api/itinerarys')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          itinerarys = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      itinerarys.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/itinerarys', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/itinerarys')
        .send({
          name: 'New Itinerary',
          info: 'This is the brand new itinerary!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newItinerary = res.body;
          done();
        });
    });

    it('should respond with the newly created itinerary', function() {
      newItinerary.name.should.equal('New Itinerary');
      newItinerary.info.should.equal('This is the brand new itinerary!!!');
    });

  });

  describe('GET /api/itinerarys/:id', function() {
    var itinerary;

    beforeEach(function(done) {
      request(app)
        .get('/api/itinerarys/' + newItinerary._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          itinerary = res.body;
          done();
        });
    });

    afterEach(function() {
      itinerary = {};
    });

    it('should respond with the requested itinerary', function() {
      itinerary.name.should.equal('New Itinerary');
      itinerary.info.should.equal('This is the brand new itinerary!!!');
    });

  });

  describe('PUT /api/itinerarys/:id', function() {
    var updatedItinerary;

    beforeEach(function(done) {
      request(app)
        .put('/api/itinerarys/' + newItinerary._id)
        .send({
          name: 'Updated Itinerary',
          info: 'This is the updated itinerary!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedItinerary = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedItinerary = {};
    });

    it('should respond with the updated itinerary', function() {
      updatedItinerary.name.should.equal('Updated Itinerary');
      updatedItinerary.info.should.equal('This is the updated itinerary!!!');
    });

  });

  describe('DELETE /api/itinerarys/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/itinerarys/' + newItinerary._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when itinerary does not exist', function(done) {
      request(app)
        .delete('/api/itinerarys/' + newItinerary._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
