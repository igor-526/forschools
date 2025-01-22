function clientEditValidation() {
    let validationStatus = true

    profileEditFirstNameField.classList.remove("is-invalid")
    profileEditLastNameField.classList.remove("is-invalid")
    profileEditEmailField.classList.remove("is-invalid")
    profileEditFirstNameErrors.innerHTML = ""
    profileEditLastNameErrors.innerHTML = ""
    profileEditEmailErrors.innerHTML = ""
    const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu

    if (profileEditFirstNameField.value === ""){
        profileEditFirstNameField.classList.add("is-invalid")
        profileEditFirstNameErrors.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    if (profileEditLastNameField.value === ""){
        profileEditLastNameField.classList.add("is-invalid")
        profileEditLastNameErrors.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    if (profileEditEmailField.value !== ""){
        if (!EMAIL_REGEXP.test(profileEditEmailField.value)){
            profileEditEmailField.classList.add("is-invalid")
            profileEditEmailErrors.innerHTML = "Проверьте корректность ввода email"
            validationStatus = false
        }
    }


    return validationStatus
}

function serverEditValidation(errors) {

}

async function saveEdit() {
    if (clientEditValidation()){
        const response = await fetch(`/api/v1/users/${userID}/`, {
            method: 'PATCH',
            credentials: 'same-origin',
            headers:{
                "X-CSRFToken": csrftoken,
            },
            body: new FormData(formProfileEdit)
        })
        if (response.status === 200){
            bsOffcanvasEdit.hide()
            showToast("Успешно", "Профиль отредактирован. Обновите страницу")
        } else if (response.status === 400) {
            await response.json()
                .then(errors => serverEditValidation(errors))
        } else {
            bsOffcanvasEdit.hide()
            showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
        }
    }
}


const formProfileEdit = document.querySelector("#formProfileEdit")

// Edit Form
const profileEditFirstNameField = formProfileEdit.querySelector("#ProfileEditFirstNameField")
const profileEditFirstNameErrors = formProfileEdit.querySelector("#ProfileEditFirstNameErrors")
const profileEditLastNameField = formProfileEdit.querySelector("#ProfileEditLastNameField")
const profileEditLastNameErrors = formProfileEdit.querySelector("#ProfileEditLastNameErrors")
const profileEditEmailField = formProfileEdit.querySelector("#ProfileEditEmailField")
const profileEditEmailErrors = formProfileEdit.querySelector("#ProfileEditEmailErrors")
const profileEditBdateField = formProfileEdit.querySelector("#ProfileEditBdateField")
const profileEditSaveButton = formProfileEdit.querySelector("#ProfileEditSaveButton")
const profileEditChangePasswordButton = formProfileEdit.querySelector("#ProfileEditChangePasswordButton")

profileEditSaveButton.addEventListener("click", saveEdit)
profileEditChangePasswordButton.addEventListener("click", function () {
    usersAdminChangePasswordShow(userID)
})