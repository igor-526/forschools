async function plansAPIGet(){
    const request = await fetch("/api/v1/learning_plans/")
    if (request.status === 200){
        return {status: 200,
            response: await request.json()}
    } else {
        return {status: request.status}
    }
}

async function plansAPICreate(fd){
    const request = await fetch('/api/v1/learning_plans/', {
        method: "post",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}

async function plansAPIUpdate(fd, planID){
    const request = await fetch(`/api/v1/learning_plans/${planID}/`, {
        method: "PATCH",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}

async function plansAPIDestroy(planID){
    const request = await fetch(`/api/v1/learning_plans/${planID}/`, {
        method: "delete",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        }
    })
    return APIDeleteToObject(request)
}

async function planItemAPIGetPhases() {
    const request = await fetch(`/api/v1/learning_plans/${planID}/phases/`)
    if (request.status === 200){
        return {status: 200,
            response: await request.json()}
    } else {
        return {status: request.status}
    }
}

async function planItemAPIDestroyPhase(planID, phaseID){
    const request = await fetch(`/api/v1/learning_plans/${planID}/phases/${phaseID}/`, {
        method: "delete",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken
        }
    })
    return APIDeleteToObject(request)
}

async function planItemAPIUpdatePhase(planID, phaseID, fd){
    const request = await fetch(`/api/v1/learning_plans/${planID}/phases/${phaseID}/`, {
        method: "PATCH",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}

async function planItemAPICreatePhase(planID, fd){
    const request = await fetch(`/api/v1/learning_plans/${planID}/phases/`, {
        method: "post",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}

async function planItemAPIDestroyLesson(lessonID){
    const request = await fetch(`/api/v1/lessons/${lessonID}/`, {
        method: "delete",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken
        }
    })
    return APIDeleteToObject(request)
}

async function planItemAPIUpdateLesson(fd, lessonID){
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

async function planItemAPICalculateFromProgram(fd, planID){
    const params = new URLSearchParams(fd).toString()
    const request = await fetch(`/api/v1/learning_plans/${planID}/setprogram?${params}`)
    return APIGetToObject(request)
}

async function planItemAPISetPlanFromProgram(fd, planID){
    const request = await fetch(`/api/v1/learning_plans/${planID}/setprogram/`, {
        method: "post",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}