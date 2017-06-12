import { IObraSocial } from './obra-social.interface';
import { IPaciente } from './paciente.interfaces';
import { IAgenda, IObraSocialSeleccionada } from './agenda.interfaces';
import { IMedico } from './medico.interfaces';
import { IAuditable } from './auditable.interface';
export interface ITurno extends IAuditable {
    fecha: Date;
    agendaId: string | IAgenda;
    medicoId: string | IMedico;
    turnoAnteriorId?: string | ITurno;
    pacienteId?: string | IPaciente;
    fechaCancelacion?: Date;
    obrasSociales:Array<IObraSocial>;
    obraSocialSeleccionada:IObraSocialSeleccionada;
}