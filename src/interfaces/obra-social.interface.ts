import { IAuditable } from './auditable.interface';
export interface IObraSocial extends IAuditable{
    nombre:string;
    planes:Array<IPlan>;
}

export interface IPlan extends IAuditable{
    nombre:string;
}