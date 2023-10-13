/*
//using Mongo
const mongoose = require('mongoose')

const password = "minhvdq3008"
const url =
  `mongodb+srv://fullstack:${password}@cluster0.vzqds2z.mongodb.net/noteApp?retryWrites=true&w=majority`

mongoose.set('toJSON',{
  transform: (doc, ret) => {
    ret.id = ret._id.toString
    console.log(typeof(ret._id))
    console.log(ret._id)
    delete ret._id
    delete ret.__v;
  }
})
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

Note.find({}).then(notes => {
   notes.map(note => console.log(`${note.name}`))
})
*/

//using Dotenv
require('dotenv').config()

//Importing the note module
const Note = require('./models/note')

const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.static('dist'))

app.use(express.json())

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(requestLogger)

app.get('/api/notes', (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes)
  })
})

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false
  })
  note.save().then(savedNote => {
      response.json(savedNote)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id).then(note => {
    if(note){
      response.json(note)
    }
    else{
      response.status(400).end()
    }
  }).catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response) => {
  Note.findByIdAndRemove(request.params.id)
  .then(result => {
    response.status(204).end()
  })
})

app.put('/api/notes/:id', (request, response, next) => {
  const bod = request.body
  const note = {
    content: bod.content,
    important: bod.important
  }
  
  Note.findByIdAndUpdate(request.params.id, note, {new: true}).then(
    updatedNote => response.json(updatedNote)
  ).catch(error => next(error))
})

const errorHandler = (err, req, res, next) => {
  console.log(err.messsage)

  if(err.name === 'CastError'){
    return res.status(400).send({ error: 'malformatted id '})
  }
  next(error)
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})