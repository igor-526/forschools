async function mailingAPIGetUsers(roles=[], name=null,
                                  active=null, email=null, tg=null){
    let url = "/api/v1/mailing/users/"
    const queryParams = []

    roles.forEach(role => {
        queryParams.push(`role=${role}`)
    })
    if (name){
        queryParams.push(`name=${name}`)
    }
    if (active){
        queryParams.push(`active=${active}`)
    }
    if (email){
        queryParams.push(`email=${email}`)
    }
    if (tg){
        queryParams.push(`tg=${tg}`)
    }
    if (queryParams.length > 0){
        url += "?" + queryParams.join("&")
    }
    const request = await fetch(url)
    return await APIGetToObject(request)
}

async function mailingAPIGetInitiators(){
    const request = await fetch("/api/v1/mailing/initiators/")
    return await APIGetToObject(request)
}

async function mailingAPIGetAll(offset=0, name=null,
                                dateStart=null, dateEnd=null,
                                initiators=[], result=null){
    let url = "/api/v1/mailing/"
    const queryParams = []

    initiators.forEach(initiator => {
        queryParams.push(`initiator=${initiator}`)
    })
    if (offset){
        queryParams.push(`offset=${offset}`)
    }
    if (name){
        queryParams.push(`name=${name}`)
    }
    if (dateStart){
        queryParams.push(`date_start=${dateStart}`)
    }
    if (dateEnd){
        queryParams.push(`date_end=${dateEnd}`)
    }
    if (result){
        queryParams.push(`result=${result}`)
    }
    if (queryParams.length > 0){
        url += "?" + queryParams.join("&")
    }
    const request = await fetch(url)
    return await APIGetToObject(request)
}

async function mailingAPIGetItem(mailingID){
    const request = await fetch(`/api/v1/mailing/${mailingID}/`)
    return await APIGetToObject(request)
}

async function mailingAPIStartMailing(data){
    const request = await fetch(`/api/v1/mailing/start/`, {
        method: "POST",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return await APIPostPatchToObject(request)
}