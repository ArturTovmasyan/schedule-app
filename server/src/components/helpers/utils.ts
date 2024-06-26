import {getConnectionOptions, getConnection} from 'typeorm';
import * as bcrypt from 'bcrypt';
import {ErrorMessages} from "../constants/error.messages";
import * as moment from "moment/moment";

export const getDbConnectionOptions = async (connectionName = 'default') => {
    const options = await getConnectionOptions(
        process.env.NODE_ENV || 'development',
    );
    return {
        ...options,
        name: connectionName,
    };
};

export const getDbConnection = async (connectionName = 'default') => {
    return getConnection(connectionName);
};

export const runDbMigrations = async (connectionName = 'default') => {
    const conn = await getDbConnection(connectionName);
    await conn.runMigrations();
};

export const toPromise = <T>(data: T): Promise<T> => {
    return new Promise<T>((resolve) => {
        resolve(data);
    });
};

export const comparePasswords = async (userPassword, currentPassword) => {
    return await bcrypt.compare(currentPassword, userPassword);
};

export const generatePassword = (passwordLength) => {
    let numberChars = "0123456789";
    let upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let lowerChars = "abcdefghijklmnopqrstuvwxyz";
    let allChars = numberChars + upperChars + lowerChars;
    let randPasswordArray = Array(passwordLength);

    randPasswordArray[0] = numberChars;
    randPasswordArray[1] = upperChars;
    randPasswordArray[2] = lowerChars;

    randPasswordArray = randPasswordArray.fill(allChars, 3);
    return shuffleArray(randPasswordArray.map(function (x) {
        return x[Math.floor(Math.random() * x.length)]
    })).join('');
}

export const validateImageFile = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error(ErrorMessages.imageTypeError), false);
    }
    callback(null, true);
};

export const dateDiff = (start, end, diffBy: string = 'minute') => {
    let diff = 0;
    let duration = moment.duration(moment(end).diff(start));

    if (diffBy == 'minute') {
        diff = duration.asMinutes();
    } else if (diffBy == 'hour') {
        diff = duration.asHours();
    }

    return diff;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

