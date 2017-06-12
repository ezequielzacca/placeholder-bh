

import { Turno } from './../models/turno.model';
import { IAgenda } from './../interfaces/agenda.interfaces';
import { Agenda, AgendaModel } from './../models/agenda.model';
import { ROL_MEDICO, IUsuario, SecureRequest, ROL_ADMIN, HasFilesRequest } from './../interfaces/auth.interfaces';
import { Usuario, UsuarioModel } from './../models/usuario.model';
import { SecurityMiddleware as sec } from './../middleware/security.middleware';
import { Medico, MedicoModel } from './../models/medico.model';
import { AgendaService } from './../services/agenda.service';
import { MEDICOS_COLLECTION } from './../constants/collections.constants';
import { IMedico } from './../interfaces/medico.interfaces';
import { Router, Request, Response, NextFunction } from 'express';
import { ObjectID } from "mongodb";
import * as _ from "underscore";
import * as jimp from "jimp";
import * as fileType from 'file-type';


export class MedicosRouter {
  router: Router

  /**
   * Initialize the MedicosRouter
   */
  constructor() {
    this.router = Router();
    this.init();
  }

  /**
   * GET all Medicos.
   */
  public getAll(req: Request, res: Response, next: NextFunction) {
    Medico.find({},{ avatar:0,usuarioId:0 }, (err, medicos: Array<MedicoModel>) => {
      if (err)
        return next(err);
      res.json(medicos);
    });
  }

  /**
   * GET all Medicos.
   */
  public createOne(req: Request, res: Response, next: NextFunction) {
    let medico: MedicoModel = Object.assign(new Medico(), _.omit(req.body, 'email'));
    let usuario = Object.assign(new Usuario(), { email: req.body.email, roles: [ROL_MEDICO] });
    usuario.save((err, usuario) => {
      if (err)
        return next(err);
      medico.usuarioId = usuario._id;
      medico.save((err, result: MedicoModel) => {
        if (err) {
          return next(err);
        }
        res.json(result);
      });
    });
  }

  /**
  * GET all Medicos.
  */
  public getOne(req: Request, res: Response, next: NextFunction) {
    console.log(req.params.id);
    Medico.findOne({ _id: req.params.id },{ avatar:0,usuarioId:0 }, (err, medico: MedicoModel) => {
      if (err)
        return next(err);
      res.json(medico);
    });
  }

  /**
* GET all Medicos.
*/
  public getDatos(req: SecureRequest, res: Response, next: NextFunction) {
    Usuario.findOne({ email: req.user.email }, (err, usuario) => {
      if (err)
        return next(err);
      Medico.findOne({ usuarioId: usuario._id }, (err, medico: MedicoModel) => {
        if (err)
          return next(err);
        res.json({ _id: medico._id, matricula: medico.matricula, nombre: medico.nombre, especialidadesId: medico.especialidadesId });
      });

    })
  }

  /**
* Update datos of loged in Medico.
*/
  public updateDatos(req: SecureRequest, res: Response, next: NextFunction) {
    Usuario.findOne({ email: req.user.email }, (err, usuario) => {
      if (err)
        return next(err);
      Medico.findOne({ usuarioId: usuario._id }, (err, medico: MedicoModel) => {
        if (err)
          return next(err);
        medico = Object.assign(medico, req.body);
        medico.save((err, medico) => {
          return res.json({ _id: medico._id, matricula: medico.matricula, nombre: medico.nombre, especialidadesId: medico.especialidadesId });
        })
      });

    })
  }

  /**
   * UPDATE single Medico.
   */
  public updateOne(req: Request, res: Response, next: NextFunction) {
    let entity: MedicoModel = req.body;
    Medico.findOne({ _id: req.params.id }, (err, result: MedicoModel) => {
      if (err)
        return next(err);
      result = Object.assign(result, entity);
      result.save((err, newEntity: MedicoModel) => {
        res.json(newEntity);
      });

    });

  }


  /**
* GET all Medicos.
*/
  public getAgendas(req: SecureRequest, res: Response, next: NextFunction) {
    Usuario.findOne({ email: req.user.email }, (err, usuario) => {
      if (err)
        return next(err);
      Medico.findOne({ usuarioId: usuario._id }, (err, medico: MedicoModel) => {
        if (err)
          return next(err);
        Agenda.find({ medicoId: medico._id }, (err, agendas: Array<AgendaModel>) => {
          if (err)
            return next(err);
          return res.json(agendas);
        })
      });

    })


  }

  /**
* GET all Medicos.
*/
  public updateAgenda(req: SecureRequest, res: Response, next: NextFunction) {
    Usuario.findOne({ email: req.user.email }, (err, usuario) => {
      if (err)
        return next(err);
      Medico.findOne({ usuarioId: usuario._id }, (err, medico: MedicoModel) => {
        if (err)
          return next(err);
        Agenda.findOne({ medicoId: medico._id, _id: req.params.id }, (err, agenda: AgendaModel) => {
          if (err)
            return next(err);
          agenda = Object.assign(agenda, <AgendaModel>req.body);
          console.log(agenda);
          Turno.update({ agendaId: agenda._id }, { $set: { fechaCancelacion: new Date() } }, { multi: true }, (err, turnos) => {
            if (err)
              return next(err);
            agenda.save((err, agenda) => {
              if (err)
                return next(err);
              AgendaService.generarTurnos(agenda, (err, result) => {
                console.log("termino de generar los turnos ", JSON.stringify(result));
                if (err)
                  return next(err);
                console.log(result);
                return res.json(agenda);
              });
            });
          });
        });
      });
    });
  }

  /**
* GET all Medicos.
*/
  public checkIfUpdateAgenda(req: SecureRequest, res: Response, next: NextFunction) {
    Usuario.findOne({ email: req.user.email }, (err, usuario) => {
      if (err)
        return next(err);
      Medico.findOne({ usuarioId: usuario._id }, (err, medico: MedicoModel) => {
        if (err)
          return next(err);
        let agenda = Object.assign(req.body, { medicoId: medico._id });
        AgendaService.checkearTurnosACancelar(agenda, (err, result) => {
          console.log("verificar cuantos turnos se cancelaran ", result);
          if (err)
            return next(err);
          console.log(result);
          return res.json(result);
        })
      });
    });
  }

  /**
* CREATES new Agenda for Medico.
*/
  public createAgenda(req: SecureRequest, res: Response, next: NextFunction) {
    Usuario.findOne({ email: req.user.email }, (err, usuario) => {
      if (err)
        return next(err);
      Medico.findOne({ usuarioId: usuario._id }, (err, medico: MedicoModel) => {
        if (err)
          return next(err);
        let agenda = Object.assign(new Agenda(), <AgendaModel>_.omit(req.body, '_id'), { medicoId: medico._id });
        agenda.save((err, agenda) => {
          if (err)
            return next(err);
          AgendaService.generarTurnos(agenda, (err, result) => {
            console.log("termino de generar los turnos");
            if (err)
              return next(err);
            return res.json(agenda);
          })
        })

      });

    });


  }

  public updateAvatar(req: HasFilesRequest, res: Response, next: NextFunction) {
    if (!req.files)
      return res.status(400).send('No files were uploaded.');
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFileBuffer: Buffer = req.files.file.data;
    Usuario.findOne({ email: req.user.email }, (err, usuario) => {
      if (err)
        return next(err);
      Medico.findOne({ usuarioId: usuario._id }, (err, medico: MedicoModel) => {
        if (err)
          throw err;
        jimp.read(sampleFileBuffer, function (err, image) {
          let mimeType = fileType(sampleFileBuffer).mime;
          // do stuff with the image (if no exception)
          if (err)
            throw err;
          image.resize(jimp.AUTO, 100).getBuffer(mimeType, (err, imageBuffer) => {
            medico.avatar.data = imageBuffer;
            medico.avatar.contentType = mimeType;
            medico.save((err, saved) => {
              if (err)
                throw err;
              res.json({ succes: true });
            });
          });
        });
      });
    });
  }


  public getAvatar(req: HasFilesRequest, res: Response, next: NextFunction) {
    Usuario.findOne({ email: req.user.email }, (err, usuario) => {
      if (err)
        return next(err);
      Medico.findOne({ usuarioId: usuario._id }, (err, medico: MedicoModel) => {
        if (err)
          res.status(500).json(err);
        res.set('Content-Type', medico.avatar.contentType);
        return res.send(medico.avatar.data);
      });
    });
  }

  public getAvatarById(req: HasFilesRequest, res: Response, next: NextFunction) {

    Medico.findOne({ _id: req.params.id }, (err, medico: MedicoModel) => {
      if (err)
        res.status(500).json(err);
      res.set('Content-Type', medico.avatar.contentType);
      return res.send(medico.avatar.data);
    });

  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  init() {
    //has to have medico role
    this.router.post('/agendas/check', [sec.secure(), sec.hasRoles([ROL_MEDICO])], this.checkIfUpdateAgenda);
    this.router.post('/agendas/:id', [sec.secure(), sec.hasRoles([ROL_MEDICO])], this.updateAgenda);
    this.router.get('/datos', [sec.secure(), sec.hasRoles([ROL_MEDICO])], this.getDatos);
    this.router.post('/datos', [sec.secure(), sec.hasRoles([ROL_MEDICO])], this.updateDatos);
    this.router.post('/avatar', [sec.secure(), sec.hasRoles([ROL_MEDICO])], this.updateAvatar);
    this.router.get('/avatar', [sec.secure(), sec.hasRoles([ROL_MEDICO])], this.getAvatar);
    this.router.get('/avatar/:id', this.getAvatarById);
    this.router.get('/agendas', [sec.secure(), sec.hasRoles([ROL_MEDICO])], this.getAgendas);
    this.router.post('/agendas', [sec.secure(), sec.hasRoles([ROL_MEDICO])], this.createAgenda);


    //public
    this.router.get('/', this.getAll);
    this.router.get('/:id', this.getOne);

    //has to be admin
    this.router.post('/', [sec.secure(), sec.hasRoles([ROL_ADMIN])], this.createOne);
    this.router.post('/:id', [sec.secure(), sec.hasRoles([ROL_ADMIN])], this.updateOne);
    //TODO this.router.post('/:id', this.getOne);


  }

}

// Create the HeroRouter, and export its configured Express.Router
const medicosRouter = new MedicosRouter();
medicosRouter.init();

export default medicosRouter.router;