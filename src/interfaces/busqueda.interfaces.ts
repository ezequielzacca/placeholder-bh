import { ITurno } from './turno.interfaces';
export interface IBusquedaCriteria {
    obraSocial?: { obraSocialId: string, planId: string };
    centroMedicoId?: string;
    especialidadId?: string;
    medicoId?: string;
    //granularidad: string;
    fecha:Date;
}


export interface IBusquedaResult {
    resultado:Array<IResult>,
    proximos:Array<IProximo>
}



export interface IResult {
  medicoId: string;
  turnos: Array<ITurno>;
}

export interface IProximo {
  medicoId: string;
  turno: ITurno;
}