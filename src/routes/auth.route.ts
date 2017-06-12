import { Paciente } from './../models/paciente.model';
import { Usuario } from './../models/usuario.model';
import { SecureRequest, ROL_PACIENTE } from './../interfaces/auth.interfaces';
import { SecurityMiddleware as sec } from './../middleware/security.middleware';
import { Medico, MedicoModel } from './../models/medico.model';

import { MEDICOS_COLLECTION } from './../constants/collections.constants';
import { Router, Request, Response, NextFunction } from 'express';
import { ObjectID } from "mongodb";
import { createUserWithEmail } from "../firebase/firebase-admin"
import * as _ from "underscore";


export class AuthRouter {
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
  public getUserRole(req: SecureRequest, res: Response, next: NextFunction) {
    console.log("getting roles called");
    Usuario.findOne({ email: req.user.email }, (err, usuario) => {
      if (err)
        return next(err);
      //es un usuario nuevo por lo tanto solo puede ser paciente
      if (!usuario) {
        let usuario = new Usuario();
        usuario.roles = [ROL_PACIENTE];
        usuario.email = req.user.email;
        usuario.save((err, usuario) => {
          if (err)
            return next(err);

          let paciente = new Paciente();
          paciente.nombre = req.user.displayName;
          paciente.usuarioId = usuario._id;
          paciente.save((err, paciente) => {
            if (err)
              return next(err);
            res.json({ roles: usuario.roles });
            //checkear si es el primer login para asociar al medico/secretaria/admin
            

          })
        });
      } else {
        res.json({ roles: usuario.roles });
      }
    })
  }

  /**
   * GET all Medicos.
   */
  public checkUserExists(req: SecureRequest, res: Response, next: NextFunction) {
    let email = req.params.email;    
    Usuario.findOne({ email: email }, (err, usuario) => {
      if (err)
        return next(err);
      //es un usuario nuevo por lo tanto solo puede ser paciente
      if (usuario) {
        res.json({exists:true});
      } else {
        res.json({ exists:false });
      }
    })
  }

  /**
 * GET all Medicos.
 */
  public registerUser(req: SecureRequest, res: Response, next: NextFunction) {
     
    Usuario.findOne({ email: req.body.email }, (err, existe) => {
      if (err)
        return next(err);
      //es un usuario nuevo por lo tanto solo puede ser paciente
      if (existe)
        return res.status(500).json({ error: "El usuario ya existe" });
      
      let usuario = new Usuario();
      usuario.roles = [ROL_PACIENTE];
      usuario.email = req.body.email;
      usuario.save((err, usuario) => {
        if (err)
          return next(err);
        createUserWithEmail({ email: req.body.email, password: req.body.password, displayName: req.body.name }, (err, user) => {
          if (err)
            return next(err);
          let paciente = new Paciente();
          paciente.nombre = req.body.name;
          paciente.usuarioId = usuario._id;
          paciente.save((err, paciente) => {
            if (err)
              return next(err);
            res.json(usuario);
          });
        });

      });

    })

  }




  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  init() {
    //Insecure route
    this.router.get('/user/exists/:email', this.checkUserExists);
    this.router.post('/register', this.registerUser);

    //Secure routes
    this.router.use(sec.secure());
    this.router.get('/roles', this.getUserRole);
    
    
    //TODO this.router.post('/:id', this.getOne);

  }

}

// Create the HeroRouter, and export its configured Express.Router
const authRouter = new AuthRouter();
authRouter.init();

export default authRouter.router;