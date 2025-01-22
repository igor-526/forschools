async function materialsAPIGetAll(type=2, offset=0, name="",
                                  cat=[], lvl=[], typeMat=[],
                                  progs=[], phases=[], lessons=[]){
    let url = `/api/v1/materials/?type=${type}&offset=${offset}`
    if (name !== ""){
        url += `&name=${name}`
    }
    if (cat.length !== 0){
        cat.forEach(item => {
            url += `&cat=${item}`
        })
    }
    if (lvl.length !== 0){
        lvl.forEach(item => {
            url += `&lvl=${item}`
        })
    }
    if (typeMat.length !== 0){
        typeMat.forEach(item => {
            url += `&typeMat=${item}`
        })
    }
    if (lessons.length !== 0){
        lessons.forEach(item => {
            url += `&lessons=${item}`
        })
    } else if (phases.length !== 0){
        phases.forEach(item => {
            url += `&phases=${item}`
        })
    } else if (progs.length !== 0){
        progs.forEach(item => {
            url += `&progs=${item}`
        })
    }
    const request = await fetch(url)
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

async function materialsAPIUpdate(formData, matID){
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
