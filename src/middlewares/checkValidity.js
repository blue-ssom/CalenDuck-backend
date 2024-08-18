const { BadRequestException } = require("../model/customException");

const {
    ID_REGEX,
    PW_REGEX,
    EMAIL_REGEX,
    NICKNAME_REGEX,
    WHITESPACE_REGEX,
    PARAM_REGEX,
    CODE_REGEX,
    DATE_REGEX,
    DATE_TIME_REGEX,
    YEAR_MONTH_REGEX,
    MAX_LENGTH_50_REGEX,
    MAX_LENGTH_100_REGEX,
    MAX_LENGTH_300_REGEX
} = require("../constants");

/**
 * @typedef {{
 *  stringField?: string[],
 *  numberField?: string[]
 *  authField?: string[],
 *  codeField?: string[],
 *  dateField?: string[]
 * }} ValidityOption
 */

/**
 * Processes the data object.
 * 
 * @param {ValidityOption} data
 * @example checkValidity({ "stringField": ["interestName"] }); // 개행 처리
 * @example checkValidity({ "numberField": ["idx"] }); // 정수 정규식 처리
 * @example checkValidity({ "authField": ["id", "pw"] }); // 인증 정규식 처리
 * @example checkValidity({ "codeField": ["code"] }); // 6자리 인증코드
 * @returns {import('express').RequestHandler}
 */

const checkValidity = (data) => {
    return (req, res, next) => {
        for (typeKey in data) {
            for (const item of data[typeKey]) {
                let source;
                const value = req.body[item] ? (source = "body", req.body[item]) :
                    req.params[item] ? (source = "params", req.params[item]) :
                        req.query[item] ? (source = "query", req.query[item]) :
                            null;

                const stringFieldArray = [MAX_LENGTH_50_REGEX.source, MAX_LENGTH_100_REGEX.source, MAX_LENGTH_300_REGEX.source];

                const regexParts = typeKey.match(/\/(.*?)\/([gimy]*)$/);
                const regex = new RegExp(regexParts[1], regexParts[2]);

                // 값이 없으면, 에러처리
                if (!value) {
                    return next(new BadRequestException());
                }

                if (!regex.test(value)) {
                    return next(new BadRequestException());
                }

                if (regex.source === PARAM_REGEX.source) {
                    req[source][item] = parseInt(req[source][item]);
                } else if (stringFieldArray.includes(regex.source)) {
                    req[source][item] = value.replace(WHITESPACE_REGEX, ' ');
                }

            }
        }
        return next();
    }
}

module.exports = checkValidity;