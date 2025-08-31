import api from "./baseApi.js";

export const getLessonsList = async (filters={}) => {
    return await api.get("lessons/",
        {
            params: filters
        },
    )
}

export const getOneLesson = async (lessonId) => {
    return await api.get(`lessons/${lessonId}/`)
}