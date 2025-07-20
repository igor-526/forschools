function welcomeMain(){
    usersWelcomePlatformURL.innerHTML = `https://${location.host}`
    welcomeSetPassword()
    welcomeSetCopyListeners()
    usersWelcomeGoButton.addEventListener("click", welcomeGoNext)
}

function welcomeSetPassword(){
    usersWelcomePasswordField.value = generatePassword(8)
}

function welcomeSetCopyListeners(){
    function buttonEffect(button){
        button.classList.remove("btn-primary")
        button.classList.add("btn-success")
        setTimeout(() => {
            button.classList.add("btn-primary")
            button.classList.remove("btn-success")
        }, 500)
    }

    usersWelcomeCopyTGStartButton.addEventListener("click", () => {
        navigator.clipboard.writeText(`https://t.me/${tgNickname}?start=${tgCode}`)
        buttonEffect(usersWelcomeCopyTGStartButton)
    })
    usersWelcomeCopyTGNicButton.addEventListener("click", () => {
        navigator.clipboard.writeText(tgNickname)
        buttonEffect(usersWelcomeCopyTGNicButton)
    })
    usersWelcomeCopyTGCommandButton.addEventListener("click", () => {
        navigator.clipboard.writeText(`/start ${tgCode}`)
        buttonEffect(usersWelcomeCopyTGCommandButton)
    })
    usersWelcomeCopyWebButton.addEventListener("click", () => {
        const text = `Ссылка: https://${location.host}
Логин: ${userLogin}
Пароль: ${usersWelcomePasswordField.value}`
        navigator.clipboard.writeText(text)
        buttonEffect(usersWelcomeCopyWebButton)
    })
}

function welcomeValidate(errors=null){
    const validateInfo = []

    if (errors){
        if (errors.last_name.length){
            validateInfo.push({
                inputElement: usersWelcomeLastNameField,
                errorElement: usersWelcomeLastNameError,
                error: errors.last_name.join("<br>"),
            })
        }
        if (errors.first_name.length){
            validateInfo.push({
                inputElement: usersWelcomeFirstNameField,
                errorElement: usersWelcomeFirstNameError,
                error: errors.first_name.join("<br>"),
            })
        }
        if (errors.patronymic.length){
            validateInfo.push({
                inputElement: usersWelcomePatronymicField,
                errorElement: usersWelcomePatronymicError,
                error: errors.patronymic.join("<br>"),
            })
        }
        if (errors.email.length){
            validateInfo.push({
                inputElement: usersWelcomeEmailField,
                errorElement: usersWelcomeEmailError,
                error: errors.email.join("<br>"),
            })
        }
        if (errors.password.length){
            validateInfo.push({
                inputElement: usersWelcomePasswordField,
                errorElement: usersWelcomePasswordError,
                error: errors.password.join("<br>"),
            })
        }
    } else {
        validateInfo.push({
            inputElement: usersWelcomeLastNameField,
            errorElement: usersWelcomeLastNameError,
            error: null,
            min_length: 1,
            max_length: 50,
        })
        validateInfo.push({
            inputElement: usersWelcomeFirstNameField,
            errorElement: usersWelcomeFirstNameError,
            error: null,
            min_length: 1,
            max_length: 50,
        })
        validateInfo.push({
            inputElement: usersWelcomePatronymicField,
            errorElement: usersWelcomePatronymicError,
            error: null,
            min_length: 0,
            max_length: 50,
        })
        validateInfo.push({
            inputElement: usersWelcomePasswordField,
            errorElement: usersWelcomePasswordError,
            error: null,
            min_length: 1,
            max_length: 100,
        })
        validateInfo.push({
            inputElement: usersWelcomeEmailField,
            errorElement: usersWelcomeEmailError,
            error: null,
            min_length: 0,
            max_length: 50,
        })
    }
    return universalFieldValidator(validateInfo)
}

function welcomeGoNext(){
    function getFormData(){
        const fd = new FormData()
        fd.set("last_name", usersWelcomeLastNameField.value.trim())
        fd.set("first_name", usersWelcomeFirstNameField.value.trim())
        fd.set("password", usersWelcomePasswordField.value)
        if (usersWelcomePatronymicField.value.trim().length){
            fd.set("patronymic", usersWelcomePatronymicField.value.trim())
        }
        if (usersWelcomeEmailField.value.trim().length){
            fd.set("email", usersWelcomeEmailField.value.trim())
        }
        if (usersWelcomeBDateField.value !== ""){
            fd.set("bdate", usersWelcomeBDateField.value.trim())
        }
        return fd
    }

    if (welcomeValidate()){
        const welcomeAPI = new WelcomeAPI(welcomeUrlCode)
        welcomeAPI.setupWelcome(getFormData()).then(request => {
            switch (request.status){
                case 200:
                    window.location.assign("/dashboard")
                    break
                case 400:
                    welcomeValidate(request.response.errors)
                    break
                default:
                    alert("Что то пошло не так. Пожалуйста, обновите страницу или попробуйте позже")
                    break
            }
        })
    }
}

const usersWelcomeLastNameField = document.querySelector("#usersWelcomeLastNameField")
const usersWelcomeLastNameError = document.querySelector("#usersWelcomeLastNameError")
const usersWelcomeFirstNameField = document.querySelector("#usersWelcomeFirstNameField")
const usersWelcomeFirstNameError = document.querySelector("#usersWelcomeFirstNameError")
const usersWelcomePatronymicField = document.querySelector("#usersWelcomePatronymicField")
const usersWelcomePatronymicError = document.querySelector("#usersWelcomePatronymicError")
const usersWelcomeEmailField = document.querySelector("#usersWelcomeEmailField")
const usersWelcomeEmailError = document.querySelector("#usersWelcomeEmailError")
const usersWelcomeBDateField = document.querySelector("#usersWelcomeBDateField")
const usersWelcomeBDateError = document.querySelector("#usersWelcomeBDateError")
const usersWelcomePlatformURL = document.querySelector("#usersWelcomePlatformURL")
const usersWelcomePasswordField = document.querySelector("#usersWelcomePasswordField")
const usersWelcomePasswordError = document.querySelector("#usersWelcomePasswordError")
const usersWelcomeGoButton = document.querySelector("#usersWelcomeGoButton")

const usersWelcomeCopyTGStartButton = document.querySelector("#usersWelcomeCopyTGStartButton")
const usersWelcomeCopyTGNicButton = document.querySelector("#usersWelcomeCopyTGNicButton")
const usersWelcomeCopyTGCommandButton = document.querySelector("#usersWelcomeCopyTGCommandButton")
const usersWelcomeCopyWebButton = document.querySelector("#usersWelcomeCopyWebButton")

welcomeMain()