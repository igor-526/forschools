function usersAdminRegistrationMain(){
    formRegistrationButtonRegister.addEventListener('click', usersAdminRegistrationRegister)
}

function usersAdminRegistrationClientValidation(){
    let validationStatus = true
    formRegistrationUsernameField.classList.remove("is-invalid")
    formRegistrationLastNameField.classList.remove("is-invalid")
    formRegistrationFirstNameField.classList.remove("is-invalid")
    formRegistrationPasswordField.classList.remove("is-invalid")
    formRegistrationUsernameError.innerHTML = ""
    formRegistrationNameError.innerHTML = ""
    formRegistrationPasswordError.innerHTML = ""

    if(formRegistrationUsernameField.value === ""){
        formRegistrationUsernameField.classList.add("is-invalid")
        formRegistrationUsernameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    if(formRegistrationLastNameField.value === ""){
        formRegistrationLastNameField.classList.add("is-invalid")
        formRegistrationNameError.innerHTML = "Оба поля обязательны к заполнению"
        validationStatus = false
    }

    if(formRegistrationFirstNameField.value === ""){
        formRegistrationFirstNameField.classList.add("is-invalid")
        formRegistrationNameError.innerHTML = "Оба поля обязательны к заполнению"
        validationStatus = false
    }

    if(formRegistrationPasswordField.value === ""){
        formRegistrationPasswordField.classList.add("is-invalid")
        formRegistrationPasswordError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    return validationStatus
}

function usersAdminRegistrationServerValidation(errors) {

    if (errors.username) {
        formRegistrationUsernameField.classList.add("is-invalid")
        formRegistrationUsernameError.innerHTML = errors.username
    }
    if (errors.password1) {
        formRegistrationPasswordField.classList.add("is-invalid")
        formRegistrationPasswordError.innerHTML = `${errors.password1}<br>`
    }
    if (errors.password2) {
        formRegistrationPasswordField.classList.add("is-invalid")
        formRegistrationPasswordError.innerHTML = `${errors.password2}`
    }
}

async function usersAdminRegistrationRegister(){
    const validationStatus = usersAdminRegistrationClientValidation()
    if (validationStatus){
        const data = new FormData(formRegistration);
        data.append("password2", data.get('password1'))
        await usersAPIRegistration(data).then(async response => {
            if (response.status === 200){
                bsOffcanvasRegister.hide()
                formRegistration.reset()
                showToast("Регистрация пользователя", "Пользователь успешно зарегистрирован")
                await usersAdminGetAll()
                usersAdminShow()
            } else if (response.status === 400) {
                usersAdminRegistrationServerValidation(response.response)
            } else {
                showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
            }
        })
    }
}

const bsOffcanvasRegister = new bootstrap
    .Offcanvas(document.querySelector("#offcanvasRegister"))

//Forms
const formRegistration = document.querySelector('#formRegistration')

//Registraion Form
const formRegistrationUsernameField = formRegistration.querySelector("#RegisterUserUsernameField")
const formRegistrationUsernameError = formRegistration.querySelector("#RegisterUserUsernameError")
const formRegistrationLastNameField = formRegistration.querySelector("#RegisterUserLastNameField")
const formRegistrationFirstNameField = formRegistration.querySelector("#RegisterUserFirstNameField")
const formRegistrationNameError = formRegistration.querySelector("#RegisterUserNameField")
const formRegistrationPasswordField = formRegistration.querySelector("#RegisterUserPasswordField")
const formRegistrationPasswordError = formRegistration.querySelector("#RegisterUserPasswordErrors")
const formRegistrationButtonRegister = formRegistration.querySelector("#UserRegistrationButton")

usersAdminRegistrationMain()