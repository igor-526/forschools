async function lessonsAPIAddMaterials(materials=[], lesson){
    console.log(materials)
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

async function lessonsAPIGetAll(status){
    const request = await fetch(`/api/v1/lessons?status=${status}`)
    return await APIGetToObject(request)
}

async function lessonsAPIGetItem(lessonID){
    const request = await fetch(`/api/v1/lessons/${lessonID}`)
    return await APIGetToObject(request)
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