import { Feriado,FeriadoModel } from './../models/feriado.model';
import { FERIADOS_COLLECTION } from './../constants/collections.constants';
import * as moment from 'moment';
import { DateRange } from 'moment-range';
import { isWeekendDay } from 'moment-business';


export class Laborable {
    private _diasNoLaborables: Array<moment.Moment> = [];

    constructor() {
        this.initialize();
    }

    private initialize() {
        setTimeout(() => {
            Feriado.find({},(err, feriados:Array<FeriadoModel>) => {
                if (err)
                    throw err;
                feriados.map(feriado => {
                    this._diasNoLaborables.push(moment(feriado.fecha));
                });
            })
        }, 2000);

    }

    public esNoLaborable(fecha: moment.Moment): boolean {
        let toReturn = false;
        this._diasNoLaborables.map(feriado => {
            if (feriado.isSame(fecha, 'day')) {
                console.log('Es feriado');
                toReturn = true;
            }
        });
        return toReturn;
    }
}