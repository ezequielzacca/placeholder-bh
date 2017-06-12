import { SecureRequest } from './auth.interfaces';
import { IAuditable } from './auditable.interface';
import { Request } from 'express';
import * as admin from 'firebase-admin';
export interface SecureRequest extends Request {
    user: admin.auth.UserRecord;

}

export interface HasFilesRequest extends SecureRequest{
    files:any;
}

export interface IUsuario extends IAuditable {
    fbUID?: string;
    email: string;
    roles: Array<string>;

}

export interface IRoles {
    medico: string;
    paciente: string;
    secretaria: string;
    admin: string;
}


export const ROL_MEDICO = "MEDICO";
export const ROL_PACIENTE = "PACIENTE";
export const ROL_SECRETARIA = "SECRETARIA";
export const ROL_ADMIN = "ADMIN";

export const ROLES: IRoles = { medico: ROL_MEDICO, paciente: ROL_PACIENTE, secretaria: ROL_SECRETARIA, admin: ROL_ADMIN };