import { IAgenda } from './../interfaces/agenda.interfaces';
import { OBRAS_SOCIALES_COLLECTION, MEDICOS_COLLECTION, AGENDAS_COLLECTION } from './../constants/collections.constants';
import { mongoose } from "../database/database.config";
import { Schema, Model, Document } from "mongoose";

export interface IAgendaModel {

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



const localizacionSchema = new Schema({
    direccion: {
        type: String,
        required: true
    },
    latitud: {
        type: Number,
        required: true
    },
    longitud: {
        type: Number,
        required: true
    }
}, { _id: false });
const horarioSchema = new Schema({
    desde: {
        type: String,
        required: true
    },
    hasta: {
        type: String,
        required: true
    }
}, { _id: false });

const diaSchema = new Schema({
    numero: {
        type: Number,
        required: true,
        min: 0,
        max: 6
    },
    horarios: {
        type: [horarioSchema],
        required: true
    }
}, { _id: false });

const extraOrdinarioSchema = new Schema({
    fecha: {
        type: Date,
        required: true
    },
    horarios: {
        type: [horarioSchema],
        required: true
    }
}, { _id: false })

const rangoFechasSchema = new Schema({
    desde: {
        type: Date,
        required: true
    },
    hasta: {
        type: Date,
        required: true
    }
}, { _id: false });

const excluirSchema = new Schema({
    rango: {
        type: [rangoFechasSchema]
    },
    dias: {
        type: [extraOrdinarioSchema]
    }
}, { _id: false });


const schema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    localizacion: {
        type: localizacionSchema,
        required: true
    },
    duracionTurno: {
        type: Number,
        default: 15
    },
    medicoId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: MEDICOS_COLLECTION
    },
    dias: {
        type: [diaSchema],
        required: true
    },
    extraordinarios: {
        type: [extraOrdinarioSchema]

    },
    excluir: {
        type: excluirSchema,
        required: true
    },
    fechaAlta: {
        type: Date,
        default: Date.now
    }, fechaActualizacion: {
        type: Date
    },
    obrasSociales: {
        type: [obrasSocialSchema],
        required: true
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

export type AgendaModel = Model<IAgenda> & IAgendaModel & IAgenda;
export const Agenda: AgendaModel = <AgendaModel>mongoose.model<IAgenda>(AGENDAS_COLLECTION, schema);