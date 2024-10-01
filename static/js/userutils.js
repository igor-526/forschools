function getUsersString(users = []){
    let usersHTML = []
    users.forEach(user => {
        usersHTML.push(`<a target="_blank" href="/profile/${user.id}">${user.first_name} ${user.last_name}</a>`)
    })
    return usersHTML.join("<br>")
}