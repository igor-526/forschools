async function plansAPIGet(offset=0, q_all=null, part_only=null, name=null, teacher=[],
                           listener=[], status=null, nameSort=null){
    let url = "/api/v1/learning_plans/"
    let searchParams = []
    if (offset){
        searchParams.push(`offset=${offset}`)
    }
    if (q_all){
        searchParams.push(`q_all=${q_all}`)
    }
    if (part_only){
        searchParams.push(`part_only=${part_only}`)
    }
    if (name){
        searchParams.push(`name=${name}`)
    }
    teacher.forEach(teacher => {
        searchParams.push(`teacher=${teacher}`)
    })
    listener.forEach(listener => {
        searchParams.push(`listener=${listener}`)
    })
    if (status){
        searchParams.push(`status=${status}`)
    }
    if (nameSort){
        searchParams.push(`sort_name=${nameSort}`)
    }
    if (searchParams.length > 0){
        url += "?" + searchParams.join("&")
    }
    const request = await fetch(url)
    return APIGetToObject(request)
}

async function plansAPIGetItem(planID){
    const request = await fetch(`/api/v1/learning_plans/${planID}/`)
    return APIGetToObject(request)
}

async function planItemAPIGetInfo() {
    const request = await fetch(`/api/v1/learning_plans/${planID}/status/`)
    return APIGetToObject(request)
}

async function plansItemAPIClosePlan(){
    const request = await fetch(`/api/v1/learning_plans/${planID}/status/`, {
        method: "post",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
    })
    return APIPostPatchToObject(request)
}

async function plansAPICreate(fd){
    const request = await fetch('/api/v1/learning_plans/', {
        method: "POST",
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

async function planItemAPIAddLessons(fd, planID){
    const request = await fetch(`/api/v1/learning_plans/${planID}/add_lessons/`, {
        method: "POST",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}

async function planItemAPIDownload(fd){
    const request = await fetch(`/api/v1/learning_plans/download/`, {
        method: "POST",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}

async function planItemAPIPreHWComment(planID, fd=null){
    if (fd){
        const request = await fetch(`/api/v1/learning_plans/${planID}/pre_hw_comment/`, {
            method: "POST",
            credentials: 'same-origin',
            headers:{
                "X-CSRFToken": csrftoken,
            },
            body: fd
        })
        return APIPostPatchToObject(request)
    } else {
        const request = await fetch(`/api/v1/learning_plans/${planID}/pre_hw_comment/`, {
            method: "DELETE",
            credentials: 'same-origin',
            headers:{
                "X-CSRFToken": csrftoken,
            },
        })
        return APIDeleteToObject(request)
    }

}

async function planItemAPISetAdminComment(planID, fd=null){
    const url = `/api/v1/learning_plans/${planID}/set_admin_comment/`
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