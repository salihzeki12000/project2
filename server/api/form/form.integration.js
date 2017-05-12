'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newForm;

describe('Form API:', function() {
  describe('GET /y', function() {
    var forms;

    beforeEach(function(done) {
      request(app)
        .get('/y')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          forms = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      forms.should.be.instanceOf(Array);
    });
  });

  describe('POST /y', function() {
    beforeEach(function(done) {
      request(app)
        .post('/y')
        .send({
          name: 'New Form',
          info: 'This is the brand new form!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newForm = res.body;
          done();
        });
    });

    it('should respond with the newly created form', function() {
      newForm.name.should.equal('New Form');
      newForm.info.should.equal('This is the brand new form!!!');
    });
  });

  describe('GET /y/:id', function() {
    var form;

    beforeEach(function(done) {
      request(app)
        .get(`/y/${newForm._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          form = res.body;
          done();
        });
    });

    afterEach(function() {
      form = {};
    });

    it('should respond with the requested form', function() {
      form.name.should.equal('New Form');
      form.info.should.equal('This is the brand new form!!!');
    });
  });

  describe('PUT /y/:id', function() {
    var updatedForm;

    beforeEach(function(done) {
      request(app)
        .put(`/y/${newForm._id}`)
        .send({
          name: 'Updated Form',
          info: 'This is the updated form!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedForm = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedForm = {};
    });

    it('should respond with the updated form', function() {
      updatedForm.name.should.equal('Updated Form');
      updatedForm.info.should.equal('This is the updated form!!!');
    });

    it('should respond with the updated form on a subsequent GET', function(done) {
      request(app)
        .get(`/y/${newForm._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let form = res.body;

          form.name.should.equal('Updated Form');
          form.info.should.equal('This is the updated form!!!');

          done();
        });
    });
  });

  describe('PATCH /y/:id', function() {
    var patchedForm;

    beforeEach(function(done) {
      request(app)
        .patch(`/y/${newForm._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Form' },
          { op: 'replace', path: '/info', value: 'This is the patched form!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedForm = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedForm = {};
    });

    it('should respond with the patched form', function() {
      patchedForm.name.should.equal('Patched Form');
      patchedForm.info.should.equal('This is the patched form!!!');
    });
  });

  describe('DELETE /y/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/y/${newForm._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when form does not exist', function(done) {
      request(app)
        .delete(`/y/${newForm._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
