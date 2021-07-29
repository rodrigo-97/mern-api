const routes = require("express").Router()
const auth = require("./auth")
const authTest = require("./authTest")

routes.use([
	auth,
	authTest,
])

module.exports = routes