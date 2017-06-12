import { ROL_ADMIN } from './../interfaces/auth.interfaces';
import { SecurityMiddleware as sec } from './../middleware/security.middleware';

import { CentroMedico, CentroMedicoModel } from './../models/centro-medico.model';
import { IEspecialidad } from './../interfaces/especialidad.interfaces';
import { Router, Request, Response, NextFunction } from 'express';
import { ObjectID } from "mongodb";
import * as _ from "underscore";

export class CentroMedicoRouter {
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
  public getAll(req: Request, res: Response, next: NextFunction) {
    CentroMedico.find({}, (err, especialidades: Array<CentroMedicoModel>) => {
      if (err)
        return next(err);
      res.json(especialidades);
    });

  }

  /**
   * ADD new Especialidad.
   */
  public createOne(req: Request, res: Response, next: NextFunction) {

    let entity: CentroMedicoModel = Object.assign(new CentroMedico(), req.body);

    entity.save((err, newEspecialidad: CentroMedicoModel) => {
      if (err) 
        return next(err)      
      res.json(newEspecialidad);
    });

  }

  /**
  * GET single Especialidad.
  */
  public getOne(req: Request, res: Response, next: NextFunction) {
    console.log(req.params.id);
    CentroMedico.findOne({ _id: req.params.id }, (err, especialidad: CentroMedicoModel) => {
      if (err)
        return next(err);
      res.json(especialidad);
    });

  }



  /**
   * UPDATE single Especialidad.
   */
  public updateOne(req: Request, res: Response, next: NextFunction) {
    
    let entity: CentroMedicoModel = req.body
    CentroMedico.findOne({ _id: req.params.id }, (err, aModificar: CentroMedicoModel) => {
      if (err)
        return next(err);
      aModificar = Object.assign(aModificar, entity);
      aModificar.save((err, modificado: CentroMedicoModel) => {
        res.json(modificado);
      });

    });

  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  init() {
    this.router.get('/', this.getAll);
    this.router.get('/:id', this.getOne);
    this.router.post('/' ,[sec.secure(),sec.hasRoles([ROL_ADMIN])], this.createOne);
    this.router.post('/:id', this.updateOne);
    //TODO this.router.post('/:id', this.getOne);

  }

}

// Create the HeroRouter, and export its configured Express.Router
const centroMedicoRouter = new CentroMedicoRouter();
centroMedicoRouter.init();

export default centroMedicoRouter.router;