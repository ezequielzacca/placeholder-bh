import { ICentroMedico } from './../interfaces/centro-medico.interfaces';
import { CENTROS_MEDICOS_COLLECTION } from './../constants/collections.constants';
import { mongoose } from "../database/database.config"; 
import {Schema, Model, Document} from "mongoose";

//Permite añadir metodos propios del Modelo
export interface ICentroMedicoModel {
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



export type CentroMedicoModel = Model<ICentroMedico> & ICentroMedicoModel & ICentroMedico;
export const CentroMedico: CentroMedicoModel = <CentroMedicoModel>mongoose.model<ICentroMedico>(CENTROS_MEDICOS_COLLECTION, schema);