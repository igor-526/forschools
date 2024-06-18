function lessonItemSetStatusMain(){
    lessonItemStatusPassedButton.addEventListener('click', lessonItemSetStatusReset)
    lessonItemStatusPassedModalButton.addEventListener('click', lessonItemSetStatusSet)
}

function lessonItemSetStatusReset(validationOnly = false){
    if (validationOnly === false){
        lessonItemStatusPassedModalNoteField.value = ""
    }
    lessonItemStatusPassedModalNoteField.classList.remove("is-invalid")
    lessonItemStatusPassedModalNoteError.innerHTML = ""
    lessonItemStatusPassedModalErrors.innerHTML = ""
    lessonItemStatusPassedModalErrorsAlert.classList.add("d-none")
}

function lessonItemSetStatusClientValidation(){
    lessonItemSetStatusReset(true)
    let validationStatus = true
    if (lessonItemStatusPassedModalNoteField.value.length > 2000){
        lessonItemStatusPassedModalNoteField.classList.remove("is-invalid")
        lessonItemStatusPassedModalNoteError.innerHTML = "Длина сообщения не может превышать 2000 символов"
        validationStatus = false
    }
    return validationStatus
}

function lessonItemSetStatusSet(){
    if (lessonItemSetStatusClientValidation()){
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

//bootstrap Elements
const lessonItemStatusPassedModal = document.querySelector("#lessonItemStatusPassedModal")
const bsLessonItemStatusPassedModal = new bootstrap.Modal(lessonItemStatusPassedModal)

//Form
const lessonItemStatusPassedModalForm = lessonItemStatusPassedModal.querySelector("#lessonItemStatusPassedModalForm")
const lessonItemStatusPassedModalNoteField = lessonItemStatusPassedModalForm.querySelector("#lessonItemStatusPassedModalNoteField")
const lessonItemStatusPassedModalNoteError = lessonItemStatusPassedModalForm.querySelector("#lessonItemStatusPassedModalNoteError")

//Buttons
const lessonItemStatusPassedModalButton = lessonItemStatusPassedModal.querySelector("#lessonItemStatusPassedModalButton")
const lessonItemStatusPassedButton = document.querySelector("#lessonItemStatusPassedButton")

//Alert
const lessonItemStatusPassedModalErrorsAlert = lessonItemStatusPassedModal.querySelector("#lessonItemStatusPassedModalErrorsAlert")
const lessonItemStatusPassedModalErrors = lessonItemStatusPassedModal.querySelector("#lessonItemStatusPassedModalErrors")

//Status
const lessonItemStatus = document.querySelector("#lessonItemStatus")
const lessonItemNotPassedElements = document.querySelectorAll(".lesson-item-not-passed")

lessonItemSetStatusMain()