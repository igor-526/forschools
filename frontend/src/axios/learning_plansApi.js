import api from "./baseApi.js";

export const getLearningPlanList = async (filters={}) => {
    return await api.get("learning_plans/",
        {
            params: filters
        },
    )
}

export const getLearningPlan = async (lPlanId) => {
    return await api.get(`learning_plans/${lPlanId}/`)
}