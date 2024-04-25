async function usersAPIGetTeachers(){
    const request = await fetch("/api/v1/users?group=teachers")
    return await APIGetToObject(request)
}

async function usersAPIGetListeners(){
    const request = await fetch("/api/v1/users?group=listeners")
    return await APIGetToObject(request)
}

async function usersAPIGetAll(){
    const request = await fetch("/api/v1/users")
    return await APIGetToObject(request)
}

async function usersAPIGetItem(userID){
    const request = await fetch(`/api/v1/users/${userID}`)
    return await APIGetToObject(request)
}

async function usersAPIUpdateUser(fd, userID){
    const request = await fetch(`/api/v1/users/${userID}/`, {
        method: 'patch',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}

async function usersAPIPhotoGet(userID){
    const request = await fetch(`/api/v1/users/${userID}/photo/`)
    return await APIGetToObject(request)
}

async function usersAPIPhotoUpdate(userID, fd){
    const request = await fetch(`/api/v1/users/${userID}/photo/`, {
        method: 'patch',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}

async function usersAPIPhotoDestroy(userID){
    const request = await fetch(`/api/v1/users/${userID}/photo/`, {
        method: 'delete',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        }
    })
    return await APIDeleteToObject(request)
}

async function usersAPIChangePassword(fd, userID){
    const request = await fetch(`/api/v1/users/${userID}/reset_password/`, {
        method: 'patch',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return await APIPostPatchToObject(request)
}

async function usersAPIDeactivate(userID, action){
    const request = await fetch(`/api/v1/users/${userID}/${action}/`, {
        method: 'patch',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        }
    })
    return await APIPostPatchToObject(request)
}

async function usersAPIRegistration(fd){
    const request = await fetch("/register", {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}