async function homeworkAPIAddToLesson(lessonID, formData){
    formData.append("lesson", lessonID)
    const response = await fetch('/api/v1/homeworks/', {
        method: "post",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: formData
    })
    if (response.status === 500){
        return {status: 500,
            response: {}}
    } else {
        return {status: response.status,
            response: await response.json()}
    }
}

async function homeworkAPIAdd(formData){
    const response = await fetch('/api/v1/homeworks/', {
        method: "post",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: formData
    })
    if (response.status === 500){
        return {status: 500,
            response: {}}
    } else {
        return {status: response.status,
            response: await response.json()}
    }
}

async function homeworkAPIGetLogs(hw, last=false){
    let url = `/api/v1/homeworks/${hw}/logs/`
    const queryParams = []
    if (last){
        queryParams.push("last=true")
    }
    if (queryParams.length > 0){
        url += "?" + queryParams.join("&")
    }
    const request = await fetch(url)
    return APIGetToObject(request)
}

async function homeworkAPIGetLog(log_id){
    const request = await fetch(`/api/v1/homeworks/logs/${log_id}/`)
    return APIGetToObject(request)
}

async function homeworkAPIAnswerLog(log_id, fd){
    const request = await fetch(`/api/v1/homeworks/logs/${log_id}/`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIDeleteToObject(request)
}

async function homeworkAPIDeleteLog(log_id){
    const request = await fetch(`/api/v1/homeworks/logs/${log_id}/`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
            "X-CSRFToken": csrftoken,
        },
    })
    return APIDeleteToObject(request)
}

async function homeworkAPISend(homeworkID, fd){
    const request = await fetch(`/api/v1/homeworks/${homeworkID}/logs/`, {
        method: "POST",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}

async function homeworkAPIGet(offset=null, lesson=null, status=[], teachers=[],
                              listeners=[], dateFrom=null, dateTo=null,
                              dateChangedFrom=null, dateChangedTo=null, name=null){
    let url = "/api/v1/homeworks/"
    let queryArray = []
    if (offset){
        queryArray.push(`offset=${offset}`)
    }
    if (lesson){
        queryArray.push(`lesson=${lesson}`)
    }
    if (name){
        queryArray.push(`name=${name}`)
    }
    status.forEach(status => {
        queryArray.push(`status=${status}`)
    })
    if (dateFrom){
        queryArray.push(`date_from=${dateFrom}`)
    }
    if (dateTo){
        queryArray.push(`date_to=${dateTo}`)
    }
    if (dateChangedFrom){
        queryArray.push(`date_changed_from=${dateChangedFrom}`)
    }
    if (dateChangedTo){
        queryArray.push(`date_changed_to=${dateChangedTo}`)
    }
    teachers.forEach(teacher => {
        queryArray.push(`teacher=${teacher}`)
    })
    listeners.forEach(listener => {
        queryArray.push(`listener=${listener}`)
    })
    if (queryArray){
        url += "?" + queryArray.join("&")
    }
    const request = await fetch(url)
    return await APIGetToObject(request)
}

async function homeworkAPIGetInfo(homeworkID){
    const request = await fetch(`/api/v1/homeworks/${homeworkID}/info/`)
    return await APIGetToObject(request)
}

async function homeworkAPIGetItem(homeworkID){
    const request = await fetch(`/api/v1/homeworks/${homeworkID}/`)
    return await APIGetToObject(request)
}

async function homeworkAPISendTelegram(homeworkID, tgID=null){
    let url = `/api/v1/homeworks/${homeworkID}/edit/`
    if (tgID){
        url += `?tg_id=${tgID}`
    }
    const request = await fetch(url)
    return await APIGetToObject(request)
}

async function homeworkAPIReplaceTeacher(teacherID, homework){
    const request = await fetch(`/api/v1/homeworks/${homework}/rt/`, {
        method: "PATCH",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({
            teacher_id: teacherID
        })
    })
    return await APIPostPatchToObject(request)
}

async function homeworkAPISetCancelled(homeworkID){
    const request = await fetch(`/api/v1/homeworks/${homeworkID}/set_cancelled/`, {
        method: "POST",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        }
    })
    return await APIPostPatchToObject(request)
}

async function homeworkAPIDeleteMaterial(homeworkID, materialID){
    const request = await fetch(`/api/v1/homeworks/${homeworkID}/mat/${materialID}/`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
            "X-CSRFToken": csrftoken,
        },
    })
    return APIDeleteToObject(request)
}