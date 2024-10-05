async function usersAPIGetTeachers(){
    const request = await fetch("/api/v1/users/?group=teachers")
    return await APIGetToObject(request)
}

async function usersAPIGetListeners(){
    const request = await fetch("/api/v1/users/?group=listeners")
    return await APIGetToObject(request)
}

async function usersAPIGetAll(setting=null){
    let url = "/api/v1/users/"
    if (setting){
        url += `?setting=${setting}`
    }
    const request = await fetch(url)
    return await APIGetToObject(request)
}

async function usersAPIGetUser(userID){
    const request = await fetch(`/api/v1/users/${userID}/`)
    return await APIGetToObject(request)
}

async function usersAPIUpdateUser(fd, userID){
    const request = await fetch(`/api/v1/users/${userID}/`, {
        method: 'PATCH',
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
        method: 'PATCH',
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
        method: 'PATCH',
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
        method: 'PATCH',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        }
    })
    return await APIPostPatchToObject(request)
}

async function usersAPIAdminLogin(userID){
    const request = await fetch(`/api/v1/users/${userID}/login/`)
    return APIGetToObject(request)
}

async function usersAPIRegistration(fd){
    const request = await fetch("/register/", {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    return APIPostPatchToObject(request)
}

async function usersAPIGetLessons(userID){
    const request = await fetch(`/api/v1/users/${userID}/lessons/`)
    return await APIGetToObject(request)
}

async function usersAPIGetHW(userID){
    const request = await fetch(`/api/v1/users/${userID}/hw/`)
    return await APIGetToObject(request)
}

async function usersAPIGetTeachersListeners(type){
    const request = await fetch(`/api/v1/users/teacherslisteners/?group=${type}`)
    return await APIGetToObject(request)
}

async function usersAPIGetUsersForJournal(){
    const request = await fetch(`/api/v1/users/forjournals/`)
    return await APIGetToObject(request)
}