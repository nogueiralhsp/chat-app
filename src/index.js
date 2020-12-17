// Source Code: lib/path.js
// The path module provides utilities for working with file and directory paths. It can be accessed using:
const path = require('path')
const chalk = require('chalk')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generatedMessage, generatedLocationMessage} = require('./utils/messages')

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
//socket.broadcast.emit() => sends to everyone but the user just connected
//io.emit() => sends to everyone connected


io.on('connection',(socket) => {//name of event and funtion to run, watches for every new connection
                                // socket is an object and contains information about the new connection
                                // if there is 5 connections, this code runs 5 times

     console.log('there is a new WebSocket connection')

     socket.emit('message',generatedMessage('New user! Welcome to Nogueira Bate-Papo  New User')) //send welcome messaging
     socket.broadcast.emit('message', generatedMessage('A new User just connected in the room!')) //notify other users that a new user is in

     socket.on('sendMessage', (messageFromClient, callback) => {
          const filter = new Filter ()

          if (filter.isProfane(messageFromClient)){
               return callback('Profanity is not allowed')
          }
          io.emit('message',generatedMessage(messageFromClient))
          callback()
     })

     socket.on('sendLocation', (coords, callback) => {
          io.emit('locationMessage',generatedLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
          callback()
     })

     socket.on('disconnect', () =>{
          io.emit('message',generatedMessage('A user has diconnected the room!'))
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

console.log(chalk.yellow(` >> Server is up on localhost:${port} <<`))

})