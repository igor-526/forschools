async function materialsAPIGetAll(type=2){
    const request = await fetch(`/api/v1/materials?type=${type}`)
    return await APIGetToObject(request)
}

async function materialsAPIGet(matID){
    const request = await fetch(`/api/v1/materials/${matID}`)
    return await APIGetToObject(request)
}

async function materialsAPICreate(formData){
    const request = await fetch('/api/v1/materials/', {
        method: "post",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: formData
    })
    return await APIPostPatchToObject(request)
}

async function materialsAPIEdit(formData, matID){
    const request = await fetch(`/api/v1/materials/${matID}`, {
        method: "PATCH",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: formData
    })
    return await APIPostPatchToObject(request)
}

async function materialsAPIDelete(matID){
    const request = await fetch(`/api/v1/materials/${matID}`, {
        method: "delete",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
    })
    return await APIGetToObject(request)
}
