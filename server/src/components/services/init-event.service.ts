import { Injectable } from '@nestjs/common';
import * as moment from "moment/moment"
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
   * @param splitEvents
   * @param newAvailabilityDate
   * @param eventDateStart
   * @param eventDateEnd
   * @param availabilityStart
   * @param availabilityEnd
   */
  iniEvents(dates,
            splitEvents,
            newAvailabilityDate,
            eventDateStart,
            eventDateEnd,
            availabilityStart,
            availabilityEnd) {

    const DURATION = 15; //TODO check in all case.

    let eventStartMinute = eventDateStart.getMinutes();
    let eventEndMinute = eventDateEnd.getMinutes();
    let eventStartHour = eventDateStart.getHours();
    let eventEndHour = eventDateEnd.getHours();

    let newAvailabilityEndDate = moment(eventDateStart).set({
      hour: eventStartHour,
      minute: eventStartMinute
    }).toDate();

    if (newAvailabilityEndDate > availabilityEnd) {
        newAvailabilityEndDate = availabilityEnd;
    }

    if (splitEvents.length > 0) {
      let dateIndex = splitEvents.length - 1;
      let lastSplitEvent = splitEvents[dateIndex];
      let lastEventStart = lastSplitEvent.start;
      let lastEventEnd = lastSplitEvent.end;

      let lastEventStartHour = lastEventStart.getHours();
      let lastEventEndHour = lastEventEnd.getHours();

      let lastEventStartMinute = lastEventStart.getMinutes();
      let lastEventEndMinute = lastEventEnd.getMinutes();

      if (eventStartHour >= lastEventStartHour && eventEndHour <= lastEventEndHour) {//TODO chi mtnum dranica

        if (eventStartHour == lastEventStartHour) {
          // when event start is equal
          if (eventStartMinute == lastEventStartMinute) {

            newAvailabilityDate.push({
              start: eventDateEnd,
              end: lastEventEnd,
            });

            dates.splice(-1);
          }
          // when event start is OUT aval. start
          else if (eventStartMinute < lastEventStartMinute) {
            newAvailabilityDate.push({
              start: eventDateEnd,
              end: lastEventEnd,
            });

            dates.splice(-1);
          }
          // when event start is IN aval. start
          else {
            let diffMin = dateDiff(lastEventStart, eventDateStart);

            if (diffMin >= DURATION) {
              newAvailabilityDate.push({
                start: lastEventStart,
                end: eventDateStart,
              });
            }

            newAvailabilityDate.push({
              start: eventDateEnd,
              end: lastEventEnd,
            });

            dates.splice(-1); //delete split event
          }
        }
        else if (eventEndHour == lastEventEndHour) {
          //when event end is equal with aval. end
          if (eventEndMinute == lastEventEndMinute) {
            newAvailabilityDate.push({
              start: lastEventStart,
              end: eventDateStart,
            });

          }
          //when event end is out from aval.
          else if (eventEndMinute > lastEventEndMinute) {
            let diffMin = eventEndMinute - lastEventEndMinute;

            if (diffMin >= DURATION) {
              newAvailabilityDate.push({
                start: lastEventStart,
                end: eventDateStart,
              });

              dates.splice(-1);
            }
          }
          //when event end is IN aval. end
          else {

            newAvailabilityDate.push({
              start: lastEventStart,
              end: eventDateStart,
            });

            let diffMin = dateDiff(lastEventEnd, eventDateEnd);

            if (diffMin >= DURATION) {
              newAvailabilityDate.push({
                start: eventDateEnd,
                end: lastEventEnd,
              });
            }

            dates.splice(-1);
          }
        }
        else {
          let diffMin = dateDiff(lastEventStart, eventDateStart);
          let avalDiffMinute = dateDiff(eventDateEnd, lastEventEnd);

          if (diffMin >= DURATION) {
            newAvailabilityDate.push({
              start: lastEventStart,
              end: eventDateStart,
            });
          }

          if (avalDiffMinute >= DURATION) {
            newAvailabilityDate.push({
              start: eventDateEnd,
              end: lastEventEnd,
            });
          }

          dates.splice(-1);
        }
      }
      else if (eventStartHour <= lastEventEndHour && eventEndHour > lastEventEndHour) {

        if (eventStartHour == lastEventEndHour) {
          let difMinute = lastEventEndMinute - eventStartMinute;

          if (difMinute >= DURATION) {
            newAvailabilityDate.push({
              start: lastEventStart,
              end: eventDateStart,
            });
            dates.splice(-1);

          }
        } else {
          newAvailabilityDate.push({
            start: lastEventStart,
            end: eventDateStart,
          });

          dates.splice(-1);
        }
      }
      else if (eventStartHour < lastEventStartHour && eventEndHour >= lastEventStartHour) {

        if (eventEndHour == lastEventStartHour) {
          let difMinute = eventEndMinute - lastEventStartMinute;

          if (difMinute >= DURATION) {
            newAvailabilityDate.push({
              start: eventDateEnd,
              end: lastEventEnd,
            });

            dates.splice(-1);
          }

        } else {
          newAvailabilityDate.push({
            start: eventDateEnd,
            end: lastEventEnd,
          });

          dates.splice(-1);
        }
      }
    }
    else {

      if (availabilityStart <= newAvailabilityEndDate) {
        newAvailabilityDate.push({
          start: availabilityStart,
          end: newAvailabilityEndDate,
        });
      }

      if (eventDateEnd <= availabilityEnd) {
        newAvailabilityDate.push({
          start: eventDateEnd,
          end: availabilityEnd,
        });
      }
    }

    if (newAvailabilityDate.length > 0) {
      splitEvents.push(...newAvailabilityDate);
      dates.push(...newAvailabilityDate);
    }

    return {dates, newAvailabilityDate}
  }
}
