import { MedicoModel } from './../models/medico.model';

import { Request } from 'express';
export interface IHasDatabaseRequest extends Request {
    database: IDatabase;
}

export interface IDatabase {
    medicos: MedicoModel;
}