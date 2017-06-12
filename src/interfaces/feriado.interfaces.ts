import { IAuditable } from './auditable.interface';
export interface IFeriado extends IAuditable{
    motivo:string;
    tipo:string;
    fecha:Date;
}

export interface IWSFeriado{
    motivo:string;
    tipo:string;
    dia:string;
    mes:string;
}