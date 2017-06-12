import { SecurityMiddleware as sec } from './../middleware/security.middleware';
import { ROL_ADMIN } from './../interfaces/auth.interfaces';
import { ObraSocial, ObraSocialModel } from './../models/obra-social.model';
import { Router, Request, Response, NextFunction } from 'express';
import { ObjectID } from "mongodb";
import * as _ from "underscore";

export class ObraSocialRouter {
  public router: Router

  /**
   * Initialize the ObrasSocialesRouter
   */
  constructor() {
    this.router = Router();
    this.init();
  }

  /**
   * GET all ObrasSociales.
   */
  public getAll(req: Request, res: Response, next: NextFunction) {
    ObraSocial.find({}, (err, obrasSociales: Array<ObraSocialModel>) => {
      if (err)
        throw err;
      res.json(obrasSociales);
    });

  }

  /**
   * GET all ObrasSociales.
   */
  public createOne(req: Request, res: Response, next: NextFunction) {
    let entity: ObraSocialModel = Object.assign(new ObraSocial(),req.body);
    entity.save((err, result: ObraSocialModel) => {
      if (err)
        throw err;
      res.json(result);
    });

  }

  /**
  * GET single ObraSocial.
  */
  public getOne(req: Request, res: Response, next: NextFunction) {
    ObraSocial.findOne({ _id: req.params.id }, (err, obraSocial: ObraSocialModel) => {
      if (err)
        throw err;
      res.json(obraSocial);
    });

  }



  /**
   * UPDATE single ObrasSocial.
   */
  public updateOne(req: Request, res: Response, next: NextFunction) {

    let entity: ObraSocialModel = req.body
    ObraSocial.findOne({ _id: req.params.id }, (err, result:ObraSocialModel) => {
      if (err) 
        throw err;
      result = Object.assign(result,entity);
      result.save((err,modificado:ObraSocialModel)=>{
        res.json(modificado);
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


    this.router.post('/', [sec.secure(), sec.hasRoles([ROL_ADMIN])], this.createOne);
    this.router.post('/:id', [sec.secure(), sec.hasRoles([ROL_ADMIN])], this.updateOne);
    //TODO this.router.post('/:id', this.getOne);

  }

}

// Create the HeroRouter, and export its configured Express.Router
const obraSocialRouter = new ObraSocialRouter();
obraSocialRouter.init();

export default obraSocialRouter.router;