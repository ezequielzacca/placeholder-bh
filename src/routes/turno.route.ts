import { Medico } from './../models/medico.model';
import { ITurno } from './../interfaces/turno.interfaces';
import { IBusquedaCriteria, IResult, IBusquedaResult } from './../interfaces/busqueda.interfaces';
import { Turno } from './../models/turno.model';
import { Especialidad, EspecialidadModel } from './../models/especialidad.model';
import { IEspecialidad } from './../interfaces/especialidad.interfaces';
import { Router, Request, Response, NextFunction } from 'express';
import { ObjectID } from "mongodb";
import * as _ from "underscore";
import * as moment from 'moment';
import * as async from 'async';



export class TurnoRouter {
  public router: Router

  /**
   * Initialize the EspecialidadesRouter
   */
  constructor() {
    this.router = Router();
    this.init();
  }

  /**
   * GET all Especialidades.
   */
  public findTurnos(req: Request, res: Response, next: NextFunction) {
    const criteria: IBusquedaCriteria = req.body;
    let mongoCriteria = {};
    const desde = moment(criteria.fecha);
    const hasta = desde.clone();
    //Hasta cuando se buscaran los turnos

    //sea cual sea el dia lo cubrimos hasta las 23:59:59
    hasta.hour(23);
    hasta.minute(59);
    hasta.seconds(59);
    async.waterfall([
      //Cascada de Async 1) Criterios estaticos: medicoId, fechas, obraSocial
      (callback) => {
        if (criteria.medicoId && criteria.medicoId !== '') {
          mongoCriteria = Object.assign({}, mongoCriteria, { medicoId: criteria.medicoId });
        }


        if (criteria.obraSocial && criteria.obraSocial.planId) {
          mongoCriteria = Object.assign({}, mongoCriteria, {
            'obrasSociales.planes._id': criteria.obraSocial.planId,

          });

        }
        mongoCriteria = Object.assign({}, mongoCriteria, {
          $and: [{ 'fecha': { $gte: desde.toDate() } }, { 'fecha': { $lte: hasta.toDate() } }]
        });
        callback(null);

      }, (callback) => {
        //Cascada de Async 2) Criterio que se recupera de BD: especialidadId
        //TODO: Add por centro medico
        if ((!criteria.medicoId || criteria.medicoId === '') && (criteria.especialidadId && criteria.especialidadId !== '')) {
          Medico.find({ especialidadesId: criteria.especialidadId }).select('_id').exec((err, ids: Array<any>) => {
            mongoCriteria = Object.assign({}, mongoCriteria, { medicoId: { $in: ids.map(id => id._id) } });
            callback(null);
          });
        } else {
          callback(null);
        }
      }
    ], (err) => {
      let toRet: IBusquedaResult = {
        resultado: [],
        proximos: []
      };

      console.log(JSON.stringify(mongoCriteria));
      Turno.find(mongoCriteria).sort([['fecha', '1']]).exec((err, turnos: Array<ITurno>) => {
        if (err)
          return next(err);
        turnos.map((turno: ITurno) => {
          const medico = toRet.resultado.find(medico => medico.medicoId.toString() === turno.medicoId.toString());
          //console.log(medico);
          if (medico) {
            medico.turnos.push(turno);
          } else {
            toRet.resultado.push({ medicoId: <string>turno.medicoId, turnos: [turno] });
          }
        });
        //res.send(toRet);
        if (toRet.resultado.length < 5) {
          mongoCriteria = _.omit(mongoCriteria, '$and');
          mongoCriteria['fecha'] = { $gt: hasta };
          mongoCriteria['medicoId'] = { $nin: toRet.resultado.map(resultado => resultado.medicoId) };
          console.log(JSON.stringify(mongoCriteria));
          //Busco los proximos turnos
          Turno.find(mongoCriteria).sort([['fecha', '1']]).exec((err, turnos: Array<ITurno>) => {
            if (err)
              return next(err);
            turnos.map((turno: ITurno) => {
              const medico = toRet.proximos.find(medico => medico.medicoId.toString() === turno.medicoId.toString());
              //console.log(medico);
              if (medico && medico.turno.fecha > turno.fecha) {
                medico.turno = turno;
              } else if (!medico) {
                toRet.proximos.push({ medicoId: <string>turno.medicoId, turno: turno });
              }
            });
            res.send(toRet);


          });

        }

      });
    });



    //si ingreso un medico no es necesario filtrar por especialidad



  }




  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  init() {
    this.router.post('/buscar', this.findTurnos);


    //TODO this.router.post('/:id', this.getOne);

  }

}

// Create the HeroRouter, and export its configured Express.Router
const turnoRouter = new TurnoRouter();
turnoRouter.init();

export default turnoRouter.router;