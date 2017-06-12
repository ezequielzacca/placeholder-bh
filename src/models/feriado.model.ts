import { IFeriado } from './../interfaces/feriado.interfaces';
import { FERIADOS_COLLECTION } from './../constants/collections.constants';
import { mongoose } from "../database/database.config"; 
import {Schema, Model, Document} from "mongoose";

export interface IFeriadoModel {
    //comparePassword(candidate:string, cb:any): Promise<void>;
    //updateByAge(ageLimit: number, text: string): Promise<{ ok: number, nModified: number, n: number }>
}

const schema = new Schema({
    motivo: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        required: true
    },
    fecha:{
        type:Date,
        required:true
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

/*schema.virtual('comercio').get(function () {
    return this.__comercio;
}).set(function (v) {
    this.__comercio = v;
});*/

export type FeriadoModel = Model<IFeriado> & IFeriadoModel & IFeriado;
export const Feriado: FeriadoModel = <FeriadoModel>mongoose.model<IFeriado>(FERIADOS_COLLECTION, schema);