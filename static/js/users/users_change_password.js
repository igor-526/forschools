function changePasswordClientValidation(){
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

function changePasswordServerValidation(errors){
    changePasswordModalField.classList.add("is-invalid")
    changePasswordModalError.innerHTML = "Поле не может быть пустым"
    errors.password.map(function (error) {
        changePasswordModalError.insertAdjacentHTML("beforeend", `<br>${error}`)
    })
}

function changePasswordShow(UID){
    changePasswordModalForm.reset()
    bsChangePasswordModal.show()
    changePasswordModalChangeButton.attributes.getNamedItem("data-user-id").value = UID
}

async function changePassword(){
    if (changePasswordClientValidation()){
        const userID = this.attributes.getNamedItem("data-user-id").value
        const response = await fetch(`/api/v1/users/${userID}/reset_password/`, {
            method: 'patch',
            credentials: 'same-origin',
            headers:{
                "X-CSRFToken": csrftoken,
            },
            body: new FormData(changePasswordModalForm)
        })
        if (response.status === 200){
            bsChangePasswordModal.hide()
            changePasswordModalForm.reset()
            showToast("Смена пароля", "Пароль успешно сменён")
        } else if (response.status === 400){
            changePasswordServerValidation(await response.json())
        } else {
            bsChangePasswordModal.hide()
            changePasswordModalForm.reset()
            showToast("Ошибка", "На сервере произошла ошибка. Обновите страницу или попробуйте позже")
        }
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

changePasswordModalChangeButton.addEventListener("click", changePassword)


