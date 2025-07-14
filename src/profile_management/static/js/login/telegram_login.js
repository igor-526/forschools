function loginTelegramMain(){
    if (!token){
        loginTelegramSpinner.classList.add("d-none")
        loginTelegramError.classList.remove("d-none")
        loginTelegramErrorText.innerHTML = "Отсутствуют данные для входа в аккаунт<br>Попробуйте получить из бота новую ссылку на страницу"
        return null
    }
    loginTelegram()
}

function loginTelegram(){
    function getRedirectUrl(){
        let redirectUrl = next ? next : "/lessons/"
        const urlHash = nextHash.length ? nextHash.map(h => {return `#${h}`}).join("") : ""
        redirectUrl += urlHash
        return redirectUrl
    }

    const fd = new FormData()
    fd.append("token", token)
    fetch(`/auth_tg/`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            "X-CSRFToken": csrftoken,
        },
        body: fd
    }).then(request => {
        switch (request.status){
            case 200:
                location.assign(getRedirectUrl())
                break
            case 400:
                loginTelegramSpinner.classList.add("d-none")
                loginTelegramError.classList.remove("d-none")
                loginTelegramErrorText.innerHTML = request.response.error
                break
            case 403:
                loginTelegramSpinner.classList.add("d-none")
                loginTelegramError.classList.remove("d-none")
                loginTelegramErrorText.innerHTML = "Не удалось войти. Возможно, ссылка устарела<br>Попробуйте получить из бота новую ссылку на страницу"
                break
            default:
                loginTelegramSpinner.classList.add("d-none")
                loginTelegramError.classList.remove("d-none")
                loginTelegramErrorText.innerHTML = "На сервере произошла ошибка<br>Попробуйте обновить страницу или выполнить действие позже"
                break
        }
    })
}


const params = new URLSearchParams(window.location.search)
const token = params.get("token")
const next = params.get("next")
const nextHash = params.getAll("nextHash")

const loginTelegramSpinner = document.querySelector("#loginTelegramSpinner")
const loginTelegramError = document.querySelector("#loginTelegramError")
const loginTelegramErrorText = document.querySelector("#loginTelegramErrorText")

loginTelegramMain()