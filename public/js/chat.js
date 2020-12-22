const socket = io()


//elements variables for enable/disable manipulations on the html

//message handling
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

//sending location handling
const $sendLocationBtn = document.querySelector('#send-location')

//Message template element
//!!we use $ to store elements!! it is a convension
const $messages = document.querySelector('#messages')


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-templete').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

//autoscroll implementation
const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessagStyle = getComputedStyle($newMessage) // getComputedStyle is made available by the browser
    const newMessageMargin = parseInt(newMessagStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin // this gets height but not the height of margins, hence needed getComputedStyle


    //visible height - the height of visible window on the open browser
    const visibleHeight = $messages.offsetHeight

    //height of messages container - the height of the whole content. The whole window containing the messages, the total height we are able to scroll through
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled? the distance from the top we have scrolled down
    const scrollOffset = $messages.scrollTop + visibleHeight

    //conditional to auto scroll or not
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

    console.log(newMessageMargin);
    console.log(newMessageHeight);
}

socket.on('message',(msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('kk:mm:ss')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage',(msg) =>{
    console.log(msg)
    const html = Mustache.render(locationTemplate, {
        username: msg.username,
        url: msg.url,
        createdAt: moment(msg.createdAt).format('kk:mm:ss')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData',({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
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

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

// socket.on('countUpdated',(count) => {// this is received from index.js "socket.emit('countUpdated',count)"
//                                      // the value count, could be anything... it is count because makes sense to be
//     console.log('The count has been updated',count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')
//     socket.emit('increment')
// })