const { BadRequestException } = require("../model/customException");

const {
    idRegex,
    pwRegex,
    emailRegex,
    nameRegex,
    whitespaceRegex,
    paramRegex,
    codeRegex
} = require("../constants");

/**
 * @typedef {{
 *  stringField?: string[],
 *  numberField?: string[]
 *  authField?: string[],
 *  codeField?: string[],
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

                if (!value) {
                    return next(new BadRequestException());
                }

                if (typeKey === "stringField") {
                    req[source][item] = value.replace(whitespaceRegex, ' ');
                }
                if (typeKey === "numberField") {
                    if (!paramRegex.test(value)) {
                        return next(new BadRequestException());
                    }

                    req[source][item] = parseInt(req[source][item]);
                }
                if (typeKey === "authField") {
                    const regexObj = {
                        "id": idRegex,
                        "pw": pwRegex,
                        "email": emailRegex,
                        "nickname": nameRegex
                    }

                    if (item in regexObj && !regexObj[item].test(value)) {
                        return next(new BadRequestException());
                    }
                }
                if (typeKey === "codeField") {
                    if (!codeRegex.test(value)) {
                        return next(new BadRequestException());
                    }
                }
            }
        }
        return next();
    }
}

module.exports = checkValidity;