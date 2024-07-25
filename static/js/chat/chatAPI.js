async function chatAPIGetChats(user=null){
    const request = await fetch('/api/v1/messages/')
    return await APIGetToObject(request)
}

async function chatAPIGetMessages(userID, fromUserID){
    let url = `/api/v1/messages/${userID}`
    const request = await fetch(url)
    return await APIGetToObject(request)
}

async function chatAPISendMessage(userID, fd){
    const request = await fetch(`/api/v1/messages/${userID}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}