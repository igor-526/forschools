import api from "./baseApi.ts";
import type {UserListNameOnlyFiltersType, UserListNameOnlyResponseType} from "../types/usersTypes.ts";

type GetUsersNameOnlyAPIType = (filters: UserListNameOnlyFiltersType) => Promise<UserListNameOnlyResponseType[]>;

export const getUserNameOnlyList: GetUsersNameOnlyAPIType = async (filters) => {
    const request = await api.get("/users/nameonly/",
        {
            params: filters
        }
    )
    return request.data
}