function usersEditFunctionsMain(){
    usersEditChangePasswordModalChangeButton.addEventListener("click", usersEditFunctionsChangePasswordChange)
    usersEditLoginModalButton.addEventListener("click", usersEditFunctionsLogin)
    usersEditActivationModalButton.addEventListener("click", usersEditFunctionsSetActivationStatus)
}

function usersEditFunctionsChangePasswordResetModal(validationOnly=false){
    function resetValidation(){
        usersEditChangePasswordModalField.classList.remove("is-invalid")
        usersEditChangePasswordModalFieldError.innerHTML = ""
    }

    resetValidation()
    if (!validationOnly){
        usersEditChangePasswordModalForm.reset()
    }
}

function usersEditFunctionsChangePasswordSetModal(){
    usersEditFunctionsChangePasswordResetModal()
    bsUsersEditChangePasswordModal.show()
}

function usersEditFunctionsChangePasswordValidation(errors = null){
    function setInvalid(error){
        usersEditChangePasswordModalField.classList.add("is-invalid")
        usersEditChangePasswordModalFieldError.innerHTML = error
        validationStatus = false
    }

    function validatePassword(){
        if (usersEditChangePasswordModalField.value.trim() === ""){
            setInvalid("Поле не может быть пустым")
        }
    }

    let validationStatus = true
    usersEditFunctionsChangePasswordResetModal(true)
    if (errors){
        let errorsString = ""
        errors.password.forEach(error => {
            errorsString += `<br>${error}`
        })
        setInvalid(errorsString)
    } else {
        validatePassword()
    }
    return validationStatus
}

function usersEditFunctionsChangePasswordChange(){
    function getFD(){
        const fd = new FormData(usersEditChangePasswordModalForm)
        const pass = fd.get("password")
        fd.set("password", pass.trim())
        return fd
    }

    if (usersEditFunctionsChangePasswordValidation()){
        usersAPIChangePassword(getFD(), selectedUserID).then(request => {
            switch (request.status){
                case 200:
                    bsUsersEditChangePasswordModal.hide()
                    bsOffcanvasUsersEdit.hide()
                    showSuccessToast("Пароль успешно изменён")
                    break
                case 403:
                    bsUsersEditChangePasswordModal.hide()
                    bsOffcanvasUsersEdit.hide()
                    showSuccessToast("У Вас нет прав на изменение пароля этого пользователя")
                    break
                case 400:
                    usersEditFunctionsChangePasswordValidation(request.response)
                    break
                default:
                    bsUsersEditChangePasswordModal.hide()
                    bsOffcanvasUsersEdit.hide()
                    showErrorToast()
                    break
            }
        })
    }
}

function usersEditFunctionsLoginSetModal(){
    bsUsersEditLoginModal.show()
}

function usersEditFunctionsLogin(){
    usersAPIAdminLogin(selectedUserID).then(request =>{
        bsUsersEditLoginModal.hide()
        bsOffcanvasUsersEdit.hide()
        switch (request.status) {
            case 200:
                showSuccessToast("Вы успешно авторизовались")
                setTimeout(function () {
                    window.location.replace("/dashboard")
                }, 500)
                break
            case 403:
                showErrorToast(request.response.error)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function usersEditFunctionsSetActivationStatus(){
    const action = this.attributes.getNamedItem("data-action").value
    usersAPIDeactivate(selectedUserID, action).then(request => {
        bsUsersEditActivationModal.hide()
        bsOffcanvasUsersEdit.hide()
        switch (request.status){
            case 200:
                switch (action){
                    case "activate":
                        showSuccessToast("Пользователь успешно активирован")
                        selectedUserIDElement.classList.remove("table-danger")
                        break
                    case "deactivate":
                        showSuccessToast("Пользователь успешно деактивирован")
                        selectedUserIDElement.classList.add("table-danger")
                        break
                }
                break
            default:
                showErrorToast()
                break
        }
    })
}

function usersEditFunctionsActivationSetModal(){
    function getInfoList(infoText=null, itemList=[], href=null){
        const mainDiv = document.createElement("div")
        mainDiv.classList.add("mb-4")
        if (infoText){
            const pText = document.createElement("p")
            pText.innerHTML = infoText
            mainDiv.insertAdjacentElement("beforeend", pText)
        }
        const ul = document.createElement("ul")
        ul.classList.add("list-group")
        itemList.forEach(item => {
            const li = document.createElement("li")
            li.classList.add("list-group-item")
            li.innerHTML = href ? `<a href="/${href}/${item.id}">${item.name}</a>` : item.name
            ul.insertAdjacentElement("beforeend", li)
        })
        mainDiv.insertAdjacentElement("beforeend", ul)
        return mainDiv
    }

    function setDeactivationErrorBody(info){
        usersEditActivationModalBody.innerHTML = ""
        const pInfo = document.createElement("p")
        pInfo.innerHTML = "Пользователь не может быть деактивирован из за следующих ошибок:"
        usersEditActivationModalBody.insertAdjacentElement("beforeend", pInfo)
        if (info.group_chats){
            usersEditActivationModalBody.insertAdjacentElement("beforeend",
                getInfoList("Пользователь состоит в следующих групповых чатах. Необходимо удалить пользователя",
                    info.group_chats))
        }
        if (info.group_chats_admin){
            usersEditActivationModalBody.insertAdjacentElement("beforeend",
                getInfoList("Пользователь является администратором в следующих групповых чатах. Необходимо " +
                    "сменить администратора",
                    info.group_chats_admin))
        }
        if (info.homework_teacher){
            usersEditActivationModalBody.insertAdjacentElement("beforeend",
                getInfoList("Пользователь является проверяющим следующих незакрытых ДЗ. Необходимо принять или " +
                    "отменить ДЗ, либо сменить проверяющего ДЗ",
                    info.homework_teacher, "homeworks"))
        }
        if (info.homework_listener){
            usersEditActivationModalBody.insertAdjacentElement("beforeend",
                getInfoList("Пользователь является учеником следующих незакрытых ДЗ. Необходимо принять или " +
                    "отменить ДЗ",
                    info.homework_listener, "homeworks"))
        }
        if (info.plan_curator){
            usersEditActivationModalBody.insertAdjacentElement("beforeend",
                getInfoList("Пользователь является куратором незакрытого плана обучения. Необходимо сменить " +
                    "куратора или закрыть план обучения",
                    info.plan_curator, "learning_plans"))
        }
        if (info.plan_listeners){
            usersEditActivationModalBody.insertAdjacentElement("beforeend",
                getInfoList("Пользователь является учеником незакрытого плана обучения. Необходимо закрыть " +
                    "план обучения",
                    info.plan_listeners, "learning_plans"))
        }
        if (info.plan_methodist){
            usersEditActivationModalBody.insertAdjacentElement("beforeend",
                getInfoList("Пользователь является методистом незакрытого плана обучения. Необходимо сменить " +
                    "методиста или закрыть план обучения",
                    info.plan_methodist, "learning_plans"))
        }
        if (info.plan_teacher){
            usersEditActivationModalBody.insertAdjacentElement("beforeend",
                getInfoList("Пользователь является преподавателем незакрытого плана обучения. Необходимо закрыть " +
                    "план обучения",
                    info.plan_teacher, "learning_plans"))
        }
        if (info.plan_hw_teacher){
            usersEditActivationModalBody.insertAdjacentElement("beforeend",
                getInfoList("Пользователь является проверяющим ДЗ незакрытого плана обучения. Необходимо сменить " +
                    "проверяющего ДЗ или закрыть план обучения",
                    info.plan_hw_teacher, "learning_plans"))
        }
        if (info.lesson_replace_teacher){
            usersEditActivationModalBody.insertAdjacentElement("beforeend",
                getInfoList("Пользователь является замещающим преподавателем непроведённого занятия. Необходимо " +
                    "сменить замещающего преподавателя, провести занятие или отменить его",
                    info.lesson_replace_teacher, "lessons"))
        }
    }

    const action = this.attributes.getNamedItem("data-action").value
    usersEditActivationModalButton.setAttribute("data-action", action)
    switch (action){
        case "activate":
            usersEditActivationTitle.innerHTML = "Активация"
            usersEditActivationModalBody.innerHTML = "После активации пользователя он будет показываться в списках " +
                "для выбора.<br>Пользователь сможет войти на платформу и использовать бот Telegram"
            usersEditActivationModalButton.innerHTML = "Активировать"
            usersEditActivationModalButton.classList.remove("btn-danger")
            usersEditActivationModalButton.classList.add("btn-primary")
            usersEditActivationModalButton.disabled = false
            break
        case "deactivate":
            usersEditActivationTitle.innerHTML = "Деактивация"
            usersEditActivationModalButton.innerHTML = "Деактивировать"
            usersEditActivationModalButton.classList.add("btn-danger")
            usersEditActivationModalButton.classList.remove("btn-primary")
            usersAPIDeactivateInfo(selectedUserID).then(request => {
                switch (request.status){
                    case 200:
                        if (request.response.can_deactivate){
                            usersEditActivationModalBody.innerHTML = "После деактивации пользователя он не будет " +
                                "показываться в списках для выбора.<br>Пользователь не сможет войти на платформу и " +
                                "использовать бот Telegram.<br>Рассылка продолжит поступать на Telegram и e-mail"
                            usersEditActivationModalButton.disabled = false
                        } else {
                            usersEditActivationModalButton.disabled = true
                            setDeactivationErrorBody(request.response)
                        }
                        break
                    default:
                        break
                }
            })
            break
    }
    bsUsersEditActivationModal.show()
}


//Bootstrap Elements
const usersEditChangePasswordModal = document.querySelector("#usersEditChangePasswordModal")
const bsUsersEditChangePasswordModal = new bootstrap.Modal(usersEditChangePasswordModal)
const usersEditLoginModal = document.querySelector("#usersEditLoginModal")
const bsUsersEditLoginModal = new bootstrap.Modal(usersEditLoginModal)
const usersEditActivationModal = document.querySelector("#usersEditActivationModal")
const bsUsersEditActivationModal = new bootstrap.Modal(usersEditActivationModal)


//Reset Password
const usersEditChangePasswordModalForm = usersEditChangePasswordModal.querySelector("#usersEditChangePasswordModalForm")
const usersEditChangePasswordModalField = usersEditChangePasswordModalForm.querySelector("#usersEditChangePasswordModalField")
const usersEditChangePasswordModalFieldError = usersEditChangePasswordModalForm.querySelector("#usersEditChangePasswordModalFieldError")
const usersEditChangePasswordModalSendEmail = usersEditChangePasswordModalForm.querySelector("#usersEditChangePasswordModalSendEmail")
const usersEditChangePasswordModalSendTG = usersEditChangePasswordModalForm.querySelector("#usersEditChangePasswordModalSendTG")
const usersEditChangePasswordModalChangeButton = usersEditChangePasswordModal.querySelector("#usersEditChangePasswordModalChangeButton")

//Login
const usersEditLoginModalButton = usersEditLoginModal.querySelector("#usersEditLoginModalButton")

//Activation
const usersEditActivationTitle = usersEditActivationModal.querySelector("#usersEditActivationTitle")
const usersEditActivationModalBody = usersEditActivationModal.querySelector("#usersEditActivationModalBody")
const usersEditActivationModalButton = usersEditActivationModal.querySelector("#usersEditActivationModalButton")

usersEditFunctionsMain()
