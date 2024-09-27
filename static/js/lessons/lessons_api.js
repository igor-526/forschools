async function lessonsAPIAddMaterials(materials=[], lesson){
    const response = await fetch(`/api/v1/lessons/${lesson}/materials/`, {
        method: "post",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            materials: materials
        })
    })
    if (response.status === 200){
        return {status: 200}
    } else if (response.status === 400) {
        return {status: 400,
            response: await response.json()}
    } else {
        return {status: response.status}
    }
}

async function lessonsAPIDeleteMaterials(materials=[], lesson){
    const response = await fetch(`/api/v1/lessons/${lesson}/materials/`, {
        method: "DELETE",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            materials: materials
        })
    })
    return await APIDeleteToObject(response)
}

async function lessonsAPIReplaceTeacher(teacherID, lesson){
    const request = await fetch(`/api/v1/lessons/${lesson}/rt/`, {
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

async function lessonsAPIGetAll(status, teachers=[], listeners=[], ds= null, de= null, foruser){
    let url = `/api/v1/lessons?status=${status}`
    if (teachers.length !== 0){
        teachers.forEach(teacher => {
            url +=`&teacher=${teacher}`
        })
    }
    if (listeners.length !== 0){
        listeners.forEach(listener => {
            url +=`&listener=${listener}`
        })
    }
    if (foruser){
        url +=`&foruser=${foruser}`
    }
    if (ds){
        url +=`&date_start=${ds}`
    }
    if (de){
        url +=`&date_end=${de}`
    }
    const request = await fetch(url)
    return await APIGetToObject(request)
}

async function lessonsAPIGetItem(lessonID){
    const request = await fetch(`/api/v1/lessons/${lessonID}`)
    return await APIGetToObject(request)
}

async function lessonsAPIUpdateLesson(fd, lessonID){
    const request = await fetch(`/api/v1/lessons/${lessonID}/`, {
        method: "PATCH",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}

async function lessonsAPISetStatus(lessonID, fd){
    const request = await fetch(`/api/v1/lessons/${lessonID}/set_passed/`, {
        method: "POST",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}

async function lessonsAPIReschedulingCalculate(lessonID, fd){
    const params = new URLSearchParams(fd).toString()
    const request = await fetch(`/api/v1/lessons/${lessonID}/rescheduling?${params}`)
    return await APIGetToObject(request)
}

async function lessonsAPIReschedulingSet(lessonID, fd){
    const request = await fetch(`/api/v1/lessons/${lessonID}/rescheduling/`, {
        method: "POST",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}

async function lessonsAPIReschedulingCancel(lessonID, fd){
    const request = await fetch(`/api/v1/lessons/${lessonID}/rescheduling/`, {
        method: "PATCH",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}

async function lessonsAPISetNotHeld(lessonID){
    const request = await fetch(`/api/v1/lessons/${lessonID}/set_not_held/`, {
        method: "POST",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        }
    })
    return await APIPostPatchToObject(request)
}

async function lessonsAPIRestore(lessonID, fd){
    const request = await fetch(`/api/v1/lessons/${lessonID}/restore/`, {
        method: "PATCH",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}