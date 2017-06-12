import { IUsuario } from './auth.interfaces';
import { IAuditable } from './auditable.interface';
export interface IPaciente extends IAuditable{
    nombre:string;
    usuarioId:string | IUsuario;
}