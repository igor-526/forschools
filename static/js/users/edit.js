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

async function saveUser() {
    const validationStatus = formUserEditClientValidation()
    if (validationStatus){
        const userID = formUserEdit.attributes.getNamedItem('data-user-id').value
        const formData = new FormData(formUserEdit);
        if (formData.get("eng_channel") === "new" || formData.get("eng_channel") == null){
            formData.delete("eng_channel")
        }
        if (formData.get("lvl") === "new" || formData.get("lvl") == null){
            formData.delete("lvl")
        }
        const response = await fetch(`/api/v1/users/${userID}/`, {
            method: 'patch',
            credentials: 'same-origin',
            headers:{
                "X-CSRFToken": csrftoken,
            },
            body: formData
        })
        if (response.status === 200){
            bsOffcanvasUser.hide()
            showToast("Изменение пользователя", "Пользователь успешно изменён")
            await getUsers()
            showUsers()
        } else if (response.status === 400){
            await response.json().then(errors => formUserEditServerValidation(errors))
        } else {
            bsOffcanvasUser.hide()
            showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
        }

    }

}

function permsEdit(state){
    formUserEditUsernameField.disabled = state
    formUserEditLastNameField.disabled = state
    formUserEditFirstNameField.disabled = state
    formUserEditEmailField.disabled = state
    formUserEditBDate.disabled = state
    formUserEditPrivateLessons.disabled = state
    formUserEditGroupLessons.disabled = state
    formUserEditProgramSelect.disabled = state
    formUserEditProgramInput.disabled = state
    formUserEditProgress.disabled = state
    formUserEditLevelSelect.disabled = state
    formUserEditLevelInput.disabled = state
    formUserEditWorkExperience.disabled = state
    formUserEditNote.disabled = state
    formUserEditEngagementChannelSelect.disabled = state
    formUserEditEngagementChannelInput.disabled = state
    formUserEditSaveButton.disabled = state
}

function permsMoreInfo(state) {
    if (state) {
        formUserEditWorkBlock.classList.remove("d-none")
        formUserEditNoteBlock.classList.remove("d-none")
        formUserEditEngagementChannelBlock.classList.remove("d-none")

    } else {
        formUserEditWorkBlock.classList.add("d-none")
        formUserEditNoteBlock.classList.add("d-none")
        formUserEditEngagementChannelBlock.classList.add("d-none")
    }
}

function setupPerms(group){
    console.log(group)
    console.log(userPermissions)
    formUserEditRole.disabled = userPermissions.permissions.indexOf("auth.register_users") === -1;
    formUserEditPrivateLessonsBlock.classList.add("d-none")
    formUserEditGroupLessonsBlock.classList.add("d-none")
    formUserEditProgramBlock.classList.add("d-none")
    formUserEditProgressBlock.classList.add("d-none")
    formUserEditLevelBlock.classList.add("d-none")
    formUserEditWorkBlock.classList.add("d-none")
    formUserEditNoteBlock.classList.add("d-none")
    formUserEditEngagementChannelBlock.classList.add("d-none")


    if (group === "Listener"){
        formUserEditPrivateLessonsBlock.classList.remove("d-none")
        formUserEditGroupLessonsBlock.classList.remove("d-none")
        formUserEditProgramBlock.classList.remove("d-none")
        formUserEditProgressBlock.classList.remove("d-none")
        formUserEditLevelBlock.classList.remove("d-none")
        formUserEditNoteBlock.classList.remove("d-none")
        formUserEditEngagementChannelBlock.classList.remove("d-none")

        permsEdit(userPermissions.permissions.indexOf("auth.edit_listener") === -1)
        permsMoreInfo(userPermissions.permissions.indexOf("auth.see_moreinfo_listener") !== -1)
        if (userPermissions.permissions.indexOf("auth.deactivate_listener") !== -1){}
    }

    else if (group === "Teacher"){
        formUserEditPrivateLessonsBlock.classList.remove("d-none")
        formUserEditGroupLessonsBlock.classList.remove("d-none")
        formUserEditProgramBlock.classList.remove("d-none")
        formUserEditProgressBlock.classList.remove("d-none")
        formUserEditLevelBlock.classList.remove("d-none")
        formUserEditWorkBlock.classList.remove("d-none")
        formUserEditNoteBlock.classList.remove("d-none")
        formUserEditEngagementChannelBlock.classList.remove("d-none")

        permsEdit(userPermissions.permissions.indexOf("auth.edit_teacher") === -1)
        permsMoreInfo(userPermissions.permissions.indexOf("auth.see_moreinfo_teacher") !== -1)
    }

    else if (group === "Metodist"){
        formUserEditWorkBlock.classList.remove("d-none")
        formUserEditNoteBlock.classList.remove("d-none")
        formUserEditEngagementChannelBlock.classList.remove("d-none")

        permsEdit(userPermissions.permissions.indexOf("auth.edit_metodist") === -1)
        permsMoreInfo(userPermissions.permissions.indexOf("auth.see_moreinfo_metodist") !== -1)
    }

    else if (group === "Admin"){
        formUserEditWorkBlock.classList.remove("d-none")
        formUserEditNoteBlock.classList.remove("d-none")
        formUserEditEngagementChannelBlock.classList.remove("d-none")

        permsEdit(userPermissions.permissions.indexOf("auth.edit_admin") === -1)
        permsMoreInfo(userPermissions.permissions.indexOf("auth.see_moreinfo_admin") !== -1)
    }
}

async function showUser(){
    formUserEdit.reset()
    const userId = this.attributes.getNamedItem('data-user-id').value
    const userObj = userSet.find(u => u.id === Number(userId))
    setupPerms(userObj.groups[0].name)
    bsOffcanvasUser.show()
    if (userObj.engagement_channel){
        formUserEditEngagementChannelSelect.value = userObj.engagement_channel.name
    }
    if (userObj.level){
        formUserEditLevelSelect.value = userObj.level.name
    }
    formUserEditUsernameField.value = userObj.username
    formUserEditLastNameField.value = userObj.last_name
    formUserEditFirstNameField.value = userObj.first_name
    formUserEditRole.value = userObj.groups[0].name
    formUserEditEmailField.value = userObj.email
    formUserEditBDate.value = userObj.bdate
    formUserEditProgress.value = userObj.progress
    formUserEditWorkExperience.value = userObj.work_experience
    formUserEditPrivateLessons.checked = userObj.private_lessons
    formUserEditGroupLessons.checked = userObj.group_lessons
    formUserEditNote.value = userObj.note
    photoImage.src = userObj.photo
    userObj.programs.map(program => {
        const option = formUserEditProgramSelect.querySelector(`[value="${program.name}"]`)
        option.selected = true
    })

    formUserEdit.setAttribute('data-user-id', userObj.id)
}

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
const formUserEditRole = formUserEdit.querySelector("#UserShowRoleSelect")
const formUserEditBDate = formUserEdit.querySelector("#UserShowBDateField")
const formUserEditPrivateLessons = formUserEdit.querySelector("#UserShowPrivateLessonsField")
const formUserEditPrivateLessonsBlock = formUserEdit.querySelector("#UserShowPrivateLessonsBlock")
const formUserEditGroupLessons = formUserEdit.querySelector("#UserShowGroupLessonsField")
const formUserEditGroupLessonsBlock = formUserEdit.querySelector("#UserShowGroupLessonsBlock")
const formUserEditProgramSelect = formUserEdit.querySelector("#UserShowProgramsField")
const formUserEditProgramInput = formUserEdit.querySelector("#UserNewProgramField")
const formUserEditProgramBlock = formUserEdit.querySelector(".UserShowProgramsBlock")
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
const formUserEditSaveButton = formUserEdit.querySelector("#UserShowSaveButton")
const formUserEditDeactivateButton = formUserEdit.querySelector("#UserShowDeactivateButton")
const formUserEditTelegramButton = formUserEdit.querySelector("#UserShowTelegramButton")


formUserEditSaveButton.addEventListener('click', saveUser)

formUserEditProgramSelect.addEventListener('change', function () {
    if (this.value === 'new'){
        formUserEditProgramInput.classList.remove('d-none')
    } else {
        formUserEditProgramInput.classList.add('d-none')
    }
})
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