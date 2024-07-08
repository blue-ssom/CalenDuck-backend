const router = require("express").Router();

const psql = require("../../database/connect/postgre");

const checkAuth = require("../middlewares/checkAuth");
const checkValidity = require("../middlewares/checkValidity");

const {
    NotFoundException
} = require("../model/customException");

const {
    getManyResults,
    getOneResult
} = require("../modules/sqlHandler");
const endRequestHandler = require("../modules/endRequestHandler");

// 관심사 목록 불러오기
router.get("/category", checkAuth("login"), endRequestHandler(async (req, res, next) => {
    const askCategoryList = await getManyResults(`
        SELECT idx, name
        FROM calenduck.ask_category
        WHERE is_deleted = false
        ORDER BY idx ASC
    `);

    if (askCategoryList.length === 0) {
        return res.sendStatus(204);
    }

    return res.status(200).send({
        list: askCategoryList
    });
}))

// 문의 추가
router.post("/", checkAuth("login"), checkValidity({ "stringField": ["title", "contents"], "numberField": ["categoryIdx"] }), endRequestHandler(async (req, res, next) => {
    const { categoryIdx, title, contents } = req.body;

    const askCategory = await getOneResult(`
        SELECT 1
        FROM calenduck.ask_category
        WHERE idx = $1
    `, [categoryIdx]);

    if (!askCategory) {
        return next(new NotFoundException());
    }

    await psql.query(`
        INSERT INTO calenduck.ask(user_idx, ask_category_idx, title, contents)
        VALUES($1, $2, $3, $4)
    `, [req.decoded.idx, categoryIdx, title, contents]);

    return res.sendStatus(201);
}))

module.exports = router;