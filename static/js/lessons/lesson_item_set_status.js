function lessonItemSetStatusPassedMain(){
    lessonItemStatusPassedButton.addEventListener('click', lessonItemSetStatusPassedReset)
    lessonItemStatusPassedModalButton.addEventListener('click', lessonItemSetStatusPassedSet)
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
    if (validationOnly === false){
        lessonItemStatusPassedModalNoteField.value = ""
    }
    lessonItemStatusPassedModalNoteField.classList.remove("is-invalid")
    lessonItemStatusPassedModalNoteError.innerHTML = ""
    lessonItemStatusPassedModalErrors.innerHTML = ""
    lessonItemStatusPassedModalErrorsAlert.classList.add("d-none")
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

function lessonItemSetStatusPassedValidation(){
    lessonItemSetStatusPassedReset(true)
    let validationStatus = true
    if (lessonItemStatusPassedModalNoteField.value.length > 2000){
        lessonItemStatusPassedModalNoteField.classList.remove("is-invalid")
        lessonItemStatusPassedModalNoteError.innerHTML = "Длина сообщения не может превышать 2000 символов"
        validationStatus = false
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
    if (lessonItemSetStatusPassedValidation()){
        lessonsAPISetStatus(lessonID, new FormData(lessonItemStatusPassedModalForm)).then(request => {
            switch (request.status){
                case 201:
                    showSuccessToast("Урок успешно проведён!")
                    bsLessonItemStatusPassedModal.hide()
                    lessonItemStatus.innerHTML = "Занятие проведено"
                    lessonItemStatus.classList.remove("list-group-item-warning")
                    lessonItemStatus.classList.add("list-group-item-success")
                    lessonItemNotPassedElements.forEach(e => {
                        e.remove()
                    })
                    break
                case 400:
                    lessonItemStatusPassedModalErrors.innerHTML = request.response.error
                    lessonItemStatusPassedModalErrorsAlert.classList.remove("d-none")
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
                    console.log(request.response)
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
const lessonItemStatusPassedModalNoteField = lessonItemStatusPassedModalForm.querySelector("#lessonItemStatusPassedModalNoteField")
const lessonItemStatusPassedModalNoteError = lessonItemStatusPassedModalForm.querySelector("#lessonItemStatusPassedModalNoteError")

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
