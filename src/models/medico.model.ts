import { MEDICOS_COLLECTION, USUARIOS_COLLECTION, CENTROS_MEDICOS_COLLECTION, ESPECIALIDADES_COLLECTION } from './../constants/collections.constants';
import { IMedico } from './../interfaces/medico.interfaces';
import { mongoose } from "../database/database.config";
import { Schema, Model, Document } from "mongoose";
export interface IMedicoModel {
    //comparePassword(candidate:string, cb:any): Promise<void>;
    //updateByAge(ageLimit: number, text: string): Promise<{ ok: number, nModified: number, n: number }>
}



const schema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    matricula: {
        type: Number,
        required: true
    },
    fechaAlta: {
        type: Date,
        default: Date.now
    },
    fechaActualizacion: {
        type: Date
    },
    usuarioId: {
        type: Schema.Types.ObjectId,
        ref: USUARIOS_COLLECTION,
        required: false
    },
    centroMedicoId: {
        type: Schema.Types.ObjectId,
        ref: CENTROS_MEDICOS_COLLECTION,
        required: false
    },
    especialidadesId: [{
        type: Schema.Types.ObjectId,
        ref: ESPECIALIDADES_COLLECTION
    }],
    avatar: {
        data: Buffer,
        contentType:String,
        required: false
    }
}, {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
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



export type MedicoModel = Model<IMedico> & IMedicoModel & IMedico;
export const Medico: MedicoModel = <MedicoModel>mongoose.model<IMedico>(MEDICOS_COLLECTION, schema);