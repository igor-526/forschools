async function usersAPIGetTeachers(){
    const request = await fetch("/api/v1/users/?role==Teacher")
    return await APIGetToObject(request)
}

async function usersAPIGetListeners(){
    const request = await fetch("/api/v1/users/?role==Listener")
    return await APIGetToObject(request)
}

async function usersAPIGetAll(setting=null, id=null, tg=null, username=null,
                              fullName=null, roles=[], sortUsername=null,
                              sortFullName=null, excludeMe=false){
    let url = "/api/v1/users/"
    const query = []
    if (id){
        query.push(`id=${id}`)
    }
    if (setting){
        query.push(`setting=${setting}`)
    }
    if (tg){
        query.push(`tg_status=${tg}`)
    }
    if (username){
        query.push(`username=${username}`)
    }
    if (fullName){
        query.push(`full_name=${fullName}`)
    }
    if (sortUsername){
        query.push(`sort_username=${sortUsername}`)
    }
    if (sortFullName){
        query.push(`sort_full_name=${sortFullName}`)
    }
    if (excludeMe){
        query.push(`exclude_me=True}`)
    }
    roles.forEach(role => {
        query.push(`role=${role}`)
    })
    if (query.length > 0){
        url += "?" + query.join("&")
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