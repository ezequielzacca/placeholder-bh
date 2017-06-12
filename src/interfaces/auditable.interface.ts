import { Document } from 'mongoose';
export interface IAuditable extends Document{
    fechaAlta?:Date;
    fechaModificacion?:Date;
}