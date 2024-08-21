async function chatAPIGetChats(user=null){
    console.log(user)
    let url = '/api/v1/messages/'
    if (user){
        url += `?fromUser=${user}`
    }
    const request = await fetch(url)
    return await APIGetToObject(request)
}

async function chatAPIGetMessages(userID, fromUserID= null){
    let url = `/api/v1/messages/${userID}`
    console.log(fromUserID)
    if (fromUserID){
        url += `?fromUser=${fromUserID}`
    }
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