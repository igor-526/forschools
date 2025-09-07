import type {BooleanFilterType} from "./apiTypes.ts";

export type UserFiltersRolesType = "t" | "l" | "m" | "c" | "a";

export type UserListNameOnlyResponseType = {
    id: number,
    first_name: string,
    last_name: string,
    patronymic?: string | null,
    roles?: string[],
}

export type UserListNameOnlyFiltersType = {
    roles?: UserFiltersRolesType[]
    show_roles?: BooleanFilterType
    exclude_me?: BooleanFilterType
}