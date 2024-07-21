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
    const fd = new FormData()
    users.forEach(user => {
        fd.append("users", user)
    })
    materials.forEach(mat => {
        fd.append("materials", mat)
    })
    const request = await fetch("/api/v1/telegram/sendmaterial/", {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIGetToObject(request)
}

async function telegramAPISendLessonMaterials(lesson, materials=[]){
    const fd = new FormData()
    fd.append("lesson_id", lesson)
    materials.forEach(mat => {
        fd.append("materials", mat)
    })
    const request = await fetch("/api/v1/telegram/sendmaterial/", {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIGetToObject(request)
}