const router = require("express").Router();

const checkAuth = require("../middlewares/checkAuth");

const {
    getManyResults
} = require("../modules/sqlHandler");
const endRequestHandler = require("../modules/endRequestHandler");

// 관심사 목록 불러오기
router.get("/all", checkAuth("login"), endRequestHandler(async (req, res, next) => {
    const interestList = await getManyResults(`
        SELECT idx, interest
        FROM calenduck.interest
        ORDER BY idx ASC
    `);

    if (interestList.length === 0) {
        return res.sendStatus(204);
    }

    return res.status(200).send({
        list: interestList
    });
}))

//내 관심사 불러오기
router.get("/", checkAuth("login"), endRequestHandler(async (req, res, next) => {
    const loginUser = req.decoded;

    const interestList = await getManyResults(`
      SELECT CI.interest AS interestIdx, CI.idx AS interestName FROM calenduck.user_interest CUI
      JOIN calenduck.interest CI
      ON CUI.interest_idx = CI.idx
      WHERE CUI.user_idx = $1
      ORDER BY interest ASC
    `, [loginUser.idx]);

    if (!interestList || interestList.length === 0) return res.sendStatus(204);

    return res.status(200).send({
      list: interestList,
    });
  })
);

//관심사 추가
router.post("/:idx", checkAuth("login"), checkValidity({"numberField": ["idx"]}), endRequestHandler(async (req, res, next) => {
    const { idx: interestIdx = null } = req.params;
    const loginUser = req.decoded;

    await psql.query(`
      INSERT INTO calenduck.user_interest(user_idx, interest_idx) 
      VALUES($1, $2)
    `, [loginUser.idx, interestIdx]);

    return res.sendStatus(201);
  })
);

//내 관심사 삭제
router.delete("/:idx", checkAuth("login"), checkValidity({"numberField": ["idx"]}), endRequestHandler(async (req, res, next) => {
    const { idx: interestIdx = null } = req.params;
    const loginUser = req.decoded;

    await psql.query(`
      DELETE FROM calenduck.user_interest 
      WHERE user_idx = $1 AND interest_idx= $2
    `, [loginUser.idx, interestIdx]);

    return res.sendStatus(201);
  })
);

module.exports = router;