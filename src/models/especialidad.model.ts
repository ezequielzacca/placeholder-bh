import { ESPECIALIDADES_COLLECTION } from './../constants/collections.constants';
import { IEspecialidad } from './../interfaces/especialidad.interfaces';
import { mongoose } from "../database/database.config"; 
import {Schema, Model, Document} from "mongoose";

//Permite añadir metodos propios del Modelo
export interface IEspecialidadModel {
    //comparePassword(candidate:string, cb:any): Promise<void>;
    //updateByAge(ageLimit: number, text: string): Promise<{ ok: number, nModified: number, n: number }>
}

//Define el esquema para MongoDB
const schema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    fechaAlta: {
        type: Date,
        default: Date.now        
    }, fechaActualizacion: {
        type: Date
    }
}, {
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

schema.pre('save', function (next) {
    var entity = this;
    entity.fechaActualizacion = new Date();
    next();
});



export type EspecialidadModel = Model<IEspecialidad> & IEspecialidadModel & IEspecialidad;
export const Especialidad: EspecialidadModel = <EspecialidadModel>mongoose.model<IEspecialidad>(ESPECIALIDADES_COLLECTION, schema);