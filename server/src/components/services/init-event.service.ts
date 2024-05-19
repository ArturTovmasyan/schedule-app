import { Injectable } from '@nestjs/common';
import * as moment from "moment/moment";
import {dateDiff} from "../helpers/utils";


@Injectable()
export class InitEventService {
  constructor() {  }

  /**
   * @description For uploading files to aws s3 bucket,
   *
   *
   * @returns returns url
   * @param dates
   * @param splitedEvents
   * @param newAvailabilityDate
   * @param eventDateStart
   * @param eventDateEnd
   * @param avalDateStart
   * @param avalDateEnd
   */
  iniEvents(dates,
            splitedEvents,
            newAvailabilityDate,
            eventDateStart,
            eventDateEnd,
            avalDateStart,
            avalDateEnd) {

    let notEventSplit = true;
    let eventStartMinute = eventDateStart.getMinutes();
    let eventEndMinute = eventDateEnd.getMinutes();
    let eventStartHour = eventDateStart.getHours();
    let eventEndHour = eventDateEnd.getHours();

    let newAvalEndDate = moment(eventDateStart).set({
      hour: eventStartHour,
      minute: eventStartMinute
    }).toDate();

    if (newAvalEndDate > avalDateEnd) {
        newAvalEndDate = avalDateEnd;
    }

    if (splitedEvents.length > 0) {
      let dateIndex = splitedEvents.length - 1;
      let lastAvalEvent = splitedEvents[dateIndex];
      let lastAvalStart = lastAvalEvent.start;
      let lastAvalEnd = lastAvalEvent.end;

      if (eventStartHour >= lastAvalStart.getHours() && eventEndHour <= lastAvalEnd.getHours()) {
        if (eventStartHour == lastAvalStart.getHours()) {
          // when event start is equal
          if (eventStartMinute == lastAvalStart.getMinutes()) {

            newAvailabilityDate.push({
              start: eventDateEnd,
              end: lastAvalEnd,
            });

            dates.splice(-1);
          }
          // when event start is OUT aval. start
          else if (eventStartMinute < lastAvalStart.getMinutes()) {
            newAvailabilityDate.push({
              start: eventDateEnd,
              end: lastAvalEnd,
            });

            dates.splice(-1);
          }
          // when event start is IN aval. start
          else {
            let diffMin = dateDiff(lastAvalStart, eventDateStart);

            if (diffMin >= 15) {
              newAvailabilityDate.push({
                start: lastAvalStart,
                end: eventDateStart,
              });
            }

            newAvailabilityDate.push({
              start: eventDateEnd,
              end: lastAvalEnd,
            });

            dates.splice(-1); //delete split event
          }
        }
        else if (eventEndHour == lastAvalEnd.getHours()) {
          //when event end is equal with aval. end
          if (eventEndMinute == lastAvalEnd.getMinutes()) {
            newAvailabilityDate.push({
              start: lastAvalStart,
              end: eventDateStart,
            });

          }
          //when event end is out from aval.
          else if (eventEndMinute > lastAvalEnd.getMinutes()) {

            newAvailabilityDate.push({
              start: lastAvalStart,
              end: eventDateStart,
            });

            dates.splice(-1); //delete split event

          }
          //when event end is IN aval. end
          else {

            newAvailabilityDate.push({
              start: lastAvalStart,
              end: eventDateStart,
            });

            let diffMin = dateDiff(lastAvalEnd, eventDateEnd);

            if (diffMin >= 15) {
              newAvailabilityDate.push({
                start: eventDateEnd,
                end: lastAvalEnd,
              });
            }

            dates.splice(-1); //delete split event
          }
        }
        else {

          let diffMin = dateDiff(lastAvalStart, eventDateStart);
          let avalDiffMinute = dateDiff(eventDateEnd, lastAvalEnd);

          if (diffMin >= 15) {
            newAvailabilityDate.push({
              start: lastAvalStart,
              end: eventDateStart,
            });
          }

          if (avalDiffMinute >= 15) {
            newAvailabilityDate.push({
              start: eventDateEnd,
              end: lastAvalEnd,
            });
          }

          dates.splice(-1);
        }
      }
    }
    else {

      debugger;
      if (avalDateStart <= newAvalEndDate) {//TODO fix this part
        newAvailabilityDate.push({
          start: avalDateStart,
          end: newAvalEndDate,
        });
      }

      if (eventDateEnd <= avalDateEnd) {
        newAvailabilityDate.push({
          start: eventDateEnd,
          end: avalDateEnd,
        });
      }
    }

    if (newAvailabilityDate.length > 0) {
      splitedEvents.push(...newAvailabilityDate);
      dates.push(...newAvailabilityDate);
      notEventSplit = false;
    }

    return {dates, newAvailabilityDate, notEventSplit}
  }
}
