import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import app from '../../src/app';

chai.use(chaiHttp);
const expect = chai.expect;

describe('GET api/v1/medicos', () => {

  it('responds with JSON array', () => {
    return chai.request(app).get('/api/v1/medicos')
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array');
        //expect(res.body).to.have.length(5);
      });
  });

  it('should have a nombre and matricula', () => {
    return chai.request(app).get('/api/v1/medicos')
      .then(res => {
        let unMedico = res.body[0];
        expect(unMedico).to.exist;
        expect(unMedico).to.have.all.keys([
          '_id',
          'nombre',
          'matricula'          
        ]);
      });
  });

});