import { IObraSocial, IPlan } from './obra-social.interface';
import { IMedico } from './medico.interfaces';
import { IAuditable } from './auditable.interface';
import { DateRange } from 'moment-range';

import { ObjectID } from 'mongodb';
export interface IAgenda extends IAuditable{
    nombre:string;
    duracionTurno:number;
    localizacion:ILocalizacion;
    medicoId:string | IMedico;
    fechaBaja?:Date;
    dias:Array<IDiaSemanal>;
    extraordinarios:Array<IDiaExtraordinario>;
    excluir:IExcluir;
    obrasSociales:Array<IObraSocial>;
}
/**
 * Simboliza una direccion y puntos en el mapa
 */


export interface IObraSocialSeleccionada{
    obraSocialId:string | IObraSocial;
    planId:string | IPlan;
}

export interface IPlanesAgenda{
    planId:string;
}

export interface ILocalizacion{
    direccion:string;
    latitud:number;
    longitud:number;
}

export interface IDiaSemanal{
    //0: Lunes, 1: Martes ... 6: Domingo
    numero:number;
    horarios:Array<IHorario>;
}

export interface IDiaExtraordinario{
    fecha:Date;
    horarios:Array<IHorario>;
}

export interface IHorario{
    desde:string;
    hasta:string;
}

export interface IRangoFechas{
    desde:Date;
    hasta:Date;
}

export interface IExcluir{
    rango:Array<IRangoFechas>;
    dias:Array<IDiaExtraordinario>;
}


