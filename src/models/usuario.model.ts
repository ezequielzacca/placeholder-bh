import { IUsuario, ROL_PACIENTE, ROL_SECRETARIA, ROL_MEDICO, ROL_ADMIN } from './../interfaces/auth.interfaces';
import { PACIENTES_COLLECTION, USUARIOS_COLLECTION } from './../constants/collections.constants';
import { mongoose } from "../database/database.config";
import { Schema, Model, Document } from "mongoose";
export interface IUsuarioModel {
    //comparePassword(candidate:string, cb:any): Promise<void>;
    //updateByAge(ageLimit: number, text: string): Promise<{ ok: number, nModified: number, n: number }>
}
const schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }, roles: {
        type: [String],
        required: true,
        enum: [ROL_PACIENTE, ROL_SECRETARIA, ROL_MEDICO, ROL_ADMIN]
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



export type UsuarioModel = Model<IUsuario> & IUsuarioModel & IUsuario;
export const Usuario: UsuarioModel = <UsuarioModel>mongoose.model<IUsuario>(USUARIOS_COLLECTION, schema);