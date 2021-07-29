const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const { User } = require("../models/index")
const JWT_HASH = process.env.JWT_HASH
const mailer = require("./mailer")

const generateToken = (params = {}) => {
	const token = jwt.sign({ id: params }, JWT_HASH, { expiresIn: "1d" })

	return token
}

const verifyUser = async (email) => {
	const user = await User.findOne({ email })

	if (!user) {
		return false
	}
	return true
}

router.post('/register', async (req, res) => {
	const { data } = req.body
	const { email } = data

	try {
		if (await User.findOne({ email })) {
			return res.status(400).send({ erro: "Usuário existente" })
		}

		const user = await User.create(data)
		user.password = undefined

		res.
			status(201)
			.setHeader("X-Authentication", generateToken(hasUser.id))
			.send({ user })
	} catch (err) {
		console.log(err)
		res.status(400).send({
			erro: "Não foi possível salvar o usuário"
		})
	}
})

router.post('/login', async (req, res) => {
	const { email, password } = req.body
	const hasUser = await User.findOne({ email }).select('+password')

	if (!verifyUser(email)) {
		return res.status(400).send({ erro: "Usuário não encontrado" })
	}

	if (!await bcrypt.compare(password, hasUser.password)) {
		return res.status(400).send({ erro: "Senha inválida" })
	}

	hasUser.password = undefined


	res.setHeader("X-Authentication", generateToken(hasUser.id)).send({ hasUser })
})

router.post('/forgot_password', async (req, res) => {
	const { email } = req.body

	try {
		const user = await User.findOne({ email })

		if (!await verifyUser(email)) {
			return res.status(400).send({ erro: "Usuário não encontrado" })
		}

		const token = crypto.randomBytes(20).toString('hex')

		const now = new Date()
		now.setHours(now.getHours() + 1)

		await User.findByIdAndUpdate(user.id, {
			"$set": {
				passwordToken: token,
				passwordTokenExpires: now
			}
		})

		if (!mailer.sendResetPasswordEmail(email, token)) {
			res.status(400).send({ erro: "Não foi possível enviar e-mail para alterar a senha " })
		}

		res.send()
	} catch (err) {
		console.log(err)
		res.status(400).send({ erro: "Não foi possível enviar o e-mail" })
	}
})

router.post('/reset_password', async (req, res) => {
	const { email, newPassword, token } = req.body

	try {
		const user = await User.findOne({ email })
			.select("+password +passwordTokenExpires")

		if (!await verifyUser(email)) {
			res.status(400).send({ erro: "Não foi possível localizar o usuário" })
		}

		if (!token === user.token) {
			res.status(400).send({ erro: "Token inválido" })
		}

		const now = new Date()
		if (now > user.passwordTokenExpires) {
			res.status(400).send({ erro: "Token expirado" })
		}

		user.password = newPassword
		await user.save()
		res.send()
	} catch (err) {
		console.log(err)
		res.status(400).send({ erro: "Não foi possível alterar a senha, tente novamente" })
	}
})

module.exports = router