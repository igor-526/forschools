async function lessonsAPIAddMaterials(materials=[], lesson){
    const response = await fetch(`/api/v1/lessons/${lesson}/materials/`, {
        method: "POST",
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

async function lessonsAPIGetAll(offset=0, status=null, teachers=[], listeners=[],
                                ds= null, de= null, has_hw=null, name=null, comment=null,
                                hwStatuses=[], hwAgreement=false, places=[]){
    let url = '/api/v1/lessons/'
    const searchParams=[]
    if (offset){
        searchParams.push(`offset=${offset}`)
    }
    if (name){
        searchParams.push(`name=${name}`)
    }
    if (comment){
        searchParams.push(`comment=${comment}`)
    }
    if (status){
        searchParams.push(`status=${status}`)
    }
    teachers.forEach(teacher => {
        searchParams.push(`teacher=${teacher}`)
    })
    listeners.forEach(listener => {
        searchParams.push(`listener=${listener}`)
    })
    if (ds){
        searchParams.push(`date_start=${ds}`)
    }
    if (de){
        searchParams.push(`date_end=${de}`)
    }
    if (has_hw){
        searchParams.push(`has_hw=${has_hw}`)
    }
    if (hwAgreement){
        searchParams.push(`hw_agreement=${hwAgreement}`)
    }
    hwStatuses.forEach(status => {
        searchParams.push(`hw_status=${status}`)
    })
    places.forEach(place => {
        searchParams.push(`place=${place}`)
    })
    if (searchParams){
        url += "?"+searchParams.join("&")
    }
    const request = await fetch(url)
    return await APIGetToObject(request)
}

async function lessonsAPIGetItem(lessonID){
    const request = await fetch(`/api/v1/lessons/${lessonID}/`)
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

async function lessonsAPISetPassed(lessonID, fd){
    const request = await fetch(`/api/v1/lessons/${lessonID}/set_passed/`, {
        method: "POST",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
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

async function lessonsAPIGetSchedule(userID=0, offset=0){
    let url = `/api/v1/lessons/schedule/${userID}/`
    if (offset){
        url += `?offset=${offset}`
    }
    const request = await fetch(url)
    return await APIGetToObject(request)
}

async function lessonsAPISetAdminComment(lessonID, fd){
    const url = `/api/v1/lessons/${lessonID}/set_admin_comment/`
    const init = {
        method: "POST",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
    }
    if (fd){
        init.body = fd
    }
    const request = await fetch(url, init)
    return await APIPostPatchToObject(request)
}

async function lessonsAPISetAdditionalListeners(lessonID, fd){
    const request = await fetch(`/api/v1/lessons/${lessonID}/set_additional/`, {
        method: "POST",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}

async function lessonsAPIDownloadData(fd){
    const request = await fetch(`/api/v1/generated/download/lessons/`, {
        method: "POST",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}

async function lessonsAPISendPlace(lessonID, fd){
    const request = await fetch(`/api/v1/lessons/${lessonID}/send_tg_place/`, {
        method: "POST",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}