import { Usuario, UsuarioModel } from './../models/usuario.model';
import { SecureRequest } from './../interfaces/auth.interfaces';
import { retrieveUserByToken } from './../firebase/firebase-admin';
import app from "../app";
import { Request } from "express";
import { Response } from "express";
import { NextFunction } from "express-serve-static-core";

export class SecurityMiddleware {
    public static secure() {
        return (req: Request, res: Response, next: NextFunction)  => {
            //  
            let token = req.body.token || req.query.token || req.headers['x-access-token'];
            // decode token
            if (token) {
                // verifies secret and checks exp
                retrieveUserByToken(token, (err, user: admin.auth.UserRecord) => {
                    if (err)
                        return next(err);
                    req = Object.assign(req, { user: user });
                    return next();
                });
            } else {
                return res.status(403).send({
                    success: false,
                    message: 'No token provided.'
                });
            }
        }
    }

    public static hasRoles(roles: Array<string>) {
        return (req: SecureRequest, res: Response, next: NextFunction) => {
            //  
            const user: admin.auth.UserRecord = req.user;
            // decode token
            if (user) {
                Usuario.findOne({ email: req.user.email }, (err, usuario: UsuarioModel) => {
                    if (err)
                        return next(err);
                    if (!usuario.roles.some(rol => roles.includes(rol))) {
                        return res.status(403).send({
                            success: false,
                            message: 'User not allowed'
                        });
                    } else {
                        console.log("has role, everything cool");
                        return next();
                    }
                });
                // verifies secret and checks exp

            } else {
                return res.status(403).send({
                    success: false,
                    message: 'No user data.'
                });
            }
        }
    }
}

