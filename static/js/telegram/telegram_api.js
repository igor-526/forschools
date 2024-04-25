async function telegramAPIGetUser(userID){
    const request = await fetch(`/api/v1/users/${userID}/telegram/`)
    return await APIGetToObject(request)
}

async function telegramAPIDisconnect(userID){
    const request = await fetch(`/api/v1/users/${userID}/telegram/`, {
        method: 'delete',
        credentials: 'same-origin',
        headers: {
            "X-CSRFToken": csrftoken,
        }
    })
    return APIDeleteToObject(request)
}