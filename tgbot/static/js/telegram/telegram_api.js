async function telegramAPIGetUser(userID){
    const request = await fetch(`/api/v1/users/${userID}/telegram/`)
    return await APIGetToObject(request)
}

async function telegramAPIGetUsers(){
    const request = await fetch('/api/v1/telegram/all/')
    return APIGetToObject(request)
}

async function telegramAPIGetTelegramNotes(userID){
    const request = await fetch(`/api/v1/telegram/${userID}/`)
    return APIGetToObject(request)
}

async function telegramAPIDisconnect(noteID){
    const request = await fetch(`/api/v1/telegram/${noteID}/`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
            "X-CSRFToken": csrftoken,
        }
    })
    return APIDeleteToObject(request)
}

async function telegramAPIEditRole(noteID, fd){
    const request = await fetch(`/api/v1/telegram/${noteID}/`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}

async function telegramAPISetMain(noteID){
    const request = await fetch(`/api/v1/telegram/${noteID}/set_main/`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            "X-CSRFToken": csrftoken,
        }
    })
    return APIPostPatchToObject(request)
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
        method: 'POST',
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
        method: 'POST',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIGetToObject(request)
}

async function telegramAPIGetJournal(
    offset=null,
    event = [],
    dateFrom = null,
    dateTo = null,
    timeFrom = null,
    timeTo = null,
    initiator = [],
    recipient = [],
    status = []
){
    let url = '/api/v1/tgjournal/'
    let qp = []

    event.forEach(ev => {
        qp.push(`event=${ev}`)
    })
    if (offset){
        qp.push(`offset=${offset}`)
    }
    if (dateFrom){
        qp.push(`date_from=${dateFrom}`)
    }
    if (dateTo){
        qp.push(`date_to=${dateTo}`)
    }
    if (timeFrom){
        qp.push(`time_from=${timeFrom}`)
    }
    if (timeTo){
        qp.push(`time_to=${timeTo}`)
    }
    initiator.forEach(init => {
        qp.push(`initiator=${init}`)
    })
    recipient.forEach(rec => {
        qp.push(`recipient=${rec}`)
    })
    status.forEach(stat => {
        qp.push(`status=${stat}`)
    })

    if (qp.length !== 0){
        url += `?${qp.join("&")}`
    }
    const request = await fetch(url)
    return APIGetToObject(request)
}

async function telegramAPIGetJournalNote(noteID){
    const request = await fetch(`/api/v1/tgjournal/${noteID}`)
    return APIGetToObject(request)
}