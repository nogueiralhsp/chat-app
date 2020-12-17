const socket = io()


//elements variables for enable/disable manipulations on the html

//message handling
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

//sending location handling
const $sendLocationBtn = document.querySelector('#send-location')

//Message template element
const $messages = document.querySelector('#messages')


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML

socket.on('message',(message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('kk:mm:ss')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage',(msg) =>{
    console.log(msg)
    const html = Mustache.render(locationTemplate, {
        url: msg.url,
        createdAt: moment(msg.createdAt).format('kk:mm:ss')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    //desabling button while the message is been sent, avoiding double messages
    $messageFormButton.setAttribute('disabled','desabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage',message, (error) => {
 
        //enable button after the message is sent
        $messageFormButton.removeAttribute('disabled')

        //cleaning up input after message sent
        $messageFormInput.value=''

        //moves the cursor inside input box
        $messageFormInput.focus() 

        if(error){
            return console.log(error)
        }

        console.log('Message Delivered')


    }) 

    
})

$sendLocationBtn.addEventListener('click', (e) =>{
    e.preventDefault()
    
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    //desabling button while the message is been sent, avoiding double messages
    $sendLocationBtn.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition( (position) => {
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) =>{

            if(error){
                return console.log(error)
            }

            console.log('Location shared!')

            //enable button after the location is sent   
            $sendLocationBtn.removeAttribute('disabled')
        })
    })

})

// socket.on('countUpdated',(count) => {// this is received from index.js "socket.emit('countUpdated',count)"
//                                      // the value count, could be anything... it is count because makes sense to be
//     console.log('The count has been updated',count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')
//     socket.emit('increment')
// })