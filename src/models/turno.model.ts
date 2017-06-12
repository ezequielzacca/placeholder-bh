import { ITurno } from './../interfaces/turno.interfaces';
import { MEDICOS_COLLECTION, PACIENTES_COLLECTION, AGENDAS_COLLECTION, TURNOS_COLLECTION, OBRAS_SOCIALES_COLLECTION } from './../constants/collections.constants';
import { mongoose } from "../database/database.config";
import { Schema, Model, Document } from "mongoose";
import * as moment from 'moment';
export interface ITurnoModel {
    //comparePassword(candidate:string, cb:any): Promise<void>;
    //updateByAge(ageLimit: number, text: string): Promise<{ ok: number, nModified: number, n: number }>
}

const planSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    nombre: {
        type: String,
        required: false
    }
}, { _id: false });

const obrasSocialSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: OBRAS_SOCIALES_COLLECTION
    },
    nombre: {
        type: String,
        required: false
    },
    planes: {
        type: [planSchema],
        required: true
    }
}, { _id: false });

const obraSocialSeleccionadaSchema = new Schema({
    obraSocialId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: OBRAS_SOCIALES_COLLECTION
    },
    planId: {
        type: Schema.Types.ObjectId,
        required: true
    }
}, { _id: false });

const schema = new Schema({
    medicoId: {
        type: Schema.Types.ObjectId,
        ref: MEDICOS_COLLECTION,
        required: true
    },
    pacienteId: {
        type: Schema.Types.ObjectId,
        ref: PACIENTES_COLLECTION,
        required: false
    },
    agendaId: {
        type: Schema.Types.ObjectId,
        ref: AGENDAS_COLLECTION,
        required: false
    },
    turnoAnteriorId: {
        type: Schema.Types.ObjectId,
        ref: TURNOS_COLLECTION,
        required: false
    },
    fechaCancelacion: {
        type: Date,
        required: false
    },
    obrasSociales: {
        type: [obrasSocialSchema],
        required: true
    },
    obrasSocialSeleccionada: {
        type: obraSocialSeleccionadaSchema,
        required: false
    },
    fecha: {
        type: Date,
        required: true
    },
    fechaAlta: {
        type: Date,
        default: Date.now
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

schema.virtual('fechaFormateada').get(function () {
    return moment(this.fecha).format('DD/MM/YYYY HH:mm');
});



export type TurnoModel = Model<ITurno> & ITurnoModel & ITurno;
export const Turno: TurnoModel = <TurnoModel>mongoose.model<ITurno>(TURNOS_COLLECTION, schema);