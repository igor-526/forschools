import api from "./baseApi.js";

export const getHomeworksList = async (filters={}) => {
    return await api.get("homeworks/",
        {
            params: filters
        },
    )
}

export const getOneHomework = async (homeworkId) => {
    return await api.get(`homeworks/${homeworkId}/`)
}