// Source Code: lib/path.js
// The path module provides utilities for working with file and directory paths. It can be accessed using:
const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generatedMessage, generatedLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

//setting express
const app = express()
const port = process.env.PORT || 3000
const server = http.createServer(app)

//starting socket io
const io = socketio(server)

//Define paths for express config
// __dirname is the path where the index.js lives in!!!
const publicDirectoryPath = path.join(__dirname,'../public')

//Setup static directory to server
app.use(express.static(publicDirectoryPath))


//server (emit) -> cliente (received) - countUpdated
//client (emit) -> server (receive = increm)
//socket.emit() => sends to the user just connected
//socket.broadcast.emit() => sends to everyone but the user just connected (emiting the event)
//io.emit() => sends to everyone connected
//io.to.emit => emit for everyone in a specific room
//socket.broadcast.to.emit => emits to everyone but the user emiting the message


io.on('connection',(socket) => {//name of event and funtion to run, watches for every new connection
                                // socket is an object and contains information about the new connection
                                // if there is 5 connections, this code runs 5 times

     console.log('there is a new WebSocket connection')

     // socket.on('join', ({username, room}, callback) => {
     socket.on('join', (optons, callback) => {     
          const { error, user } = addUser({ id: socket.id, ...optons})//...options is a spread operator
          if (error) {
               return callback(error)
          }
          socket.join(user.room)

          socket.emit('message',generatedMessage('Admin', `${user.username}! Welcome to Nogueira Bate-Papo`)) //send welcome messaging
          socket.broadcast.to(user.room).emit('message', generatedMessage('Admin', `${user.username} has joined!`)) //notify other users that a new user is in
          io.to(user.room).emit('roomData',{
               room: user.room,
               users: getUsersInRoom(user.room)
          }) 
          
          callback()

          
     })

     socket.on('sendMessage', (messageFromClient, callback) => {
         const user = getUser(socket.id)
          const filter = new Filter ()
          if (filter.isProfane(messageFromClient)){
               return callback('Profanity is not allowed')
          }

          io.to(user.room).emit('message', generatedMessage(user.username, messageFromClient))
          callback()
     })

     socket.on('sendLocation', (coords, callback) => {
          const user = getUser(socket.id)
          console.log(user);
          io.to(user.room).emit('locationMessage', generatedLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
          callback()
     })

     socket.on('disconnect', () =>{
          const user = removeUser(socket.id)

          if (user) {
               io.to(user.room).emit('message',generatedMessage('Admin', `${user.username} left the rooom`))
               io.to(user.room).emit('roomData',{
                    room: user.room,
                    users: getUsersInRoom(user.room)
               }) 
          }

     })
     // socket.emit('countUpdated',count)  // the value count, could be anything... it is count because makes sense to be
     //                                    // ".emit" sends info to the other side, either Server or Client

     // socket.on('increment', () =>{ // ".on" listen ".emit" events from the other side, either Server or Client
          
     //      count++

     //      // socket.emit('countUpdated', count) //this line emits the data to a singular connection
     //      io.emit('countUpdated', count) //this io.emit emits data to all connections available
          
     // }) 

}) 


server.listen(port, () => { //localhost:3000

console.log(` >> Server is up on localhost:${port} <<`)

})