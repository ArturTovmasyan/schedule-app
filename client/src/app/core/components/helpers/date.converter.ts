import * as moment from "moment/moment";

export default class DateConverter {
  static convertUTCDateToLocalDate(date:any) {
    let newDate = moment(date.getTime()+date.getTimezoneOffset()*60*1000);
    let offset = date.getTimezoneOffset() / 60;
    let hours = date.getHours();

    newDate.set({hour: hours - offset});
    return newDate.toDate();
  }
}

