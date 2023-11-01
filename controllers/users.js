const userRouter = require('express').Router()
const User = require('../models/users')
const bcrypt = require('bcrypt')

userRouter.get('/', async (resquest, response) => {
    const users = await User.find({})
    .populate('notes', {content: 1, important: 1})
    response.json(users)
})

userRouter.post('/', async (request, response) => {
    const body = request.body
    const saltHash = 10
    const passwordHash = await bcrypt.hash(body.password, saltHash)
    const newUser = new User({
        username: body.username,
        name: body.name,
        passwordHash: passwordHash
    })
    const savedUser  = await newUser.save()
    response.status(201).json(savedUser)
})


module.exports = userRouter