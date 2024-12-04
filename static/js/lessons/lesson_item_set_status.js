function lessonItemSetStatusPassedMain(){
    lessonItemStatusPassedButton.addEventListener('click', lessonItemSetStatusPassedReset)
    lessonItemStatusPassedModalButton.addEventListener('click', lessonItemSetStatusPassedSet)
    isAdmin ? lessonItemStatusPassedModalForm.classList.add("d-none") :
        lessonItemStatusPassedModalForm.classList.remove("d-none")
}

function lessonItemSetStatusCancelledMain(){
    lessonItemStatusCancelledButton.addEventListener('click', function () {
        lessonItemSetStatusCancelledReset()
    })
    lessonItemStatusCancelledModalButton.addEventListener('click', lessonItemSetStatusCancelledSet)
    lessonItemStatusCancelledModalFormManual.addEventListener("change", function () {
        lessonItemStatusCancelledModalFormDate.disabled = !lessonItemStatusCancelledModalFormManual.checked
        lessonItemStatusCancelledModalFormStart.disabled = !lessonItemStatusCancelledModalFormManual.checked
        lessonItemStatusCancelledModalFormEnd.disabled = !lessonItemStatusCancelledModalFormManual.checked
        lessonItemStatusCancelledModalFormPlace.disabled = !lessonItemStatusCancelledModalFormManual.checked
    })
    collectionsAPIGetLessonPlaces().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(place => {
                    lessonItemStatusCancelledModalFormPlace.insertAdjacentHTML("beforeend", `
                    <option value="${place.id}">${place.name}</option>`)
                })
                break
            default:
                showErrorToast()
                break
        }
    })
}

function lessonItemSetStatusPassedReset(validationOnly = false){
    function resetValidation(){
        lessonItemStatusPassedModalFormNameField.classList.remove("is-invalid")
        lessonItemStatusPassedModalFormMaterialsField.classList.remove("is-invalid")
        lessonItemStatusPassedModalFormLexisField.classList.remove("is-invalid")
        lessonItemStatusPassedModalFormGrammarField.classList.remove("is-invalid")
        lessonItemStatusPassedModalFormNoteField.classList.remove("is-invalid")
        lessonItemStatusPassedModalFormOrgField.classList.remove("is-invalid")
        lessonItemStatusPassedModalFormNameError.innerHTML = ""
        lessonItemStatusPassedModalFormMaterialsError.innerHTML = ""
        lessonItemStatusPassedModalFormLexisError.innerHTML = ""
        lessonItemStatusPassedModalFormGrammarError.innerHTML = ""
        lessonItemStatusPassedModalFormNoteError.innerHTML = ""
        lessonItemStatusPassedModalFormOrgError.innerHTML = ""
        lessonItemStatusPassedModalErrors.innerHTML = ""
        lessonItemStatusPassedModalErrorsAlert.classList.add("d-none")
    }

    resetValidation()
    if (!validationOnly){
        lessonItemStatusPassedModalForm.reset()
    }
}

function lessonItemSetStatusCancelledReset(validationOnly = false){
    if (validationOnly === false){
        lessonItemStatusCancelledModalForm.reset()
        lessonItemStatusCancelledButton.setAttribute("data-ignore-warnings", "false")
    }
    lessonItemStatusCancelledModalErrorsAlert.classList.add("d-none")
    lessonItemStatusCancelledModalErrors.innerHTML = ""
    lessonItemStatusCancelledModalWarningsAlert.classList.add("d-none")
    lessonItemStatusCancelledModalWarnings.innerHTML = ""
    lessonItemStatusCancelledModalFormDate.classList.remove("is-invalid")
    lessonItemStatusCancelledModalFormStart.classList.remove("is-invalid")
    lessonItemStatusCancelledModalFormEnd.classList.remove("is-invalid")
}

function lessonItemSetStatusPassedValidation(errors=null){
    function setInvalid(error="", element=null, errorElement=null){
        if (element){
            element.classList.add("is-invalid")
        }
        if (errorElement){
            errorElement.innerHTML = error
        }
        validationStatus = false
    }

    function validateName(error=null){
        if (error){
            setInvalid(
                error,
                lessonItemStatusPassedModalFormNameField,
                lessonItemStatusPassedModalFormNameError
            )
        } else {
            if (lessonItemStatusPassedModalFormNameField.value.trim() === ""){
                setInvalid(
                    "Поле не может быть пустым",
                    lessonItemStatusPassedModalFormNameField,
                    lessonItemStatusPassedModalFormNameError
                )
            } else {
                const valueLength = lessonItemStatusPassedModalFormNameField.value.trim().length
                if (valueLength < 5 || valueLength > 200){
                    setInvalid(
                        `Объём поля должен составлять от 5 до 200 символов. У вас ${valueLength}`,
                        lessonItemStatusPassedModalFormNameField,
                        lessonItemStatusPassedModalFormNameError
                    )
                }
            }
        }
    }

    function validateMaterials(error=null){
        if (error){
            setInvalid(
                error,
                lessonItemStatusPassedModalFormMaterialsField,
                lessonItemStatusPassedModalFormMaterialsError
            )
        } else {
            if (lessonItemStatusPassedModalFormMaterialsField.value.trim() === ""){
                setInvalid(
                    "Поле не может быть пустым",
                    lessonItemStatusPassedModalFormMaterialsField,
                    lessonItemStatusPassedModalFormMaterialsError
                )
            } else {
                const valueLength = lessonItemStatusPassedModalFormMaterialsField.value.trim().length
                if (valueLength < 5 || valueLength > 2000){
                    setInvalid(
                        `Объём поля должен составлять от 5 до 2000 символов. У вас ${valueLength}`,
                        lessonItemStatusPassedModalFormMaterialsField,
                        lessonItemStatusPassedModalFormMaterialsError
                    )
                }
            }
        }
    }

    function validateLexis(error=null){
        if (error){
            setInvalid(
                error,
                lessonItemStatusPassedModalFormLexisField,
                lessonItemStatusPassedModalFormLexisError
            )
        } else {
            if (lessonItemStatusPassedModalFormLexisField.value.trim() === ""){
                setInvalid(
                    "Поле не может быть пустым",
                    lessonItemStatusPassedModalFormLexisField,
                    lessonItemStatusPassedModalFormLexisError
                )
            } else {
                const valueLength = lessonItemStatusPassedModalFormLexisField.value.trim().length
                if (valueLength < 5 || valueLength > 300){
                    setInvalid(
                        `Объём поля должен составлять от 5 до 300 символов. У вас ${valueLength}`,
                        lessonItemStatusPassedModalFormLexisField,
                        lessonItemStatusPassedModalFormLexisError
                    )
                }
            }
        }
    }

    function validateGrammar(error=null){
        if (error){
            setInvalid(
                error,
                lessonItemStatusPassedModalFormGrammarField,
                lessonItemStatusPassedModalFormGrammarError
            )
        } else {
            if (lessonItemStatusPassedModalFormGrammarField.value.trim() === ""){
                setInvalid(
                    "Поле не может быть пустым",
                    lessonItemStatusPassedModalFormGrammarField,
                    lessonItemStatusPassedModalFormGrammarError
                )
            } else {
                const valueLength = lessonItemStatusPassedModalFormGrammarField.value.trim().length
                if (valueLength < 5 || valueLength > 300){
                    setInvalid(
                        `Объём поля должен составлять от 5 до 300 символов. У вас ${valueLength}`,
                        lessonItemStatusPassedModalFormGrammarField,
                        lessonItemStatusPassedModalFormGrammarError
                    )
                }
            }
        }
    }

    function validateNote(error=null){
        if (error){
            setInvalid(
                error,
                lessonItemStatusPassedModalFormNoteField,
                lessonItemStatusPassedModalFormNoteError
            )
        } else {
            if (lessonItemStatusPassedModalFormNoteField.value.trim() === ""){
                setInvalid(
                    "Поле не может быть пустым",
                    lessonItemStatusPassedModalFormNoteField,
                    lessonItemStatusPassedModalFormNoteError
                )
            } else {
                const valueLength = lessonItemStatusPassedModalFormNoteField.value.trim().length
                if (valueLength < 5 || valueLength > 2000){
                    setInvalid(
                        `Объём поля должен составлять от 5 до 2000 символов. У вас ${valueLength}`,
                        lessonItemStatusPassedModalFormNoteField,
                        lessonItemStatusPassedModalFormNoteError
                    )
                }
            }
        }
    }

    function validateOrg(error=null){
        if (error){
            setInvalid(
                error,
                lessonItemStatusPassedModalFormOrgField,
                lessonItemStatusPassedModalFormOrgError
            )
        } else {
            if (lessonItemStatusPassedModalFormOrgField.value.trim() === ""){
                setInvalid(
                    "Поле не может быть пустым",
                    lessonItemStatusPassedModalFormOrgField,
                    lessonItemStatusPassedModalFormOrgError
                )
            } else {
                const valueLength = lessonItemStatusPassedModalFormOrgField.value.trim().length
                if (valueLength < 5 || valueLength > 2000){
                    setInvalid(
                        `Объём поля должен составлять от 5 до 2000 символов. У вас ${valueLength}`,
                        lessonItemStatusPassedModalFormOrgField,
                        lessonItemStatusPassedModalFormOrgError
                    )
                }
            }
        }
    }

    lessonItemSetStatusPassedReset(true)
    let validationStatus = true
    if (errors){
        if (errors.hasOwnProperty("name")){
            validateName(errors.name)
        }
        if (errors.hasOwnProperty("materials")){
            validateMaterials(errors.materials)
        }
        if (errors.hasOwnProperty("lexis")){
            validateLexis(errors.lexis)
        }
        if (errors.hasOwnProperty("grammar")){
            validateGrammar(errors.grammar)
        }
        if (errors.hasOwnProperty("note")){
            validateNote(errors.note)
        }
        if (errors.hasOwnProperty("org")){
            validateOrg(errors.org)
        }
    } else {
        validateName()
        validateMaterials()
        validateLexis()
        validateGrammar()
        validateNote()
        validateOrg()
    }
    return validationStatus
}

function lessonItemSetStatusCancelledValidation(errors){
    function setInvalid(error = "", elements = []){
        lessonItemStatusCancelledModalErrorsAlert.classList.remove("d-none")
        lessonItemStatusCancelledModalErrors.innerHTML += `<li>${error}</li>`
        elements.forEach(element => {
            element.classList.add("is-invalid")
        })
        validationStatus = false
    }

    function validateDate(){
        if (lessonItemStatusCancelledModalFormDate.value === ""){
            setInvalid("Необходимо указать дату урока, либо выключить выбор даты и времени вручную",
                [lessonItemStatusCancelledModalFormDate])
            return
        }
        if (new Date().setHours(0,0,0,0) > new Date(lessonItemStatusCancelledModalFormDate.value).setHours(0,0,0,0)){
            setInvalid("Дата урока не может быть раньше, чем сегодня",
                [lessonItemStatusCancelledModalFormDate])
        }
    }

    function validateTime(){
        if (lessonItemStatusCancelledModalFormStart.value === ""){
            setInvalid("Необходимо указать время начала занятия, либо выключить выбор даты и времени вручную",
                [lessonItemStatusCancelledModalFormStart])
            return
        }

        if (lessonItemStatusCancelledModalFormEnd.value === ""){
            setInvalid("Необходимо указать время окончания занятия, либо выключить выбор даты и времени вручную",
                [lessonItemStatusCancelledModalFormEnd])
            return
        }

        if(compareTime(
            lessonItemStatusCancelledModalFormStart,
            lessonItemStatusCancelledModalFormEnd
        )){
            setInvalid("Время окончания не может быть меньше времени начала",
                [lessonItemStatusCancelledModalFormStart,
                    lessonItemStatusCancelledModalFormEnd])
        }
    }

    lessonItemSetStatusCancelledReset(true)
    let validationStatus = true
    if (errors){
        if (errors.errors){
            lessonItemStatusCancelledModalErrorsAlert.classList.remove("d-none")
            lessonItemStatusCancelledModalErrors.innerHTML = errors.errors
        }
        if (errors.warnings){
            lessonItemStatusCancelledModalWarningsAlert.classList.remove("d-none")
            lessonItemStatusCancelledModalWarnings.innerHTML = errors.warnings
            lessonItemStatusCancelledModalWarnings.innerHTML += `
            <div class="ms-2"><b>Нажмите кнопку "Занятие не проведено" ещё раз для игнорирования предупреждений</b></div>`
            lessonItemStatusCancelledButton.setAttribute("data-ignore-warnings", "true")
        }
    } else {
        if (lessonItemStatusCancelledModalFormManual.checked){
            validateDate()
            validateTime()
        }
    }
    return validationStatus
}

function lessonItemSetStatusPassedSet(){
    if (isAdmin || lessonItemSetStatusPassedValidation()){
        lessonsAPISetStatus(lessonID,
            new FormData(lessonItemStatusPassedModalForm)).then(request => {
            switch (request.status){
                case 201:
                    bsLessonItemStatusPassedModal.hide()
                    showSuccessToast("Занятие успешно проведено!")
                    lessonItemStatus.innerHTML = "Занятие проведено"
                    lessonItemStatus.classList.remove("list-group-item-warning")
                    lessonItemStatus.classList.add("list-group-item-success")
                    lessonItemNotPassedElements.forEach(e => {
                        e.remove()
                    })
                    setTimeout(function (){
                        location.reload()
                    }, 500)
                    break
                case 400:
                    if (request.response.hasOwnProperty("error")){
                        bsLessonItemStatusPassedModal.hide()
                        showErrorToast(request.response.error)
                    }
                    lessonItemSetStatusPassedValidation(request.response)
                    break
                default:
                    bsLessonItemStatusPassedModal.hide()
                    showErrorToast()
            }
        })
    }
}

function lessonItemSetStatusCancelledSet(){
    if (lessonItemSetStatusCancelledValidation()){
        const fd = new FormData(lessonItemStatusCancelledModalForm)
        if (lessonItemStatusCancelledButton.attributes.getNamedItem("data-ignore-warnings").value === "true"){
            fd.set("ignore_warnings", true)
        }
        lessonsAPIReschedulingCancel(lessonID, fd).then(request => {
            switch (request.status){
                case 201:
                    bsLessonItemStatusCancelledModal.hide()
                    showSuccessToast("Занятие успешно изменено")
                    setTimeout(function () {
                        location.reload()
                    }, 500)
                    break
                case 400:
                    lessonItemSetStatusCancelledValidation(request.response)
                    break
                default:
                    bsLessonItemStatusCancelledModal.hide()
                    showErrorToast()
                    break
            }
        })
    }
}

//bootstrap Elements
const lessonItemStatusPassedModal = document.querySelector("#lessonItemStatusPassedModal")
const bsLessonItemStatusPassedModal = new bootstrap.Modal(lessonItemStatusPassedModal)
const lessonItemStatusCancelledModal = document.querySelector("#lessonItemStatusCancelledModal")
const bsLessonItemStatusCancelledModal = new bootstrap.Modal(lessonItemStatusCancelledModal)

//FormPassed
const lessonItemStatusPassedModalForm = lessonItemStatusPassedModal.querySelector("#lessonItemStatusPassedModalForm")
const lessonItemStatusPassedModalFormNameField = lessonItemStatusPassedModalForm.querySelector("#lessonItemStatusPassedModalFormNameField")
const lessonItemStatusPassedModalFormNameError = lessonItemStatusPassedModalForm.querySelector("#lessonItemStatusPassedModalFormNameError")
const lessonItemStatusPassedModalFormMaterialsField = lessonItemStatusPassedModalForm.querySelector("#lessonItemStatusPassedModalFormMaterialsField")
const lessonItemStatusPassedModalFormMaterialsError = lessonItemStatusPassedModalForm.querySelector("#lessonItemStatusPassedModalFormMaterialsError")
const lessonItemStatusPassedModalFormLexisField = lessonItemStatusPassedModalForm.querySelector("#lessonItemStatusPassedModalFormLexisField")
const lessonItemStatusPassedModalFormLexisError = lessonItemStatusPassedModalForm.querySelector("#lessonItemStatusPassedModalFormLexisError")
const lessonItemStatusPassedModalFormGrammarField = lessonItemStatusPassedModalForm.querySelector("#lessonItemStatusPassedModalFormGrammarField")
const lessonItemStatusPassedModalFormGrammarError = lessonItemStatusPassedModalForm.querySelector("#lessonItemStatusPassedModalFormGrammarError")
const lessonItemStatusPassedModalFormNoteField = lessonItemStatusPassedModalForm.querySelector("#lessonItemStatusPassedModalFormNoteField")
const lessonItemStatusPassedModalFormNoteError = lessonItemStatusPassedModalForm.querySelector("#lessonItemStatusPassedModalFormNoteError")
const lessonItemStatusPassedModalFormOrgField = lessonItemStatusPassedModalForm.querySelector("#lessonItemStatusPassedModalFormOrgField")
const lessonItemStatusPassedModalFormOrgError = lessonItemStatusPassedModalForm.querySelector("#lessonItemStatusPassedModalFormOrgError")

//ButtonsPassed
const lessonItemStatusPassedModalButton = lessonItemStatusPassedModal.querySelector("#lessonItemStatusPassedModalButton")
const lessonItemStatusPassedButton = document.querySelector("#lessonItemStatusPassedButton")

//AlertPassed
const lessonItemStatusPassedModalErrorsAlert = lessonItemStatusPassedModal.querySelector("#lessonItemStatusPassedModalErrorsAlert")
const lessonItemStatusPassedModalErrors = lessonItemStatusPassedModal.querySelector("#lessonItemStatusPassedModalErrors")

//FormCancelled
const lessonItemStatusCancelledModalForm = lessonItemStatusCancelledModal.querySelector("#lessonItemStatusCancelledModalForm")
const lessonItemStatusCancelledModalFormRescheduling = lessonItemStatusCancelledModalForm.querySelector("#lessonItemStatusCancelledModalFormRescheduling")
const lessonItemStatusCancelledModalFormCancel = lessonItemStatusCancelledModalForm.querySelector("#lessonItemStatusCancelledModalFormCancel")
const lessonItemStatusCancelledModalFormManual = lessonItemStatusCancelledModalForm.querySelector("#lessonItemStatusCancelledModalFormManual")
const lessonItemStatusCancelledModalFormDate = lessonItemStatusCancelledModalForm.querySelector("#lessonItemStatusCancelledModalFormDate")
const lessonItemStatusCancelledModalFormStart = lessonItemStatusCancelledModalForm.querySelector("#lessonItemStatusCancelledModalFormStart")
const lessonItemStatusCancelledModalFormEnd = lessonItemStatusCancelledModalForm.querySelector("#lessonItemStatusCancelledModalFormEnd")
const lessonItemStatusCancelledModalFormPlace = lessonItemStatusCancelledModalForm.querySelector("#lessonItemStatusCancelledModalFormPlace")

//ButtonsCancelled
const lessonItemStatusCancelledModalButton = lessonItemStatusCancelledModal.querySelector("#lessonItemStatusCancelledModalButton")
const lessonItemStatusCancelledButton = document.querySelector("#lessonItemStatusCancelledButton")

//AlertCancelled
const lessonItemStatusCancelledModalErrorsAlert = lessonItemStatusCancelledModal.querySelector("#lessonItemStatusCancelledModalErrorsAlert")
const lessonItemStatusCancelledModalErrors = lessonItemStatusCancelledModal.querySelector("#lessonItemStatusCancelledModalErrors")
const lessonItemStatusCancelledModalWarningsAlert = lessonItemStatusCancelledModal.querySelector("#lessonItemStatusCancelledModalWarningsAlert")
const lessonItemStatusCancelledModalWarnings = lessonItemStatusCancelledModal.querySelector("#lessonItemStatusCancelledModalWarnings")

//Status
const lessonItemStatus = document.querySelector("#lessonItemStatus")
const lessonItemNotPassedElements = document.querySelectorAll(".lesson-item-not-passed")

lessonItemSetStatusPassedMain()
lessonItemSetStatusCancelledMain()
