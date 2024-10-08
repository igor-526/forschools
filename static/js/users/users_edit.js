function usersEditMain(){
    usersEditListeners()
    usersEditSetEngChannels()
    usersEditSetLevels()
    usersEditSetCities()
    offcanvasUsersEditSaveButton.addEventListener("click", usersEditSave)
    offcanvasUsersEditChangePasswordButton.addEventListener("click", usersEditFunctionsChangePasswordSetModal)
    offcanvasUsersEditLoginButton.addEventListener("click", usersEditFunctionsLoginSetModal)
    offcanvasUsersEditActivateButton.addEventListener("click", usersEditFunctionsActivationSetModal)
}

function usersEditSetEngChannels(){
    offcanvasUsersEditEngagementChannelField.innerHTML = "<option value='None' selected>Не выбрано</option>"
    if (canAddNewCollections){
        offcanvasUsersEditEngagementChannelField.innerHTML += "<option value='new'>Новый</option>"
    }
    collectionsAPIGetEngChannels().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(engchannel => {
                    offcanvasUsersEditEngagementChannelField.innerHTML += `<option value='${engchannel.id}'>${engchannel.name}</option>`
                })
                break
            default:
                showErrorToast("Не удалось загрузить каналы привлечения")
                break
        }
    })
}

function usersEditSetLevels(){
    offcanvasUsersEditLevelField.innerHTML = "<option value='None' selected>Не выбрано</option>"
    if (canAddNewCollections){
        offcanvasUsersEditLevelField.innerHTML += "<option value='new'>Новый</option>"
    }
    collectionsAPIGetLevels().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(level => {
                    offcanvasUsersEditLevelField.innerHTML += `<option value='${level.id}'>${level.name}</option>`
                })
                break
            default:
                showErrorToast("Не удалось загрузить уровни")
                break
        }
    })
}

function usersEditSetCities(){

}

function usersEditListeners(){
    offcanvasUsersEditLevelField.addEventListener("change", function () {
        offcanvasUsersEditLevelField.value === "new"?offcanvasUsersEditNewLevelField.classList.remove("d-none"):offcanvasUsersEditNewLevelField.classList.add("d-none")
    })
    offcanvasUsersEditEngagementChannelField.addEventListener("change", function () {
        offcanvasUsersEditEngagementChannelField.value === "new"?offcanvasUsersEditNewEngagementChannelField.classList.remove("d-none"):offcanvasUsersEditNewEngagementChannelField.classList.add("d-none")
    })
    offcanvasUsersEditRoleCheckboxAdmin.addEventListener("change", function (){
        if (offcanvasUsersEditRoleCheckboxAdmin.checked){
            offcanvasUsersEditRoleCheckboxListener.checked = false
        }
    })
    offcanvasUsersEditRoleCheckboxMetodist.addEventListener("change", function () {
        if (offcanvasUsersEditRoleCheckboxMetodist.checked){
            offcanvasUsersEditRoleCheckboxListener.checked = false
        }
    })
    offcanvasUsersEditRoleCheckboxTeacher.addEventListener("change", function () {
        if (offcanvasUsersEditRoleCheckboxTeacher.checked){
            offcanvasUsersEditRoleCheckboxListener.checked = false
        }
    })
    offcanvasUsersEditRoleCheckboxListener.addEventListener("change", function () {
        if (offcanvasUsersEditRoleCheckboxListener.checked){
            offcanvasUsersEditRoleCheckboxAdmin.checked = false
            offcanvasUsersEditRoleCheckboxMetodist.checked = false
            offcanvasUsersEditRoleCheckboxTeacher.checked = false
        }
    })
    if (userUtilsValidateUsername(offcanvasUsersEditUsernameField.value).status === "error"){
        offcanvasUsersEditLastNameField.addEventListener("input", function (){
            offcanvasUsersEditUsernameField.value = getUsernameFromFirstLastName(
                offcanvasUsersEditFirstNameField.value,
                offcanvasUsersEditLastNameField.value
            )
        })
        offcanvasUsersEditFirstNameField.addEventListener("input", function (){
            offcanvasUsersEditUsernameField.value = getUsernameFromFirstLastName(
                offcanvasUsersEditFirstNameField.value,
                offcanvasUsersEditLastNameField.value
            )
        })
    }
}

function usersEditReset(validationOnly=false){
    function validationReset(){
        offcanvasUsersEditUsernameErrors.value = ""
        offcanvasUsersEditLastNameErrors.value = ""
        offcanvasUsersEditFirstNameErrors.value = ""
        offcanvasUsersEditPatronymicErrors.value = ""
        offcanvasUsersEditEmailErrors.value = ""
        offcanvasUsersEditBDateErrors.value = ""
        offcanvasUsersEditProgressErrors.value = ""
        offcanvasUsersEditNewLevelErrors.value = ""
        offcanvasUsersEditWorkExperienceErrors.value = ""
        offcanvasUsersEditNoteErrors.value = ""
        offcanvasUsersEditNewEngagementChannelErrors.value = ""
        offcanvasUsersEditUsernameField.classList.remove("is-invalid")
        offcanvasUsersEditLastNameField.classList.remove("is-invalid")
        offcanvasUsersEditFirstNameField.classList.remove("is-invalid")
        offcanvasUsersEditPatronymicField.classList.remove("is-invalid")
        offcanvasUsersEditEmailField.classList.remove("is-invalid")
        offcanvasUsersEditBDateField.classList.remove("is-invalid")
        offcanvasUsersEditProgressField.classList.remove("is-invalid")
        offcanvasUsersEditWorkExperienceField.classList.remove("is-invalid")
        offcanvasUsersEditNewEngagementChannelField.classList.remove("is-invalid")
        offcanvasUsersEditNewLevelField.classList.remove("is-invalid")
        offcanvasUsersEditNoteField.classList.remove("is-invalid")
    }

    validationReset()
    if (!validationOnly){
        usersEditShowHideListenerTeacherFields(false)
        usersEditShowHideMoreInfoFields(false)
        offcanvasUsersEditForm.reset()
    }
}

function usersEditShowHideListenerTeacherFields(show=true){
    show?offcanvasUsersEditPrivateLessonsBlock.classList.remove("d-none"):offcanvasUsersEditPrivateLessonsBlock.classList.add("d-none")
    show?offcanvasUsersEditProgressBlock.classList.remove("d-none"):offcanvasUsersEditProgressBlock.classList.add("d-none")
    show?offcanvasUsersEditLevelBlock.classList.remove("d-none"):offcanvasUsersEditLevelBlock.classList.add("d-none")

}

function usersEditShowHideMoreInfoFields(show=true){
    show?offcanvasUsersEditEngagementChannelBlock.classList.remove("d-none"):offcanvasUsersEditEngagementChannelBlock.classList.add("d-none")
    show?offcanvasUsersEditWorkExperienceFieldBlock.classList.remove("d-none"):offcanvasUsersEditWorkExperienceFieldBlock.classList.add("d-none")
    show?offcanvasUsersEditNoteFieldBlock.classList.remove("d-none"):offcanvasUsersEditNoteFieldBlock.classList.add("d-none")
}

function usersEditSetOffcanvas(userID=null, userElement=null){
    usersAPIGetUser(userID).then(request => {
        switch (request.status){
            case 200:
                selectedUserID = userID
                selectedUserIDElement = userElement
                usersEditReset()
                offcanvasUsersEditUsernameField.value = request.response.username
                offcanvasUsersEditLastNameField.value = request.response.last_name
                offcanvasUsersEditFirstNameField.value = request.response.first_name
                if (request.response.patronymic)
                    offcanvasUsersEditPatronymicField.value = request.response.patronymic
                offcanvasUsersEditEmailField.value = request.response.email
                offcanvasUsersEditBDateField.value = request.response.bdate
                offcanvasUsersEditCityField.value = request.response.city?request.response.city.id:"None"
                offcanvasUsersEditPhotoImage.src = request.response.photo
                if (request.response.can_edit){
                    usersEditShowHideMoreInfoFields()
                    offcanvasUsersEditEngagementChannelField.value = request.response.engagement_channel?request.response.engagement_channel.id:"None"
                    offcanvasUsersEditWorkExperienceField.value = request.response.work_experience
                    offcanvasUsersEditNoteField.value = request.response.note
                    offcanvasUsersEditActivateButton.classList.remove("d-none")
                    offcanvasUsersEditSaveButton.classList.remove("d-none")
                    offcanvasUsersEditChangePasswordButton.classList.remove("d-none")
                    switch (request.response.is_active){
                        case true:
                            offcanvasUsersEditActivateButton.classList.remove("btn-warning")
                            offcanvasUsersEditActivateButton.classList.add("btn-danger")
                            offcanvasUsersEditActivateButton.innerHTML = "Деактивировать"
                            offcanvasUsersEditActivateButton.setAttribute("data-action", "deactivate")
                            if (canLogin){
                                offcanvasUsersEditLoginButton.classList.remove("d-none")
                            } else {
                                offcanvasUsersEditLoginButton.classList.add("d-none")
                            }
                            break
                        case false:
                            offcanvasUsersEditActivateButton.classList.add("btn-warning")
                            offcanvasUsersEditActivateButton.classList.remove("btn-danger")
                            offcanvasUsersEditActivateButton.innerHTML = "Активировать"
                            offcanvasUsersEditActivateButton.setAttribute("data-action", "activate")
                            break
                    }
                } else {
                    usersEditShowHideMoreInfoFields(false)
                    offcanvasUsersEditActivateButton.classList.add("d-none")
                    offcanvasUsersEditSaveButton.classList.add("d-none")
                    offcanvasUsersEditChangePasswordButton.classList.add("d-none")
                }
                request.response.groups.forEach(group => {
                    switch (group.name){
                        case "Listener":
                            offcanvasUsersEditRoleCheckboxListener.checked = true
                            offcanvasUsersEditPrivateLessonsField.checked = request.response.private_lessons
                            offcanvasUsersEditGroupLessonsField.checked = request.response.group_lessons
                            usersEditShowHideListenerTeacherFields()
                            offcanvasUsersEditWorkExperienceField.classList.add("d-none")
                            offcanvasUsersEditProgressField.value = request.response.progress
                            offcanvasUsersEditLevelField.value = request.response.level?request.response.level.id:"None"
                            break
                        case "Teacher":
                            offcanvasUsersEditRoleCheckboxTeacher.checked = true
                            offcanvasUsersEditPrivateLessonsField.checked = request.response.private_lessons
                            offcanvasUsersEditGroupLessonsField.checked = request.response.group_lessons
                            usersEditShowHideListenerTeacherFields()
                            offcanvasUsersEditWorkExperienceField.classList.remove("d-none")
                            offcanvasUsersEditProgressField.value = request.response.progress
                            offcanvasUsersEditLevelField.value = request.response.level?request.response.level.id:"None"
                            break
                        case "Metodist":
                            offcanvasUsersEditRoleCheckboxMetodist.checked = true
                            offcanvasUsersEditWorkExperienceField.classList.remove("d-none")
                            break
                        case "Admin":
                            offcanvasUsersEditRoleCheckboxAdmin.checked = true
                            offcanvasUsersEditWorkExperienceField.classList.remove("d-none")
                            break
                    }
                })
                offcanvasUsersEditLastActivity.innerHTML = timeUtilsDateTimeToStr(new Date(request.response.last_activity))
                offcanvasUsersEditRegistrationDate.innerHTML = timeUtilsDateTimeToStr(new Date(request.response.date_joined))
                bsOffcanvasUsersEdit.show()
                break
            default:
                showErrorToast()
                break
        }
    })
}

function usersEditValidation(errors=null){
    function setInvalid(errorString="Ошибка!", element=null, errorElement=null){
        if (element){
            element.classList.add("is-invalid")
        }
        if (errorElement){
            errorElement.innerHTML = errorString
        }
        validationStatus = false
    }

    function validateUsername(error=null){
        if (error){
            setInvalid(
                error,
                offcanvasUsersEditUsernameField,
                offcanvasUsersEditUsernameErrors
            )
        } else {
            const validation = userUtilsValidateUsername(offcanvasUsersEditUsernameField.value)
            if (validation.status === "error"){
                setInvalid(
                    validation.error,
                    offcanvasUsersEditUsernameField,
                    offcanvasUsersEditUsernameErrors
                )
            }
        }
    }

    function validateLastName(error=null){
        if (error){
            setInvalid(
                error,
                offcanvasUsersEditLastNameField,
                offcanvasUsersEditLastNameErrors
            )
        } else {
            if (offcanvasUsersEditLastNameField.value.trim() !== ""){
                if (offcanvasUsersEditLastNameField.value.trim().length > 50){
                    setInvalid(
                        "Длина не может превышать 50 символов",
                        offcanvasUsersEditLastNameField,
                        offcanvasUsersEditLastNameErrors
                    )
                } else {
                    const noSpacesRegex = /^[^ ]+$/
                    if (!noSpacesRegex.test(offcanvasUsersEditLastNameField.value.trim())){
                        setInvalid(
                            "Поле не может содержать пробелов",
                            offcanvasUsersEditLastNameField,
                            offcanvasUsersEditLastNameErrors
                        )
                    }
                }
            } else {
                setInvalid(
                    "Поле не может быть пустым",
                    offcanvasUsersEditLastNameField,
                    offcanvasUsersEditLastNameErrors
                )
            }
        }
    }

    function validateFirstName(error=null){
        if (error){
            setInvalid(
                error,
                offcanvasUsersEditFirstNameField,
                offcanvasUsersEditFirstNameErrors
            )
        } else {
            if (offcanvasUsersEditFirstNameField.value.trim() !== ""){
                if (offcanvasUsersEditFirstNameField.value.trim().length > 50){
                    setInvalid(
                        "Длина не может превышать 50 символов",
                        offcanvasUsersEditFirstNameField,
                        offcanvasUsersEditFirstNameErrors
                    )
                } else {
                    const noSpacesRegex = /^[^ ]+$/
                    if (!noSpacesRegex.test(offcanvasUsersEditFirstNameField.value.trim())){
                        setInvalid(
                            "Поле не может содержать пробелов",
                            offcanvasUsersEditFirstNameField,
                            offcanvasUsersEditFirstNameErrors
                        )
                    }
                }
            } else {
                setInvalid(
                    "Поле не может быть пустым",
                    offcanvasUsersEditFirstNameField,
                    offcanvasUsersEditFirstNameErrors
                )
            }
        }
    }

    function validatePatronymic(error=null){
        if (error){
            setInvalid(
                error,
                offcanvasUsersEditPatronymicField,
                offcanvasUsersEditPatronymicErrors
            )
        } else {
            if (offcanvasUsersEditPatronymicField.value.trim() !== ""){
                if (offcanvasUsersEditPatronymicField.value.trim().length > 50){
                    setInvalid(
                        "Длина не может превышать 50 символов",
                        offcanvasUsersEditPatronymicField,
                        offcanvasUsersEditPatronymicErrors
                    )
                } else {
                    const noSpacesRegex = /^[^ ]+$/
                    if (!noSpacesRegex.test(offcanvasUsersEditPatronymicField.value.trim())){
                        setInvalid(
                            "Поле не может содержать пробелов",
                            offcanvasUsersEditPatronymicField,
                            offcanvasUsersEditPatronymicErrors
                        )
                    }
                }
            }
        }
    }

    function validateEmail(error=null){
        if (error) {
            setInvalid(
                error,
                offcanvasUsersEditEmailField,
                offcanvasUsersEditEmailErrors
            )
        } else {
            if (offcanvasUsersEditEmailField.value.trim() !== ""){
                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/
                if (!emailRegex.test(offcanvasUsersEditEmailField.value.trim())){
                    setInvalid(
                        "Проверьте корректность ввода",
                        offcanvasUsersEditEmailField,
                        offcanvasUsersEditEmailErrors
                    )
                }
            }
        }


    }

    function validateBDate(error=null){
        if (offcanvasUsersEditBDateField.value !== ""){
            const date = new Date(offcanvasUsersEditBDateField.value)
            const today = new Date()
            if (date >= today){
                setInvalid(
                    "Проверьте корректность ввода",
                    offcanvasUsersEditBDateField,
                    offcanvasUsersEditBDateErrors
                )
            }
        }
    }

    function validateProgress(error=null){
        if (offcanvasUsersEditProgressField.value.trim() !== ""){
            if (offcanvasUsersEditProgressField.value.trim().length > 1000){
                setInvalid(
                    "Длина поля не может быть более 1000 символов",
                    offcanvasUsersEditProgressField,
                    offcanvasUsersEditProgressErrors
                )
            }
        }
    }

    function validateNewLevel(error=null){
        if (offcanvasUsersEditNewLevelField.value.trim() !== ""){
            if (offcanvasUsersEditNewLevelField.value.trim().length > 50){
                setInvalid(
                    "Длина поля не может быть более 50 символов",
                    offcanvasUsersEditNewLevelField,
                    offcanvasUsersEditNewLevelErrors
                )
            }
        }
    }

    function validateWorkExperience(error=null){
        if (offcanvasUsersEditWorkExperienceField.value.trim() !== ""){
            if (offcanvasUsersEditWorkExperienceField.value.trim().length > 1000){
                setInvalid(
                    "Длина поля не может быть более 1000 символов",
                    offcanvasUsersEditWorkExperienceField,
                    offcanvasUsersEditWorkExperienceErrors
                )
            }
        }
    }

    function validateNote(error=null){
        if (offcanvasUsersEditNoteField.value.trim() !== ""){
            if (offcanvasUsersEditNoteField.value.trim().length > 1000){
                setInvalid(
                    "Длина поля не может быть более 1000 символов",
                    offcanvasUsersEditNoteField,
                    offcanvasUsersEditNoteErrors
                )
            }
        }
    }

    function validateNewEngChannel(error=null){
        if (offcanvasUsersEditNewEngagementChannelField.value.trim() !== ""){
            if (offcanvasUsersEditNewEngagementChannelField.value.trim().length > 50){
                setInvalid(
                    "Длина поля не может быть более 50 символов",
                    offcanvasUsersEditNewEngagementChannelField,
                    offcanvasUsersEditNewEngagementChannelErrors
                )
            }
        }
    }

    let validationStatus = true

    usersEditReset(true)
    validateUsername()
    validateLastName()
    validateFirstName()
    validatePatronymic()
    validateEmail()
    validateBDate()
    validateProgress()
    validateNewLevel()
    validateWorkExperience()
    validateNote()
    validateNewEngChannel()

    return validationStatus
}

function usersEditSave(){
    function getFD(){
        const formData = new FormData(offcanvasUsersEditForm)
        if (formData.get("eng_channel") === "new" || formData.get("eng_channel") === "none"){
            formData.delete("eng_channel")
        }
        if (formData.get("eng_channel_new").trim() === ""){
            formData.delete("eng_channel_new")
        } else {
            const eng_ch = formData.get("eng_channel_new")
            formData.set("eng_channel_new", eng_ch.trim())
        }
        if (formData.get("lvl") === "new" || formData.get("lvl") === "none"){
            formData.delete("lvl")
        }
        if (formData.get("lvl_new").trim() === ""){
            formData.delete("lvl_new")
        } else {
            const lvl_new = formData.get("lvl_new")
            formData.set("lvl_new", lvl_new.trim())
        }
        const username = formData.get("username")
        const last_name = formData.get("last_name")
        const first_name = formData.get("first_name")
        const patronymic = formData.get("patronymic")
        const email = formData.get("email")
        const progress = formData.get("progress")
        const work_experience = formData.get("work_experience")
        const note = formData.get("note")
        formData.set("username", username.trim().toLowerCase())
        formData.set("last_name", last_name.trim().replace(/(^\w)/, (match) => match.toUpperCase()))
        formData.set("first_name", first_name.trim().replace(/(^\w)/, (match) => match.toUpperCase()))
        if (patronymic){
            formData.set("patronymic", patronymic.trim().replace(/(^\w)/, (match) => match.toUpperCase()))
        }
        if (email){
            formData.set("username", username.trim().toLowerCase())
        }
        if (progress){
            formData.set("progress", progress.trim())
        }
        if (work_experience){
            formData.set("work_experience", work_experience.trim())
        }
        if (note){
            formData.set("note", note.trim())
        }

        return formData
    }

    if (usersEditValidation()){
        usersAPIUpdateUser(getFD(), selectedUserID).then(request => {
            switch (request.status){
                case 200:
                    bsOffcanvasUsersEdit.hide()
                    showSuccessToast("Пользователь успешно изменён")
                    usersAdminShow(request.response, selectedUserIDElement)
                    break
                case 400:
                    break
                default:
                    bsOffcanvasUsersEdit.hide()
                    showErrorToast()
                    break
            }
        })

    }
}

//vars
let selectedUserID = null
let selectedUserIDElement = null

//Bootstrap elements
const offcanvasUsersEdit = document.querySelector("#offcanvasUsersEdit")
const bsOffcanvasUsersEdit = new bootstrap.Offcanvas(offcanvasUsersEdit)

//MainForm
const offcanvasUsersEditForm = offcanvasUsersEdit.querySelector("#offcanvasUsersEditForm")

//MainFormPhoto
const offcanvasUsersEditPhotoImage = offcanvasUsersEdit.querySelector("#offcanvasUsersEditPhotoImage")

//MainForm Fields
const offcanvasUsersEditUsernameField = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditUsernameField")
const offcanvasUsersEditLastNameField = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditLastNameField")
const offcanvasUsersEditFirstNameField = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditFirstNameField")
const offcanvasUsersEditPatronymicField = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditPatronymicField")
const offcanvasUsersEditEmailField = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditEmailField")
const offcanvasUsersEditRoleCheckboxAdmin = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditRoleCheckboxAdmin")
const offcanvasUsersEditRoleCheckboxMetodist = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditRoleCheckboxMetodist")
const offcanvasUsersEditRoleCheckboxTeacher = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditRoleCheckboxTeacher")
const offcanvasUsersEditRoleCheckboxListener = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditRoleCheckboxListener")
const offcanvasUsersEditBDateField = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditBDateField")
const offcanvasUsersEditCityField = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditCityField")
const offcanvasUsersEditPrivateLessonsField = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditPrivateLessonsField")
const offcanvasUsersEditGroupLessonsField = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditGroupLessonsField")
const offcanvasUsersEditProgressField = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditProgressField")
const offcanvasUsersEditLevelField = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditLevelField")
const offcanvasUsersEditWorkExperienceField = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditWorkExperienceField")
const offcanvasUsersEditNoteField = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditNoteField")
const offcanvasUsersEditEngagementChannelField = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditEngagementChannelField")
const offcanvasUsersEditNewEngagementChannelField = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditNewEngagementChannelField")
const offcanvasUsersEditNewLevelField = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditNewLevelField")
//MainForm Errors
const offcanvasUsersEditUsernameErrors = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditUsernameErrors")
const offcanvasUsersEditLastNameErrors = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditLastNameErrors")
const offcanvasUsersEditFirstNameErrors = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditFirstNameErrors")
const offcanvasUsersEditPatronymicErrors = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditPatronymicErrors")
const offcanvasUsersEditEmailErrors = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditEmailErrors")
const offcanvasUsersEditBDateErrors = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditBDateErrors")
const offcanvasUsersEditProgressErrors = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditProgressErrors")
const offcanvasUsersEditNewLevelErrors = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditNewLevelErrors")
const offcanvasUsersEditWorkExperienceErrors = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditWorkExperienceErrors")
const offcanvasUsersEditNoteErrors = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditNoteErrors")
const offcanvasUsersEditNewEngagementChannelErrors = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditNewEngagementChannelErrors")
//MainForm Blocks
const offcanvasUsersEditNoteFieldBlock = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditNoteFieldBlock")
const offcanvasUsersEditPrivateLessonsBlock = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditPrivateLessonsBlock")
const offcanvasUsersEditProgressBlock = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditProgressBlock")
const offcanvasUsersEditLevelBlock = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditLevelBlock")
const offcanvasUsersEditEngagementChannelBlock = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditEngagementChannelBlock")
const offcanvasUsersEditWorkExperienceFieldBlock = offcanvasUsersEditForm.querySelector("#offcanvasUsersEditWorkExperienceFieldBlock")


//Information
const offcanvasUsersEditLastActivity = offcanvasUsersEdit.querySelector("#offcanvasUsersEditLastActivity")
const offcanvasUsersEditRegistrationDate = offcanvasUsersEdit.querySelector("#offcanvasUsersEditRegistrationDate")

//Buttons
const offcanvasUsersEditSaveButton = offcanvasUsersEdit.querySelector("#offcanvasUsersEditSaveButton")
const offcanvasUsersEditChangePasswordButton = offcanvasUsersEdit.querySelector("#offcanvasUsersEditChangePasswordButton")
const offcanvasUsersEditLoginButton = offcanvasUsersEdit.querySelector("#offcanvasUsersEditLoginButton")
const offcanvasUsersEditActivateButton = offcanvasUsersEdit.querySelector("#offcanvasUsersEditActivateButton")

usersEditMain()