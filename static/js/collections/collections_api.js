async function collectionsGetLessonPlaces(){
    const request = await fetch("/api/v1/collections/lesson_places/")
    return await APIGetToObject(request)
}