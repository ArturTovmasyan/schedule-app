import * as moment from "moment/moment";

export default class DateConverter {
  static convertUTCDateToLocalDate(date:any) {
    let newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
    let offset = date.getTimezoneOffset() / 60;
    let hours = date.getHours();

    newDate.setHours(hours - offset);
    return moment(newDate).format('yyyy-MM-DDThh:mm:ss')
  }
}
