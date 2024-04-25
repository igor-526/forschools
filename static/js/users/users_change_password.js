function usersAdminChanegPasswordMain(){
    changePasswordModalChangeButton.addEventListener("click", async function(){
        const userID = changePasswordModalChangeButton.attributes.getNamedItem("data-user-id").value
        await usersAdminChangePassword(userID)
    })
}

function usersAdminChangePasswordClientValidation(){
    let validationStatus = true
    changePasswordModalField.classList.remove("is-invalid")
    changePasswordModalError.innerHTML = ""

    if (changePasswordModalField.value === ""){
        changePasswordModalField.classList.add("is-invalid")
        changePasswordModalError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    return validationStatus
}

function usersAdminChangePasswordServerValidation(errors){
    changePasswordModalField.classList.add("is-invalid")
    changePasswordModalError.innerHTML = "Поле не может быть пустым"
    errors.password.map(function (error) {
        changePasswordModalError.insertAdjacentHTML("beforeend", `<br>${error}`)
    })
}

function usersAdminChangePasswordShow(userID){
    changePasswordModalForm.reset()
    bsChangePasswordModal.show()
    changePasswordModalChangeButton.attributes.getNamedItem("data-user-id").value = userID
}

async function usersAdminChangePassword(userID){
    if (usersAdminChangePasswordClientValidation()){
        await usersAPIChangePassword(new FormData(changePasswordModalForm), userID).then(async response => {
            if (response.status === 200){
                bsChangePasswordModal.hide()
                changePasswordModalForm.reset()
                if (tgAction === "admin"){
                    bsOffcanvasUser.hide()
                }
                showToast("Смена пароля", "Пароль успешно сменён")
            } else if (response.status === 400) {
                usersAdminChangePasswordServerValidation(response.response)
            } else if (response.status === 403) {
                bsChangePasswordModal.hide()
                changePasswordModalForm.reset()
                showToast("Ошибка", "У вас нет прав на изменение пароля данного пользователя")
            } else {
                bsChangePasswordModal.hide()
                changePasswordModalForm.reset()
                showToast("Ошибка", "На сервере произошла ошибка. Обновите страницу или попробуйте позже")
            }
        })
    }
}


//Bootstrap Elements
const changePasswordModal = document.querySelector("#UserChangePasswordModal")
const bsChangePasswordModal = new bootstrap.Modal(changePasswordModal)

//Form
const changePasswordModalForm = changePasswordModal.querySelector("#UserChangePasswordModalForm")
const changePasswordModalField = changePasswordModal.querySelector("#UserChangePasswordModalField")
const changePasswordModalError = changePasswordModal.querySelector("#UserChangePasswordModalError")
const changePasswordModalChangeButton = changePasswordModal.querySelector("#UserChangePasswordModalChangeButton")

usersAdminChanegPasswordMain()
