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
        if (infoText){
            const pText = document.createElement("p")
            pText.innerHTML = infoText
            mainDiv.insertAdjacentElement("beforeend", pText)
        }
        const ul = document.createElement("ul")
        ul.classList.add("list_group")
        itemList.forEach(item => {
            const li = document.createElement("li")
            li.classList.add("list-group-item")
            li.innerHTML = href ? `<a href="/${href}/${item.id}">${item.name}</a>` : item.name
            mainDiv.insertAdjacentElement("beforeend", li)
        })

        return mainDiv
    }

    function setDeactivationErrorBody(info){
        usersEditActivationModalBody.innerHTML = ""
        const pInfo = document.createElement("p")
        pInfo.innerHTML = "Пользователь не может быть деактивирован из за следующих ошибок:"
        usersEditActivationModalBody.insertAdjacentElement("beforeend", pInfo)
        if (info.group_chats){
            getInfoList("Пользователь состоит в следующих групповых чатах. Необходимо удалить пользователя")
        }
        if (info.group_chats){
            getInfoList("Пользователь состоит в следующих групповых чатах. Необходимо удалить пользователя")
        }
        if (info.group_chats){
            getInfoList("Пользователь состоит в следующих групповых чатах. Необходимо удалить пользователя")
        }
        if (info.group_chats){
            getInfoList("Пользователь состоит в следующих групповых чатах. Необходимо удалить пользователя")
        }
        if (info.group_chats){
            getInfoList("Пользователь состоит в следующих групповых чатах. Необходимо удалить пользователя")
        }
        if (info.group_chats){
            getInfoList("Пользователь состоит в следующих групповых чатах. Необходимо удалить пользователя")
        }
        if (info.group_chats){
            getInfoList("Пользователь состоит в следующих групповых чатах. Необходимо удалить пользователя")
        }
        if (info.group_chats){
            getInfoList("Пользователь состоит в следующих групповых чатах. Необходимо удалить пользователя")
        }
        if (info.group_chats){
            getInfoList("Пользователь состоит в следующих групповых чатах. Необходимо удалить пользователя")
        }
        if (info.group_chats){
            getInfoList("Пользователь состоит в следующих групповых чатах. Необходимо удалить пользователя")
        }
        if (info.group_chats){
            getInfoList("Пользователь состоит в следующих групповых чатах. Необходимо удалить пользователя")
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
