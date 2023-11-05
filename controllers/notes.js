const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/users')
const jwt = require('jsonwebtoken')


notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({})
  .populate('user', {username: 1, name: 1})
  response.json(notes)
})

notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
})

const getTokenFrom = (request) => {
  const autho = request.get('authorization')
  if(autho && autho.startsWith("Bearer ")){
    return ( autho.replace("Bearer ", "") )
  }
  return null
}
notesRouter.post('/', async (request, response) => {
  const body = request.body
  const decodedToken = await jwt.verify(getTokenFrom(request), process.env.SECRET)
  if(!decodedToken.id){
    response.status(400).json({error: "invalid Token"})
  }

  const  user = await User.findById(decodedToken.id)



  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: user._id
  })

  const savedNote = await note.save()
  console.log(savedNote)
  user.notes = await user.notes.concat(savedNote._id)
  await user.save()
  response.status(201).json(savedNote)
})

notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

notesRouter.put('/:id', async (request, response) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  const updatedNote = await Note.findByIdAndUpdate(request.params.id, note, { new: true })
  response.json(updatedNote)
})

module.exports = notesRouter