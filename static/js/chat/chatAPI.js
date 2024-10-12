async function chatAPIGetChats(user=null){
    let url = '/api/v1/messages/'
    if (user){
        url += `?fromUser=${user}`
    }
    const request = await fetch(url)
    return await APIGetToObject(request)
}

async function chatAPIGetMessages(userID, chatType=null, fromUserID= null){
    let url = `/api/v1/messages/${userID}/`
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
    const request = await fetch(`/api/v1/messages/${userID}/`, {
        method: 'POST',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}