async function collectionsGetLessonPlaces(){
    const request = await fetch("/api/v1/collections/lesson_places/")
    return await APIGetToObject(request)
}

async function collectionsGetMatLevels(){
    const request = await fetch("/api/v1/collections/mat_levels/")
    return await APIGetToObject(request)
}

async function collectionsGetMatCats(){
    const request = await fetch("/api/v1/collections/mat_cats/")
    return await APIGetToObject(request)
}