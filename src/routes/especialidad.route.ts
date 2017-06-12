import { Especialidad, EspecialidadModel } from './../models/especialidad.model';
import { IEspecialidad } from './../interfaces/especialidad.interfaces';
import { Router, Request, Response, NextFunction } from 'express';
import { ObjectID } from "mongodb";
import * as _ from "underscore";

export class EspecialidadRouter {
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
    Especialidad.find({}, (err, especialidades: Array<EspecialidadModel>) => {
      if (err)
        return next(err);
      res.json(especialidades);
    });
  }

  /**
   * ADD new Especialidad.
   */
  public createOne(req: Request, res: Response, next: NextFunction) {
    let entity: EspecialidadModel = Object.assign(new Especialidad(), req.body);
    entity.save((err, newEspecialidad: EspecialidadModel) => {
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
    Especialidad.findOne({ _id: req.params.id }, (err, especialidad: EspecialidadModel) => {
      if (err)
        return next(err);
      res.json(especialidad);
    });
  }


  /**
   * UPDATE single Especialidad.
   */
  public updateOne(req: Request, res: Response, next: NextFunction) {
    
    let entity: EspecialidadModel = req.body
    Especialidad.findOne({ _id: req.params.id }, (err, aModificar: EspecialidadModel) => {
      if (err)
        return next(err);
      aModificar = Object.assign(aModificar, entity);
      aModificar.save((err, modificado: EspecialidadModel) => {
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
    this.router.post('/', this.createOne);
    this.router.post('/:id', this.updateOne);
    //TODO this.router.post('/:id', this.getOne);
  }
}

// Create the HeroRouter, and export its configured Express.Router
const especialidadRouter = new EspecialidadRouter();
especialidadRouter.init();

export default especialidadRouter.router;