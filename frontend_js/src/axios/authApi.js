import api from "./baseApi.js";

const authApiLogin = async (login, password) => {
    const response = await api.post("auth/token/",
        {
            username: login,
            password: password
        }, {withCredentials: true}
    )
    return response
}

export default authApiLogin;