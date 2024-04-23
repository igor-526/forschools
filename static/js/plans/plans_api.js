async function plansGet(){
    const request = await fetch("/api/v1/learning_plans/")
    if (request.status === 200){
        return {status: 200,
            response: await request.json()}
    } else {
        return {status: request.status}
    }
}

async function plansCreate(fd){
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

async function plansUpdate(fd, planID){
    const request = await fetch(`/api/v1/learning_plans/${planID}/`, {
        method: "patch",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}

async function plansDestroy(planID){
    const request = await fetch(`/api/v1/learning_plans/${planID}/`, {
        method: "delete",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        }
    })
    return APIDeleteToObject(request)
}

async function planItemGetPhases() {
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
        method: "patch",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}