async function loginAPISetAdminComment(fd){
    return await fetch("/auth/", {
        method: "POST",
        credentials: 'same-origin',
        headers: {
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
}

function loginMain(){
    tgLogin()
    loginFormButton.addEventListener("click", loginButtonListener)
}

function tgLogin(){
    if (window.Telegram){
        const tgAPI = window.Telegram.WebApp
        const tgUserdata = tgAPI.initDataUnsafe
        tgAPI.expand()
        tgAPI.disableVerticalSwipes()
        tgAPI.setHeaderColor("#003366")
        const fd = new FormData()
        fd.set("redirect_url", window.location.href)
        if (tgUserdata.user){
            fd.set("tg_id", tgUserdata.user.id)
        }
        fetch('/ma/login/', {
            method: 'POST',
            credentials: 'same-origin',
            body: fd
        }).then(_ => {
            tgAPI.close()
        })
    }
}

function loginValidate(){
    let validationStatus = true
    loginFormLogin.classList.remove("is-invalid")
    loginFormPassword.classList.remove("is-invalid")
    if (loginFormLogin.value.trim().length === 0){
        loginFormLogin.classList.add("is-invalid")
        validationStatus = false
    }
    if (loginFormPassword.value.trim().length === 0){
        loginFormPassword.classList.add("is-invalid")
        validationStatus = false
    }
    return validationStatus
}

function loginButtonListener(){
    if (loginValidate()){
        loginAPISetAdminComment(new FormData(loginForm)).then(request => {
            switch (request.status){
                case 200:
                    location.assign("/")
                    break
                default:
                    loginFormLogin.classList.add("is-invalid")
                    loginFormPassword.classList.add("is-invalid")
                    break
            }
        })
    }
}

const loginForm = document.querySelector("#loginForm")
const loginFormLogin = loginForm.querySelector("#loginFormLogin")
const loginFormPassword = loginForm.querySelector("#loginFormPassword")
const loginFormButton = document.querySelector("#loginFormButton")

loginMain()
