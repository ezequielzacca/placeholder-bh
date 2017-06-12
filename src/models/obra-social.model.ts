import { IObraSocial } from './../interfaces/obra-social.interface';
import { OBRAS_SOCIALES_COLLECTION } from './../constants/collections.constants';
import { mongoose } from "../database/database.config";
import { Schema, Model, Document } from "mongoose";

export interface IObraSocialModel {
    //comparePassword(candidate:string, cb:any): Promise<void>;
    //updateByAge(ageLimit: number, text: string): Promise<{ ok: number, nModified: number, n: number }>
}


const planSchema = new Schema({
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
    }
});


const schema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    fechaAlta: {
        type: Date,
        default: Date.now
    },
    planes: {
        type: [planSchema],
        default: []
    },
    fechaActualizacion: {
        type: Date
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

export type ObraSocialModel = Model<IObraSocial> & IObraSocialModel & IObraSocial;
export const ObraSocial: ObraSocialModel = <ObraSocialModel>mongoose.model<IObraSocial>(OBRAS_SOCIALES_COLLECTION, schema);