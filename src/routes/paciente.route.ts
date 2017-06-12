import { ROL_ADMIN } from './../interfaces/auth.interfaces';
import { SecurityMiddleware as sec } from './../middleware/security.middleware';
import { Paciente, PacienteModel } from './../models/paciente.model';
import { Router, Request, Response, NextFunction } from 'express';
import { ObjectID } from "mongodb";

import * as _ from "underscore";

export class PacientesRouter {
  public router: Router

  /**
   * Initialize the PacientesRouter
   */
  constructor() {
    this.router = Router();
    this.init();
  }

  /**
   * GET all Pacientes.
   */
  public getAll(req: Request, res: Response, next: NextFunction) {
    Paciente.find({}, (err, pacientes: Array<PacienteModel>) => {
      if (err)
        return next(err);
      res.json(pacientes);
    });
  }

  /**
   * GET all Pacientes.
   */
  public createOne(req: Request, res: Response, next: NextFunction) {
    let entity: PacienteModel = req.body
    entity.save((err, result: PacienteModel) => {
      if (err)
        return next(err);
      res.send(result);
    });
  }

  /**
  * GET single Paciente.
  */
  public getOne(req: Request, res: Response, next: NextFunction) {
    Paciente.findOne({ _id: req.params.id }, (err, paciente: PacienteModel) => {
      if (err)
        return next(err);
      res.json(paciente);
    });
  }

  /**
   * UPDATE single Paciente.
   */
  public updateOne(req: Request, res: Response, next: NextFunction) {
    //when updating we need to remove the id property of the object in order to make it inmutable

    let entity: PacienteModel = req.body;
    Paciente.findOne({ _id: req.params.id }, (err, pacienteActualizar: PacienteModel) => {
      pacienteActualizar = Object.assign(pacienteActualizar, entity);
      pacienteActualizar.save((err, pacienteActualizado: PacienteModel) => {
        res.send(pacienteActualizado);
      })

    });

  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  init() {
    this.router.get('/', this.getAll);
    this.router.get('/:id', this.getOne);
    this.router.post('/',[sec.secure(), sec.hasRoles([ROL_ADMIN])], this.createOne);
    this.router.post('/:id',[sec.secure(), sec.hasRoles([ROL_ADMIN])], this.updateOne);
    //TODO this.router.post('/:id', this.getOne);

  }

}

// Create the HeroRouter, and export its configured Express.Router
const pacientesRouter = new PacientesRouter();
pacientesRouter.init();

export default pacientesRouter.router;