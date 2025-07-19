function welcomeMain(){
    usersWelcomePlatformURL.innerHTML = location.host
    welcomeSetPassword()
    usersWelcomeGoButton.addEventListener("click", welcomeGoNext)
}

function welcomeSetPassword(){
    usersWelcomePasswordField.value = generatePassword(8)
}

function welcomeValidateGetFD(errors=null){
    usersWelcomeLastNameField.classList.remove("is-invalid")
    usersWelcomeFirstNameField.classList.remove("is-invalid")
    usersWelcomePatronymicField.classList.remove("is-invalid")
    usersWelcomeEmailField.classList.remove("is-invalid")
    usersWelcomeBDateField.classList.remove("is-invalid")
    usersWelcomePasswordField.classList.remove("is-invalid")
    usersWelcomeLastNameError.innerHTML = ""
    usersWelcomeFirstNameError.innerHTML = ""
    usersWelcomePatronymicError.innerHTML = ""
    usersWelcomeEmailError.innerHTML = ""
    usersWelcomeBDateError.innerHTML = ""
    usersWelcomePasswordError.innerHTML = ""

    let validationStatus = true
    let goTo = null

    const lastNameValue = usersWelcomeLastNameField.value.trim()
    const firstNameValue = usersWelcomeFirstNameField.value.trim()
    const patronymicValue = usersWelcomePatronymicField.value.trim()
    const emailValue = usersWelcomeEmailField.value.trim()

    if (lastNameValue.length === 0){
        usersWelcomeLastNameField.classList.add("is-invalid")
        usersWelcomeLastNameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
        goTo = usersWelcomeLastNameField
    }

    if (lastNameValue.length > 50){
        usersWelcomeLastNameField.classList.add("is-invalid")
        usersWelcomeLastNameError.innerHTML = `Длина не может превышать 50 символов. У вас ${lastNameValue.length}`
        validationStatus = false
        if (!goTo){
            goTo = usersWelcomeLastNameField
        }
    }

    if (firstNameValue.length === 0){
        usersWelcomeFirstNameField.classList.add("is-invalid")
        usersWelcomeFirstNameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
        if (!goTo){
            goTo = usersWelcomeFirstNameField
        }
    }

    if (firstNameValue.length > 50){
        usersWelcomeFirstNameField.classList.add("is-invalid")
        usersWelcomeFirstNameError.innerHTML = `Длина не может превышать 50 символов. У вас ${firstNameValue.length}`
        validationStatus = false
        if (!goTo){
            goTo = usersWelcomeFirstNameField
        }
    }

    if (patronymicValue.length > 50){
        usersWelcomePatronymicField.classList.add("is-invalid")
        usersWelcomePatronymicError.innerHTML = `Длина не может превышать 50 символов. У вас ${firstNameValue.length}`
        validationStatus = false
        if (!goTo){
            goTo = usersWelcomePatronymicField
        }
    }

    if (usersWelcomePasswordField.value.length === 0){
        usersWelcomePasswordField.classList.add("is-invalid")
        usersWelcomePasswordError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
        if (!goTo){
            goTo = usersWelcomePasswordField
        }
    }

    if (goTo){
        goTo.scrollIntoView({block: "start", behavior: "smooth"})
    }

    return validationStatus

}

function welcomeGoNext(){
    welcomeValidateGetFD()
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

welcomeMain()