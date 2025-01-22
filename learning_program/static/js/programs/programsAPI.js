async function programsAPIHWCreate(fd){
    const request = await fetch('/api/v1/learning_programs/hw/', {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}

async function programsAPIHWGetAll(){
    const request = await fetch('/api/v1/learning_programs/hw/')
    return await APIGetToObject(request)
}

async function programsAPIHWGetItem(hwID){
    const request = await fetch(`/api/v1/learning_programs/hw/${hwID}/`)
    return await APIGetToObject(request)
}

async function programsAPIHWUpdate(hwID, fd){
    const request = await fetch(`/api/v1/learning_programs/hw/${hwID}/`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}

async function programsAPIHWDestroy(hwID){
    const request = await fetch(`/api/v1/learning_programs/hw/${hwID}/`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
    })
    return await APIDeleteToObject(request)
}

async function programsAPILessonCreate(fd){
    const request = await fetch('/api/v1/learning_programs/lesson/', {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}

async function programsAPILessonGetAll(phases = []){
    let url = '/api/v1/learning_programs/lesson/?'
    if (phases.length !== 0){
        phases.forEach(phase => {
            url += `&phase=${phase}`
        })
    }
    const request = await fetch(url)
    return await APIGetToObject(request)
}

async function programsAPILessonGetItem(lessonID){
    const request = await fetch(`/api/v1/learning_programs/lesson/${lessonID}/`)
    return await APIGetToObject(request)
}

async function programsAPILessonUpdate(lessonID, fd){
    const request = await fetch(`/api/v1/learning_programs/lesson/${lessonID}/`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}

async function programsAPILessonDestroy(lessonID){
    const request = await fetch(`/api/v1/learning_programs/lesson/${lessonID}/`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
    })
    return await APIDeleteToObject(request)
}

async function programsAPIPhaseCreate(fd){
    const request = await fetch('/api/v1/learning_programs/phase/', {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}

async function programsAPIPhaseGetAll(programs = []){
    let url = '/api/v1/learning_programs/phase/?'
    if (programs.length !== 0){
        programs.forEach(prog => {
            url += `&prog=${prog}`
        })
    }
    const request = await fetch(url)
    return await APIGetToObject(request)
}

async function programsAPIPhaseGetItem(phaseID){
    const request = await fetch(`/api/v1/learning_programs/phase/${phaseID}/`)
    return await APIGetToObject(request)
}

async function programsAPIPhaseUpdate(phaseID, fd){
    const request = await fetch(`/api/v1/learning_programs/phase/${phaseID}/`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}

async function programsAPIPhaseDestroy(phaseID){
    const request = await fetch(`/api/v1/learning_programs/phase/${phaseID}/`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
    })
    return await APIDeleteToObject(request)
}

async function programsAPIProgramCreate(fd){
    const request = await fetch('/api/v1/learning_programs/program/', {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}

async function programsAPIProgramGetAll(){
    const request = await fetch('/api/v1/learning_programs/program/')
    return await APIGetToObject(request)
}

async function programsAPIProgramGetItem(programID){
    const request = await fetch(`/api/v1/learning_programs/program/${programID}/`)
    return await APIGetToObject(request)
}

async function programsAPIProgramUpdate(programID, fd){
    const request = await fetch(`/api/v1/learning_programs/program/${programID}/`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}

async function programsAPIProgramDestroy(programID){
    const request = await fetch(`/api/v1/learning_programs/program/${programID}/`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
    })
    return await APIDeleteToObject(request)
}