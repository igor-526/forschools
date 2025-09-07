const usersToString = (users) => {
    return users.map((user) => {return `${user.first_name} ${user.last_name}`}).join(", ")
}

export default usersToString