import api from "./baseApi.ts";

export const getHomeworksList = async (filters={}) => {
    return await api.get("homeworks/",
        {
            params: filters
        },
    )
}

export const getOneHomework = async (homeworkId: number) => {
    return await api.get(`homeworks/${homeworkId}/`)
}