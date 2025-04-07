async function chatAPIGetChats(user=null, search=null){
    let url = '/api/v1/messages/'
    const queryParams = []
    if (user){
        queryParams.push(`from_user=${user}`)
    }
    if (search){
        queryParams.push(`search=${search}`)
    }
    if (queryParams){
        url += "?" + queryParams.join("&")
    }
    const request = await fetch(url)
    return await APIGetToObject(request)
}

async function chatAPIGetAdminChats(search=null){
    let url = '/api/v1/messages/admin_messages/'
    if (search){
        url += `?search=${search}`
    }
    const request = await fetch(url)
    return await APIGetToObject(request)
}

async function chatAPIGetMessages(userID, chatType=null, fromUserID= null){
    let url = `/api/v1/messages/${userID ? userID : 0}/`
    const queryArray = []
    if (chatType){
        queryArray.push(`chat_type=${chatType}`)
    }
    if (fromUserID){
        queryArray.push(`from_user=${fromUserID}`)
    }
    if (queryArray.length > 0){
        url += "?" + queryArray.join("&")
    }
    const request = await fetch(url)
    return await APIGetToObject(request)
}

async function chatAPISendMessage(userID, fd){
    const request = await fetch(`/api/v1/messages/${userID ? userID : 0}/`, {
        method: 'POST',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}

async function chatAPICreateGroup(fd){
    const request = await fetch(`/api/v1/messages/groupchats/`, {
        method: 'POST',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}

async function chatAPIGetUnsent(){
    const request = await fetch('/api/v1/messages/unsent/')
    return await APIGetToObject(request)
}