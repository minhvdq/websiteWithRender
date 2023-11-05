const loginRouter = require('express').Router()
const User = require('../models/users')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

loginRouter.post('/', async (request, response) => {
    const body = request.body
    const user  = await User.findOne({username: body.username})
    const passwordCorrect = user === null ? false : await bcrypt.compare(body.password, user.passwordHash)

    if(!( user && passwordCorrect )){
        response.status(401).json({
            erorr: "invalid username or password"
        })
    }

    const userForToken = {
        username: user.username,
        id: user._id
    }

    const token = await jwt.sign(userForToken, process.env.SECRET, {expiresIn: 60*60})

    response.status(200).json({token: token, username: user.username, name: user.name})

})

module.exports = loginRouter