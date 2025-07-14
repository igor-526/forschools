async function collectionsAPIGetLessonPlaces(){
    const request = await fetch("/api/v1/collections/lesson_places/")
    return await APIGetToObject(request)
}

async function collectionsAPIGetMatLevels(){
    const request = await fetch("/api/v1/collections/mat_levels/")
    return await APIGetToObject(request)
}

async function collectionsAPIGetMatCats(){
    const request = await fetch("/api/v1/collections/mat_cats/")
    return await APIGetToObject(request)
}

async function collectionsAPIGetEngChannels(){
    const request = await fetch("/api/v1/collections/eng_channels/")
    return await APIGetToObject(request)
}

async function collectionsAPIGetLevels(){
    const request = await fetch("/api/v1/collections/levels/")
    return await APIGetToObject(request)
}