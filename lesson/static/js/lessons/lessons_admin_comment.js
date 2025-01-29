function lessonsAdminCommentResetMain(){
    lessonsAdminCommentModalSaveButton.addEventListener("click", lessonsAdminCommentUpdate)
    lessonsAdminCommentModalDeleteButton.addEventListener("click", lessonsAdminCommentDestroy)
}

function lessonsAdminCommentResetModal(validationOnly = false){
    function resetValidation(){
        lessonsAdminCommentModalField.classList.remove("is-invalid")
        lessonsAdminCommentModalFieldError.innerHTML = ""
    }

    resetValidation()
    if (!validationOnly){
        lessonsAdminCommentModalField.value = ""
    }
}

function lessonsAdminCommentSetModal(lessonID, element, text=null){
    lessonsAdminCommentResetModal()
    lessonsAdminCommentSelectedLesson = lessonID
    lessonsAdminCommentSelectedElement = element
    if (text){
        lessonsAdminCommentModalField.value = text
    }
    bsLessonsAdminCommentModal.show()
}

function lessonsAdminCommentValidate(errors){
    let validationStatus = true
    lessonsAdminCommentResetModal(true)
    if (errors && errors.comment){
        lessonsAdminCommentModalField.classList.add("is-invalid")
        lessonsAdminCommentModalFieldError.innerHTML = errors.comment
        validationStatus = false
    } else {
        const commentLength = lessonsAdminCommentModalField.value.trim().length
        if (commentLength === 0){
            lessonsAdminCommentModalField.classList.add("is-invalid")
            lessonsAdminCommentModalFieldError.innerHTML = "Комментарий не должен быть пустым. " +
                "Для удаления комментария воспользуйтесь кнопкой УДАЛИТЬ"
            validationStatus = false
        }
        if (commentLength > 2000){
            lessonsAdminCommentModalField.classList.add("is-invalid")
            lessonsAdminCommentModalFieldError.innerHTML = `Комментарий не может содержать больше 2000 символов.
        У вас ${commentLength}`
            validationStatus = false
        }
    }
    return validationStatus
}

function lessonsAdminCommentUpdate(){
    function getFormData(){
        const fd = new FormData()
        fd.set("comment", lessonsAdminCommentModalField.value.trim())
        return fd
    }

    if (lessonsAdminCommentValidate()){
        lessonsAPISetAdminComment(lessonsAdminCommentSelectedLesson, getFormData()).then(request => {
            switch (request.status){
                case 201:
                    bsLessonsAdminCommentModal.hide()
                    showSuccessToast("Комментарий успешно добавлен")
                    lessonsShow(request.response, false, lessonsAdminCommentSelectedElement)
                    break
                case 400:
                    lessonsAdminCommentValidate(request.response)
                    break
                default:
                    bsLessonsAdminCommentModal.hide()
                    showErrorToast("Не удалось добавить комментарий")
                    break
            }
        })
    }
}

function lessonsAdminCommentDestroy(){
    lessonsAPISetAdminComment(lessonsAdminCommentSelectedLesson, null).then(request => {
        bsLessonsAdminCommentModal.hide()
        switch (request.status){
            case 200:
                showSuccessToast("Комментарий успешно удалён")
                lessonsShow(request.response, false, lessonsAdminCommentSelectedElement)
                break
            default:
                showErrorToast("Не удалось удалить комментарий")
                break
        }
    })
}

let lessonsAdminCommentSelectedLesson
let lessonsAdminCommentSelectedElement
const lessonsAdminCommentModal = document.querySelector("#lessonsAdminCommentModal")
const bsLessonsAdminCommentModal = new bootstrap.Modal(lessonsAdminCommentModal)
const lessonsAdminCommentModalField = lessonsAdminCommentModal.querySelector("#lessonsAdminCommentModalField")
const lessonsAdminCommentModalFieldError = lessonsAdminCommentModal.querySelector("#lessonsAdminCommentModalFieldError")
const lessonsAdminCommentModalDeleteButton = lessonsAdminCommentModal.querySelector("#lessonsAdminCommentModalDeleteButton")
const lessonsAdminCommentModalSaveButton = lessonsAdminCommentModal.querySelector("#lessonsAdminCommentModalSaveButton")
lessonsAdminCommentResetMain()