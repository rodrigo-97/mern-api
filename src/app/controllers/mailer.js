const nodemailer = require("nodemailer")
const hbs = require("nodemailer-express-handlebars")
const path = require("path")

const transport = nodemailer.createTransport({
	host: process.env.HOST,
	port: process.env.PORT,
	auth: {
		user: process.env.MT_USER,
		pass: process.env.MT_PASS
	}
})

transport.use("compile", hbs({
	viewEngine: {
		extName: ".html",
		partialsDir: path.resolve('./src/templates/emails'),
		defaultLayout: false,
	},
	viewPath: path.resolve("./src/templates/emails"),
	extName: ".html"
}))

const sendResetPasswordEmail = (email, token) => {
	try {
		transport.sendMail({
			to: email,
			subject: "EMAIL PARA RECUPERAÇÃO DE SENHA",
			from: "@admin",
			template: "password",
			context: { token }
		})

		return true
	} catch (err) {
		console.log(err)
		return false
	}
}

module.exports = {
	sendResetPasswordEmail
}