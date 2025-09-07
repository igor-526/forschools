import api from "./baseApi.ts";
import type {
    LessonFiltersType,
    LessonListResponseType,
    LessonPlaceResponseType,
    LessonPlacesFiltersType
} from "../types/lessonsTypes.ts";

type GetLessonsListAPIType = (filters?: LessonFiltersType) => Promise<LessonListResponseType>
type GetLessonPlacesListAPIType = (filters?: LessonPlacesFiltersType) => Promise<LessonPlaceResponseType[]>
type GetLessonDetailsAPIType = (lessonId: number | string) => Promise<any>
type GetLessonPlaceDetailsAPIType = (placeId: number | string) => Promise<LessonPlaceResponseType>

export const getLessonsList: GetLessonsListAPIType = async (filters = {}) => {
    const request = await api.get("lessons/",
        {
            params: filters
        },
    )
    return request.data
}

export const getOneLesson: GetLessonDetailsAPIType = async (lessonId) => {
    const request = await api.get(`lessons/${lessonId}/`)
    return request.data
}

export const getLessonPlacesList: GetLessonPlacesListAPIType = async (filters = {}) => {
    const request = await api.get("/lessons/places/",
        {
            params: filters
        })
    return request.data
}

export const getOnePlace: GetLessonPlaceDetailsAPIType = async (placeId) => {
    const request = await api.get(`lessons/places/${placeId}/`)
    return request.data
}