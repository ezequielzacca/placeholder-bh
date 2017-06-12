import { IEspecialidad } from './especialidad.interfaces';
import { ICentroMedico } from './centro-medico.interfaces';
import { IUsuario } from './auth.interfaces';

import { IAuditable } from './auditable.interface';
export interface IMedico extends IAuditable {
    nombre: string;
    matricula: number;
    usuarioId: string | IUsuario;
    centroMedicoId: string | ICentroMedico;
    especialidadesId: Array<string | IEspecialidad>;
    avatar: { data?: Buffer, contentType?: string };
}