const users = []

//addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    const user = { id, username, room}
    users.push(user)
    return {users}
}

const removeUser = (id) => {
    const index = users.findIndex( (user) => user.id === id)

    if (index !== -1) {
        //remove item in a array by its index, removing the quantity we choose, in this case 1.
        //the "[0]" is to retunr the object and in our case is the id, position 0 of our object.
        return users.splice(index,1)[0] 
    }


}

const getUser = (id) => {
    
    return users.find((user) => user.id === id)

}

const getUsersInRoom = (room) => {
    return users.filter((usersInRoom) => usersInRoom.room === room)
}

addUser( {
    id: 23,
    username: 'henrique',
    room: ' Taubate'
})

addUser({
        id: 24,
        username:'kelen',
        room: 'taubate'
})

addUser({
    id: 25,
    username:'felipe',
    room: 'Sao Paulo'
})


console.log('\nfind user')
const test = getUser(25)
console.log(test);

console.log('\n\nin the room test')
const tstUsersInRoom = getUsersInRoom ('taubate')
console.log(tstUsersInRoom);
console.log('\n');
