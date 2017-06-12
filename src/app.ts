


import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as moment from 'moment';
import { join } from 'path';

//Database related stuff
//import * as database from  "./database/database";
//Routers
import MedicosRouter from "./routes/medicos.route";
import EspecialidadRouter from "./routes/especialidad.route";
import ObraSocialRouter from './routes/obrasocial.route';
import PacienteRouter from './routes/paciente.route';
import AgendasRouter from './routes/agenda.route';
import AuthRouter from './routes/auth.route';
import CentroMedicoRouter from './routes/centro-medico.route';
import TurnoRouter from './routes/turno.route';
import * as admin from "firebase-admin";
const fileUpload = require('express-fileupload');

class App {

    public express: express.Application;

    constructor() {
        //set moment locale
        moment.locale('es');
        //wire up the app
        this.express = express();
        this.middleware();
        this.routes();
        this.serveFrontend();
        this.setErrorHandler();
    }


    private middleware(): void {
        this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
        this.express.use(fileUpload({
            limits: { fileSize: 50 * 1024 * 1024 },
        }))
        this.express.use(cors());
        this.express.use(express.static(path.join(__dirname, 'wwwroot')));
        this.express.use(express.static(join(__dirname, 'public')));
    }

    private routes(): void {
        let router = express.Router();
        this.express.use('/api/v1/medicos', MedicosRouter);
        this.express.use('/api/v1/especialidades', EspecialidadRouter);
        this.express.use('/api/v1/obras/sociales', ObraSocialRouter);
        this.express.use('/api/v1/pacientes', PacienteRouter);
        this.express.use('/api/v1/agendas', AgendasRouter);
        this.express.use('/api/v1/auth', AuthRouter);
        this.express.use('/api/v1/centros', CentroMedicoRouter);
        this.express.use('/api/v1/turnos',TurnoRouter);
    }

    private serveFrontend(): void {
        //wildcard for frontend serving
        this.express.all('*', (req, res, next) => {
            console.log("Entered to wildcard");
            var index_file = __dirname + '/wwwroot/index.html';
            res.status(200).sendFile(index_file);
        });
    }

    private setErrorHandler(): void {
        this.express.use((err, req, res, next) => {
            console.log(err);
            res.status(500);
            res.send({
                message: 'Something failed!',
                error: err
            });
        })


    }




}

export default new App().express;