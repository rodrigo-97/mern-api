const router = require("express").Router()
const auth = require("../../middlewares")

router.use(auth)
router.get('/', async (req, res) => {
	return res.send({ ok: "ok" })
})

module.exports = router