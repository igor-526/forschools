async function supportWSGILogsAPIGet(handling_status=null, dt_start=null, dt_end=null,
                                     users=[], methods=[], path=null, codes=[]){
    let url = "/api/v1/support/wsgierrors/"
    let searchParams = []
    if (handling_status){
        searchParams.push(`handling_status=${handling_status}`)
    }
    if (dt_start){
        searchParams.push(`dt_start=${dt_start}`)
    }
    if (dt_end){
        searchParams.push(`dt_end=${dt_end}`)
    }
    if (path){
        searchParams.push(`path=${path}`)
    }
    if (codes){
        codes.forEach(code => {
            searchParams.push(`code=${code}`)
        })
    }
    if (users){
        users.forEach(user => {
            searchParams.push(`user=${user}`)
        })
    }
    if (methods){
        methods.forEach(method => {
            searchParams.push(`method=${method}`)
        })
    }
    if (searchParams.length > 0){
        url += "?" + searchParams.join("&")
    }
    const request = await fetch(url)
    return APIGetToObject(request)
}

async function supportWSGILogsAPIGetItem(wsgiErrorID){
    const request = await fetch(`/api/v1/support/wsgierrors/${wsgiErrorID}/`)
    return APIGetToObject(request)
}

async function supportWSGILogsAPIUpdateMany(fd){
    const request = await fetch(`/api/v1/support/wsgierrors/set_status/`, {
        method: "POST",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}

async function supportTelegramLogsAPIGet(offset=null, handling_status=null, dt_start=null, dt_end=null,
                                         action_type=[], users=[]){
    let url = "/api/v1/support/telegramerrors/"
    let searchParams = []
    if (offset){
        searchParams.push(`offset=${offset}`)
    }
    if (handling_status){
        searchParams.push(`handling_status=${handling_status}`)
    }
    if (dt_start){
        searchParams.push(`dt_start=${dt_start}`)
    }
    if (dt_end){
        searchParams.push(`dt_end=${dt_end}`)
    }
    action_type.forEach(action_type => {
        searchParams.push(`action_type=${action_type}`)
    })
    users.forEach(user => {
        searchParams.push(`user=${user}`)
    })
    if (searchParams.length > 0){
        url += "?" + searchParams.join("&")
    }
    const request = await fetch(url)
    return APIGetToObject(request)
}

async function supportTelegramLogsAPIGetItem(tgErrorID){
    const request = await fetch(`/api/v1/support/telegramerrors/${tgErrorID}/`)
    return APIGetToObject(request)
}

async function supportTelegramLogsAPIUpdate(fd){
    const request = await fetch(`/api/v1/support/telegramerrors/set_status/`, {
        method: "POST",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}

async function supportAPITicketCreate(formData){
    const request = await fetch(`/api/v1/support/tickets/`, {
        method: "POST",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: formData
    })
    return APIPostPatchToObject(request)
}

async function supportAPITicketGet(description=null, statuses=[],
                                   dt_start=null, dt_end=null, users=[]){
    let url = "/api/v1/support/tickets/"
    let searchParams = []
    if (description){
        searchParams.push(`description=${description}`)
    }
    if (dt_start){
        searchParams.push(`dt_start=${dt_start}`)
    }
    if (dt_end){
        searchParams.push(`dt_end=${dt_end}`)
    }
    if (users.length > 0){
        users.forEach(user => {
            searchParams.push(`user=${user}`)
        })
    }
    if (statuses.length > 0){
        statuses.forEach(status => {
            searchParams.push(`status=${status}`)
        })
    }
    if (searchParams.length > 0){
        url += "?" + searchParams.join("&")
    }
    const request = await fetch(url)
    return APIGetToObject(request)
}