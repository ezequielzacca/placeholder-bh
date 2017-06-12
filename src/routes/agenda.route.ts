import { ROL_ADMIN } from './../interfaces/auth.interfaces';
import { SecurityMiddleware as sec } from './../middleware/security.middleware';
import { IHasDatabaseRequest } from './../interfaces/database.interfaces';
import { AgendaService } from './../services/agenda.service';
import { ITurno } from './../interfaces/turno.interfaces';
import { Turno, TurnoModel } from './../models/turno.model';
import { IMedico } from './../interfaces/medico.interfaces';
import { Feriado, FeriadoModel } from './../models/feriado.model';
import { Agenda, AgendaModel } from './../models/agenda.model';
import { NO_LABORABLES_WS } from './../constants/ext-urls.constants';
import { AGENDAS_COLLECTION, FERIADOS_COLLECTION } from './../constants/collections.constants';
import { IWSFeriado } from './../interfaces/feriado.interfaces';
import { IAgenda, IExcluir } from './../interfaces/agenda.interfaces';
import { Router, Request, Response, NextFunction } from 'express';
import { ObjectID } from 'mongodb';
import * as _ from 'underscore';
import * as request from 'request';
import * as moment from 'moment';
import { DateRange } from 'moment-range';
import * as async from 'async';
import { Laborable } from './../utils/laborables.util';

export class AgendasRouter {
  public router: Router

  /**
   * Initialize the AgendasRouter
   */
  constructor() {
    this.router = Router();
    this.init();
  }

  /**
   * SET new Agenda for MD.
   */
  public setNew(req: Request, res: Response, next: NextFunction) {
    console.log(req.body);
    let aGuardar: AgendaModel = Object.assign(new Agenda(), req.body);
    aGuardar.save((err, agenda: AgendaModel) => {
      if (err)
        return next(err);
      AgendaService.generarTurnos(agenda, (err, result) => {
        if (err)
          return next(err);
        return res.json(agenda);
      });

    });
  }

  /**
   * GET all Agendas of certain MD.
   */
  public getByMedico(req: Request, res: Response, next: NextFunction) {
    Agenda.find({}).populate('medicoId').exec((err, agendas: Array<AgendaModel>) => {
      if (err)
        return next(err);
      res.json((<IMedico>agendas[0].medicoId));
    });
  }

  /**
   * SETUP de feriados
   */
  public setUpFeriados(req: IHasDatabaseRequest, res: Response, next: NextFunction) {
    let anio = req.params.anio;
    let desde: Date = moment(`01-01-${anio}`, 'DD-MM-YYYY').hours(0).minutes(0).seconds(0).toDate();
    let hasta: Date = moment(`31-12-${anio}`, 'DD-MM-YYYY').hours(23).minutes(59).seconds(59).toDate();
    request(NO_LABORABLES_WS + req.params.anio, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        //Borrar feriados para ese año si existen
        Feriado.remove({ fecha: { $gte: desde, $lte: hasta } }, (err) => {
          if (err)
            return next(err);
          //Una vez borrados los anteriores debo guardar los nuevos
          let feriados: Array<IWSFeriado> = JSON.parse(body);
          async.eachOf(feriados, (wsferiado, key, callback) => {
            let feriado = new Feriado();
            feriado.motivo = wsferiado.motivo;
            feriado.tipo = wsferiado.tipo;
            feriado.fecha = moment(`${wsferiado.dia}-${wsferiado.mes}-${anio}`, 'D-M-YYYY').toDate();
            feriado.save((err) => {
              if (err)
                return callback(err);
              return callback();
            });

          }, (err) => {
            if (err)
              return next(err);
            return res.json(feriados);
          });
        });
      }
    });
  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  init() {
    this.router.get('/', this.getByMedico);
    this.router.post('/',[sec.secure(), sec.hasRoles([ROL_ADMIN])], this.setNew);
    this.router.post('/setupferiados/:anio',[sec.secure(), sec.hasRoles([ROL_ADMIN])], this.setUpFeriados);
    //TODO this.router.post('/:id', this.getOne);
  }
}

// Create the HeroRouter, and export its configured Express.Router
const agendasRouter = new AgendasRouter();
agendasRouter.init();

export default agendasRouter.router;


