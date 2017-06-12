import { USUARIOS_COLLECTION, PACIENTES_COLLECTION } from './../constants/collections.constants';
import { IPaciente } from './../interfaces/paciente.interfaces';
import { mongoose } from "../database/database.config";
import { Schema, Model, Document } from "mongoose";
export interface IPacienteModel {
    //comparePassword(candidate:string, cb:any): Promise<void>;
    //updateByAge(ageLimit: number, text: string): Promise<{ ok: number, nModified: number, n: number }>
}
const schema = new Schema({
    nombre: {
        type: String,
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



export type PacienteModel = Model<IPaciente> & IPacienteModel & IPaciente;
export const Paciente: PacienteModel = <PacienteModel>mongoose.model<IPaciente>(PACIENTES_COLLECTION, schema);