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

async function telegramAPIGetUsers(){
    const request = await fetch('/api/v1/telegram/all/')
    return APIGetToObject(request)
}

async function telegramAPISendMaterials(users, materials){
    const request = await fetch("/api/v1/telegram/sendmaterial/", {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            users: users,
            mat_id: materials
        })
    })
    return APIGetToObject(request)
}