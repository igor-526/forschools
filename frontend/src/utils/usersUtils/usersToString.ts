import type {UserListNameOnlyResponseType} from "../../types/usersTypes.ts";

const usersToString: (users: UserListNameOnlyResponseType[]) => string =
    (users) => {
    return users.map<string>(
        (user) => {return `${user.first_name} ${user.last_name}`}
    ).join(", ")
}

export default usersToString