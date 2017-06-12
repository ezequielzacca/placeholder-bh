import { ITurno } from './../interfaces/turno.interfaces';
import { Turno } from './../models/turno.model';
import { Laborable } from './../utils/laborables.util';
import { IAgenda } from './../interfaces/agenda.interfaces';
import * as moment from 'moment';
import { DateRange } from 'moment-range';
import * as async from 'async';

interface IDebugTurnos {
    fecha: string;
    turnos: Array<string>;
}

interface IDiaSemanalVerificar {
    numero: number,
    horarios: Array<{ desde: number, hasta: number }>//voy a usar number donde la hora la voy a poner en formato hhmm,
    //por ejemplo entre las 12:00 y las 17:00 seria entre 1200 y 1700  
}



export class AgendaService {



    /**
     * Verifica por cada turno que tiene un paciente asignado, si el turno quedara
     * o no en la nueva agenda, si el turno no quedara lo cuenta
     */
    public static checkearTurnosACancelar(agenda: IAgenda, callback: Function): void {

        //rangos contendra los rangos de las fechas extraordinaras
        const rangosExt: Array<DateRange> = [];
        const diasDeLaSemana: Array<IDiaSemanalVerificar> = [];
        //rangos quitar contendra los rangos de exluir rango y excluir dias
        const rangosQuitar: Array<DateRange> = [];

        /**
         * Genera los turnos basados en lo que el usuario cargo en la agenda
         */
        let ahora = moment();
        let algunTiempoDesdeAhora = moment().add(6, 'w');
        //let algunTiempoDesdeAhora = moment().add(1, 'y');
        let rangoCalendario = new DateRange(ahora, algunTiempoDesdeAhora);
        let rangosExtraordinario: Array<{ fecha: Date, horario: DateRange }> = [];
        let rangosExcluir: { dias: Array<DateRange>, horarios: Array<DateRange> } = {
            dias: [],
            horarios: []
        };
        //debo excluir los rangos de dias a excluir que especifico el medico
        agenda.excluir.rango.map(periodo => {
            let desde: moment.Moment = moment(periodo.desde).hours(0).minutes(0).seconds(0);
            let hasta: moment.Moment = moment(periodo.hasta).hours(23).minutes(59).seconds(59);
            //genero el rango basado en dia desde y hasta y lo substraigo del rango calendario
            rangosQuitar.push(new DateRange(desde, hasta));
        });
        //ahora debo excluir las horas particulares de los dias especificos que el medico desea excluir
        agenda.excluir.dias.map(dia => {
            //el medico puede especificar un array de horarios asi que debo iterar por cada uno
            dia.horarios.map(horario => {
                //desde es el dia
                let desde: moment.Moment = moment(dia.fecha);
                //y hasta tambien por eso lo clono
                let hasta: moment.Moment = desde.clone();
                desde.hours(parseInt(horario.desde.split(":")[0])).minutes(parseInt(horario.desde.split(":")[1]));
                hasta.hours(parseInt(horario.hasta.split(":")[0])).minutes(parseInt(horario.hasta.split(":")[1]));
                rangosQuitar.push(new DateRange(desde, hasta));
            });
        });

        agenda.extraordinarios.map(dia => {
            //el medico puede especificar un array de horarios asi que debo iterar por cada uno
            dia.horarios.map(horario => {
                //desde es el dia
                let desde: moment.Moment = moment(dia.fecha);
                //y hasta tambien por eso lo clono
                let hasta: moment.Moment = desde.clone();
                desde.hours(parseInt(horario.desde.split(":")[0])).minutes(parseInt(horario.desde.split(":")[1]));
                hasta.hours(parseInt(horario.hasta.split(":")[0])).minutes(parseInt(horario.hasta.split(":")[1]));
                rangosExt.push(new DateRange(desde, hasta));
            });

        });
        //Debo añadir los dias de la semana que trabaja con su horario 
        agenda.dias.map(dia => {
            const diaDeLaSemana: IDiaSemanalVerificar = {
                numero: dia.numero,
                horarios: []
            }
            dia.horarios.map(horario => {
                const horarioElem = {
                    desde: (parseInt(horario.desde.split(":")[0]) * 100) + (parseInt(horario.desde.split(":")[1])),
                    hasta: (parseInt(horario.hasta.split(":")[0]) * 100) + (parseInt(horario.hasta.split(":")[1]))
                };
                diaDeLaSemana.horarios.push(horarioElem);
            });
            diasDeLaSemana.push(diaDeLaSemana);
        });

        Turno.find({ medicoId: agenda.medicoId, pacienteId: { $ne: null }, agendaId: agenda._id }, (err, turnos: Array<ITurno>) => {
            const turnosPorBorrarDebug: Array<string> = [];
            let contadorPorBorrar = 0;

            turnos.map((turno, index) => {
                console.log("Verificara el ", index, " turno");
                let porBorrar = true;
                let agendaPlanes: Array<string> = [];

                agenda.obrasSociales.map(obra => {
                    obra.planes.map(plan => {
                        agendaPlanes.push(plan._id);
                    });
                });
                let exists: boolean = false;
                if (turno.obraSocialSeleccionada) {
                     exists = agendaPlanes.includes(<string>turno.obraSocialSeleccionada.obraSocialId);
                }

                const turnoM = moment(turno.fecha);
                const numeroDeDia = parseInt(turnoM.format('d'));
                console.log("El numero de dia del turno es ", numeroDeDia);
                const horaMilitar = parseInt(turnoM.format('H')) * 100 + parseInt(turnoM.format('m'));
                console.log("Hora militar: ", horaMilitar);
                if (exists) {
                    //Primero verifico si el turno esta entre los dias y horarios normales semanales

                    diasDeLaSemana.map(diaDeLaSemana => {
                        console.log("El numero de dia a verificar es ", diaDeLaSemana.numero);
                        if (diaDeLaSemana.numero === numeroDeDia) {
                            console.log("El numero de dia coincide ");
                            diaDeLaSemana.horarios.map(horario => {
                                console.log("Hora desde: ", horario.desde);
                                console.log("Hora hasta: ", horario.hasta);
                                if (horaMilitar >= horario.desde && horaMilitar <= horario.hasta) {
                                    porBorrar = false;
                                    console.log("esta dentro del horario militar");
                                    //Me coincidio en numero de dia y esta dentro del rango horario
                                    //tengo que verificar que no este dentro del rango de exclusion
                                    rangosQuitar.map(rangoQuitar => {
                                        if (rangoQuitar.contains(turnoM)) {
                                            console.log("esta dentro del rango de exclusion");
                                            porBorrar = true;
                                        }
                                    });
                                    //Verifico si esta en el rango extraordinario

                                }
                            })
                        }
                        rangosExt.map(rangoExt => {
                            if (rangoExt.contains(turnoM)) {
                                porBorrar = false;
                                console.log("esta dentro de los dias extraordinarios");
                            }
                        });
                    });


                }

                if (porBorrar) {
                    contadorPorBorrar++;
                    turnosPorBorrarDebug.push(turnoM.format("DD/MM/YYYY HH:mm"));
                }

            });
            console.log("Por borrar ", contadorPorBorrar, " turnos: ", JSON.stringify(turnosPorBorrarDebug));
            callback(null, contadorPorBorrar);
        });



    }



    public static generarTurnos(agenda: IAgenda, callback: Function, fechaDesde: Date = new Date()): void {
        const laborableUtil = new Laborable();
        const turnosDebug: Array<IDebugTurnos> = [];

        /**
         * Genera los turnos basados en lo que el usuario cargo en la agenda
         */
        let ahora = moment(fechaDesde);
        let algunTiempoDesdeAhora = moment().add(1, 'y');
        //let algunTiempoDesdeAhora = moment().add(1, 'y');
        let rangoCalendario = new DateRange(ahora, algunTiempoDesdeAhora);
        let rangosExtraordinario: Array<{ fecha: Date, horario: DateRange }> = [];
        let rangosExcluir: { dias: Array<DateRange>, horarios: Array<DateRange> } = {
            dias: [],
            horarios: []
        };
        //debo excluir los rangos de dias a excluir que especifico el medico
        agenda.excluir.rango.map(periodo => {
            let desde: moment.Moment = moment(periodo.desde).hours(0).minutes(0).seconds(0);
            let hasta: moment.Moment = moment(periodo.hasta).hours(23).minutes(59).seconds(59);
            //genero el rango basado en dia desde y hasta y lo substraigo del rango calendario
            rangosExcluir.dias.push(new DateRange(desde, hasta));
        });
        //ahora debo excluir las horas particulares de los dias especificos que el medico desea excluir
        agenda.excluir.dias.map(dia => {
            //el medico puede especificar un array de horarios asi que debo iterar por cada uno
            dia.horarios.map(horario => {
                //desde es el dia
                let desde: moment.Moment = moment(dia.fecha);
                //y hasta tambien por eso lo clono
                let hasta: moment.Moment = desde.clone();
                desde.hours(parseInt(horario.desde.split(":")[0])).minutes(parseInt(horario.desde.split(":")[1]));
                hasta.hours(parseInt(horario.hasta.split(":")[0])).minutes(parseInt(horario.hasta.split(":")[1]));
                rangosExcluir.horarios.push(new DateRange(desde, hasta));
            });

        });

        agenda.extraordinarios.map(dia => {
            //el medico puede especificar un array de horarios asi que debo iterar por cada uno
            dia.horarios.map(horario => {
                //desde es el dia
                let desde: moment.Moment = moment(dia.fecha);
                //y hasta tambien por eso lo clono
                let hasta: moment.Moment = desde.clone();
                desde.hours(parseInt(horario.desde.split(":")[0])).minutes(parseInt(horario.desde.split(":")[1]));
                hasta.hours(parseInt(horario.hasta.split(":")[0])).minutes(parseInt(horario.hasta.split(":")[1]));
                rangosExtraordinario.push({ fecha: dia.fecha, horario: new DateRange(desde, hasta) });
            });

        });
        //duracion del turno en minutos
        const duracionTurno = agenda.duracionTurno;
        const dias = Array.from(rangoCalendario.by('days'));
        /**
           * Por cada dia debo verificar que
           * 1) El numero de dia de la semana
           *    sea igual a alguno de los numeros que estan en la agenda
           *    a) Si es igual entonces por cada rango horario genero el turno
           *    b) Si no es igual tengo que verificar que no sea un dia extraordinario
           */

        async.eachOf(dias, (diaActual, index, extcallback) => {
            let estaExcluido = false;
            rangosExcluir.dias.map(rango => {
                if (rango.contains(diaActual))
                    estaExcluido = true;
            })
            //representa el numero de dia de la semana
            let numeroDeDia = parseInt(diaActual.format('d'));
            let eseDiaTrabaja = agenda.dias.filter(dia => dia.numero === numeroDeDia).length > 0;
            let esFeriado = laborableUtil.esNoLaborable(diaActual);
            if (eseDiaTrabaja && !estaExcluido && !esFeriado) {
                let turnoDebug: IDebugTurnos = {
                    fecha: diaActual.format('DD/MM/YYYY'),
                    turnos: []
                };
                let horarios = agenda.dias.filter(dia => dia.numero === numeroDeDia)[0].horarios;
                console.log("Entrando a horarios ", horarios);
                async.eachOf(horarios, (horario, key, intcallback) => {

                    let desde = moment(diaActual)
                        //horario.desde = "20:50", usando split obtengo un array con ["20","50"]
                        .hours(parseInt(horario.desde.split(":")[0]))
                        .minutes(parseInt(horario.desde.split(":")[1]));
                    let hasta = moment(diaActual)
                        .hours(parseInt(horario.hasta.split(":")[0]))
                        .minutes(parseInt(horario.hasta.split(":")[1]));
                    let rangoHorario = new DateRange(desde, hasta);
                    //Creo los momentos basados en el rango horario, cada 15 minutos excluyendo el limite
                    const turnos = Array.from(rangoHorario.by('minutes',
                        { exclusive: true, step: duracionTurno }
                    ));
                    console.log("entrando en turnos ", turnos);
                    async.eachOf(turnos, (turno, key, int2callback) => {
                        let estaExcluido = false;
                        rangosExcluir.horarios.map(rango => {
                            if (rango.contains(turno))
                                estaExcluido = true;
                        });
                        if (!estaExcluido) {
                            let ultimoTurno = new Turno();
                            ultimoTurno.fecha = turno.toDate();
                            ultimoTurno.medicoId = agenda.medicoId;
                            ultimoTurno.agendaId = agenda._id;
                            ultimoTurno.obrasSociales = agenda.obrasSociales;
                            ultimoTurno.save((err, saved) => {
                                if (!err) {
                                    turnoDebug.turnos.push(turno.format("HH:mm"));
                                    int2callback();
                                }
                                else
                                    int2callback(err);
                            });
                        } else {
                            int2callback();
                        }
                    }, (err) => {

                        if (err) {
                            console.log("error en turnos ", err);
                            return intcallback(err);
                        }
                        turnosDebug.push(turnoDebug);
                        console.log("termino turnos ");
                        return intcallback();


                    });
                }, (err) => {
                    if (err) {
                        console.log("Error en horarios ", err);
                        return extcallback(err);
                    }
                    console.log("Termino horarios ");
                    return extcallback();
                });
            } else {
                return extcallback();
            }
        }, (err) => {
            if (err) {
                console.log("error en dias ", err);
                return callback(err, null);
            }
            console.log("termino dias");

            //return callback(null, { turnosDebug });
            console.log("dias extraordinarios datos ", JSON.stringify(rangosExtraordinario));
            async.eachOf(rangosExtraordinario, (diaExtraordinario, index, rangoExtCallback) => {
                console.log(index, " dia extraordinario");
                const turnos = Array.from(diaExtraordinario.horario.by('minutes',
                    { exclusive: true, step: duracionTurno }
                ));
                console.log("En ese horario entran ", turnos.length, " turnos");
                let turnoDebug: IDebugTurnos = {
                    fecha: moment(diaExtraordinario.fecha).format("DD/MM/YYYY"),
                    turnos: []
                }
                async.eachOf(turnos, (turno, index, turnoCallback) => {

                    let ultimoTurno = new Turno();
                    ultimoTurno.fecha = turno.toDate();
                    ultimoTurno.medicoId = agenda.medicoId;
                    ultimoTurno.agendaId = agenda._id;
                    ultimoTurno.obrasSociales = agenda.obrasSociales;
                    ultimoTurno.save((err, saved) => {
                        if (!err) {
                            turnoDebug.turnos.push(turno.format("HH:mm"));
                            console.log("se guardo el ", index, " turno");
                            turnoCallback();
                        }
                        else
                            turnoCallback(err);
                    });
                }, (err) => {
                    if (err) {
                        console.log("error en dias ", err);
                        return callback(err, null);
                    }
                    console.log("termino horarios ext");
                    turnosDebug.push(turnoDebug);
                    rangoExtCallback();
                    //return callback(null, { turnosDebug });
                })
            }, (err) => {
                if (err) {
                    console.log("error en dias ", err);
                    return callback(err, null);
                }
                console.log("termino dias ext");

                return callback(null, { turnosDebug });
            })
        });
    }


} 