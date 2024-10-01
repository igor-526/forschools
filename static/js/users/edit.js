function usersAdminEditMain(){
    formUserEditSaveButton.addEventListener('click', async function(){
        await usersAdminEditSaveUser(this.attributes.getNamedItem("data-user-id").value)
    })
    formUserEditActivateButton.addEventListener('click', async function(){
        await usersAdminUserActivation(this.attributes.getNamedItem("data-user-id").value,
            this.attributes.getNamedItem("data-action").value)
    })
    formUserEditChangePasswordButton.addEventListener('click', async function (){
        await usersAdminChangePasswordShow(this.attributes.getNamedItem("data-user-id").value)
    })

    if (canSetNewEngChLvlPrg){
        formUserEditEngagementChannelSelect.addEventListener('change', function () {
            if (this.value === 'new'){
                formUserEditEngagementChannelInput.classList.remove('d-none')
            } else {
                formUserEditEngagementChannelInput.classList.add('d-none')
            }
        })
        formUserEditLevelSelect.addEventListener('change', function () {
            if (this.value === 'new'){
                formUserEditLevelInput.classList.remove('d-none')
            } else {
                formUserEditLevelInput.classList.add('d-none')
            }
        })
    }
}

function formUserEditClientValidation(){
    let validationStatus = true

    formUserEditUsernameField.classList.remove("is-invalid")
    formUserEditLastNameField.classList.remove("is-invalid")
    formUserEditFirstNameField.classList.remove("is-invalid")
    formUserEditEmailField.classList.remove("is-invalid")
    formUserEditUsernameError.innerHTML = ""
    formUserEditLastNameError.innerHTML = ""
    formUserEditFirstNameError.innerHTML = ""
    formUserEditEmailErrors.innerHTML = ""
    const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu

    if(formUserEditUsernameField.value === ""){
        formUserEditUsernameField.classList.add("is-invalid")
        formUserEditUsernameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    if(formUserEditLastNameField.value === ""){
        formUserEditLastNameField.classList.add("is-invalid")
        formUserEditLastNameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    if(formUserEditFirstNameField.value === ""){
        formUserEditFirstNameField.classList.add("is-invalid")
        formUserEditFirstNameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    if(formUserEditEmailField.value !== ""){
        if (!EMAIL_REGEXP.test(formUserEditEmailField.value)){
            formUserEditEmailField.classList.add("is-invalid")
            formUserEditEmailErrors.innerHTML = "Проверьте корректность ввода email"
            validationStatus = false
        }
    }
    return validationStatus
}

function formUserEditServerValidation(errors){
    console.log(errors)
}

async function usersAdminEditSaveUser(userID) {
    if (formUserEditClientValidation()){
        const formData = new FormData(formUserEdit);
        if (formData.get("eng_channel") === "new" || formData.get("eng_channel") === "none"){
            formData.delete("eng_channel")
        }
        if (formData.get("eng_channel_new") === ""){
            formData.delete("eng_channel_new")
        }
        if (formData.get("lvl") === "new" || formData.get("lvl") === "none"){
            formData.delete("lvl")
        }
        if (formData.get("lvl_new") === ""){
            formData.delete("lvl_new")
        }
        if (formData.get("prog_new") === ""){
            formData.delete("prog_new")
        }
        await usersAPIUpdateUser(formData, userID).then(response => {
            if (response.status === 200){
                bsOffcanvasUser.hide()
                showToast("Изменение пользователя", "Пользователь успешно изменён")
                usersAdminMain()
            } else if (response.status === 400){
                formUserEditServerValidation(response.response)
            } else {
                bsOffcanvasUser.hide()
                showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
            }
        })
    }
}

async function usersAdminShowUser(userID){
    formUserEdit.reset()
    await usersAPIGetUser(userID).then(request => {
        switch (request.status){
            case 200:
                if (request.response.can_deactivate){
                    formUserEditActivateButton.classList.remove("d-none")
                    if (request.response.is_active){
                        formUserEditActivateButton.classList.add("btn-danger")
                        formUserEditActivateButton.classList.remove("btn-warning")
                        formUserEditActivateButton.innerHTML = "Деактивировать"
                        formUserEditActivateButton.setAttribute("data-action", "deactivate")
                    } else {
                        formUserEditActivateButton.classList.remove("btn-danger")
                        formUserEditActivateButton.classList.add("btn-warning")
                        formUserEditActivateButton.innerHTML = "Активировать"
                        formUserEditActivateButton.setAttribute("data-action", "activate")
                    }
                }
                else {
                    formUserEditActivateButton.classList.add("d-none")
                }

                if (request.response.engagement_channel){
                    formUserEditEngagementChannelSelect.value = request.response.engagement_channel.name
                }
                if (request.response.level){
                    formUserEditLevelSelect.value = request.response.level.name
                }
                formUserEditUsernameField.value = request.response.username
                formUserEditLastNameField.value = request.response.last_name
                formUserEditFirstNameField.value = request.response.first_name
                request.response.groups.forEach(group => {
                    switch (group.name) {
                        case "Admin":
                            formUserCheckboxAdmin.checked = true
                            break
                        case "Metodist":
                            formUserCheckboxMetodist.checked = true
                            break
                        case "Teacher":
                            formUserCheckboxTeacher.checked = true
                            break
                        case "Curator":
                            formUserCheckboxCurator.checked = true
                            break
                        case "Listener":
                            formUserCheckboxListener.checked = true
                            break
                    }
                })
                formUserEditEmailField.value = request.response.email
                formUserEditBDate.value = request.response.bdate
                photoImage.src = request.response.photo
                const activityDate = new Date(request.response.last_activity)
                const registrationDate = new Date(request.response.date_joined)
                formUserShowLastActivity.innerHTML = `Последняя активность: ${activityDate.toLocaleString()}`
                formUserShowRegistrationDate.innerHTML = `Дата регистрации: ${registrationDate.toLocaleDateString()}`
                bsOffcanvasUser.show()
                console.log(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
    // if (userObj){
    //
    //     formUserEditProgress.value = userObj.progress
    //     formUserEditWorkExperience.value = userObj.work_experience
    //     formUserEditPrivateLessons.checked = userObj.private_lessons
    //     formUserEditGroupLessons.checked = userObj.group_lessons
    //     formUserEditNote.value = userObj.note
    //
    //     bsOffcanvasUser.show()
    //     const actionButtons = [
    //         formUserEditActivateButton,
    //         formUserEditChangePasswordButton,
    //         formUserEditTelegramButton,
    //         formUserEditSaveButton,
    //         formPhoto]
    //     actionButtons.forEach(button => {
    //         button.setAttribute("data-user-id", userObj.id)
    //     })
    // }

}

async function usersAdminUserActivation(userID, action){
    await usersAPIDeactivate(userID, action).then(async response => {
        bsOffcanvasUser.hide()
        if (response.status === 200) {
            showToast("Изменение пользователя", "Пользователь успешно активирован")
            await usersAdminGetAll()
            usersAdminShow()
        } else if (response.status === 403){
            showToast("Ошибка", "У вас нет прав на это действие")
        } else {
            showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
        }
    })
}

const bsOffcanvasUser = new bootstrap
    .Offcanvas(document.querySelector("#offcanvasUser"))

//  Forms (EditUser)
const formUserEdit = document.querySelector("#formUserEdit")
const formUserEditUsernameField = formUserEdit.querySelector("#UserShowUsernameField")
const formUserEditUsernameError = formUserEdit.querySelector("#UserShowUsernameErrors")
const formUserEditLastNameField = formUserEdit.querySelector("#UserShowLastNameField")
const formUserEditLastNameError = formUserEdit.querySelector("#UserShowLastNameErrors")
const formUserEditFirstNameField = formUserEdit.querySelector("#UserShowFirstNameField")
const formUserEditFirstNameError = formUserEdit.querySelector("#UserShowFirstNameErrors")
const formUserEditEmailField = formUserEdit.querySelector("#UserShowEmailField")
const formUserEditEmailErrors = formUserEdit.querySelector("#UserShowEmailErrors")

const formUserCheckboxAdmin = formUserEdit.querySelector("#UserShowRoleCheckboxAdmin")
const formUserCheckboxMetodist = formUserEdit.querySelector("#UserShowRoleCheckboxMetodist")
const formUserCheckboxTeacher = formUserEdit.querySelector("#UserShowRoleCheckboxTeacher")
const formUserCheckboxCurator = formUserEdit.querySelector("#UserShowRoleCheckboxCurator")
const formUserCheckboxListener = formUserEdit.querySelector("#UserShowRoleCheckboxListener")

const formUserEditBDate = formUserEdit.querySelector("#UserShowBDateField")
const formUserEditPrivateLessons = formUserEdit.querySelector("#UserShowPrivateLessonsField")
const formUserEditPrivateLessonsBlock = formUserEdit.querySelector("#UserShowPrivateLessonsBlock")
const formUserEditGroupLessons = formUserEdit.querySelector("#UserShowGroupLessonsField")
const formUserEditGroupLessonsBlock = formUserEdit.querySelector("#UserShowGroupLessonsBlock")
const formUserEditProgress = formUserEdit.querySelector("#UserShowProgressField")
const formUserEditProgressBlock = formUserEdit.querySelector(".UserShowProgressBlock")
const formUserEditLevelSelect = formUserEdit.querySelector("#UserShowLevelField")
const formUserEditLevelInput = formUserEdit.querySelector("#UserNewLevelField")
const formUserEditLevelBlock = formUserEdit.querySelector(".UserShowLevelBlock")
const formUserEditWorkExperience = formUserEdit.querySelector("#UserShowWorkExperienceField")
const formUserEditWorkBlock = formUserEdit.querySelector(".UserShowWorkExperienceBlock")
const formUserEditNote = formUserEdit.querySelector("#UserShowNoteField")
const formUserEditNoteBlock = formUserEdit.querySelector(".UserShowNoteBlock")
const formUserEditEngagementChannelSelect = formUserEdit.querySelector("#UserShowEngagementChannelField")
const formUserEditEngagementChannelInput = formUserEdit.querySelector("#UserNewEngagementChannelField")
const formUserEditEngagementChannelBlock = formUserEdit.querySelector(".UserShowEngagementChannelBlock")
const formUserShowLastActivity = formUserEdit.querySelector("#UserShowLastActivity")
const formUserShowRegistrationDate = formUserEdit.querySelector("#UserShowRegistrationDate")
const formUserEditSaveButton = formUserEdit.querySelector("#UserShowSaveButton")
const formUserEditActivateButton = formUserEdit.querySelector("#UserShowActivateButton")
const formUserEditChangePasswordButton = formUserEdit.querySelector("#UserShowChangePasswordButton")
const formUserEditTelegramButton = formUserEdit.querySelector("#UserShowTelegramButton")

const formPhoto = document.querySelector("#formUserPhoto")
const photoChange = formPhoto.querySelector("#UserShowPhotoChangeField")
const photoDelete = formPhoto.querySelector("#UserShowPhotoDelButton")

usersAdminEditMain()
