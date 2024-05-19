import * as moment from "moment/moment";

export default class DateConverter {
  static convertUTCDateToLocalDate(dateString:any) {
    let date = moment(dateString).utc().format('yyyy-MM-DDThh:mm:ss');
    let stillUtc = moment.utc(date).toDate();
    return moment(stillUtc).local().format('yyyy-MM-DDThh:mm:ss');
  }
}

