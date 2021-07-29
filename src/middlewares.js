const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
	const JWT_HASH = process.env.JWT_HASH
	const authHeader = req.headers["x-authorization"]
	const parts = authHeader.split(" ")

	try {
		if (!authHeader) {
			return res.status(401).send({ Erro: "Token não informado" })
		}

		if (parts.length !== 2) {
			return res.status(401).send({ Erro: "Token inválido" })
		}

		const [scheme, token] = parts

		if (!scheme.match("Bearer")) {
			return res.status(401).send({ Erro: "Erro no formato do token" })
		}

		jwt.verify(token, JWT_HASH, (error, decoded) => {
			if (error) {
				return res.status(401).send({ Erro: "Token inválido" })
			}

			req.userId = decoded.id
			return next()
		})
	} catch (error) {
		console.log(error)
	}
}