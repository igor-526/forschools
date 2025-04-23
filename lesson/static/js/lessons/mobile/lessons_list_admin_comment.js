function lessonsMobileAdminCommentMain(){
    lessonsMobileAdminCommentModalDelete.addEventListener("click", lessonsMobileAdminCommentModalDestroy)
    lessonsMobileAdminCommentModalSave.addEventListener("click", lessonsMobileAdminCommentModalUpdate)
}

function lessonsMobileAdminCommentModalSet(lessonID){
    lessonsMobileAdminCommentModalSelectedLesson = lessonID
    lessonsAPIGetItem(lessonID).then(request => {
        switch (request.status){
            case 200:
                lessonsMobileAdminCommentModalCommentField.value = request.response.admin_comment ?
                    request.response.admin_comment : ""
                bsLessonsMobileAdminCommentModal.show()
                break
            default:
                showErrorToast()
                break
        }
    })
}

function lessonsMobileAdminCommentValidate(errors=null){
    if (errors && errors.comment){
        lessonsMobileAdminCommentModalCommentField.classList.add("is-invalid")
        lessonsMobileAdminCommentModalCommentError.innerHTML = errors.comment
        return
    }

    let validationStatus = true
    lessonsMobileAdminCommentModalCommentField.classList.remove("is-invalid")
    lessonsMobileAdminCommentModalCommentError.innerHTML = ""
    const comment = lessonsMobileAdminCommentModalCommentField.value.trim()
    if (comment.length === 0){
        lessonsMobileAdminCommentModalCommentField.classList.add("is-invalid")
        lessonsMobileAdminCommentModalCommentError.innerHTML = "Комментарий не должен быть пустым<br>Для удаления комментария воспользуйтесь красной кнопкой"
        validationStatus = false
    } else if (comment.length > 2000){
        lessonsMobileAdminCommentModalCommentField.classList.add("is-invalid")
        lessonsMobileAdminCommentModalCommentError.innerHTML = "Комментарий не может содержать больше 2000 символов"
        validationStatus = false
    }
    return validationStatus
}

function lessonsMobileAdminCommentModalUpdate(){
    function getFormData(){
        const fd = new FormData()
        fd.set("comment", lessonsMobileAdminCommentModalCommentField.value.trim())
        return fd
    }

    if (lessonsMobileAdminCommentValidate()){
        lessonsAPISetAdminComment(lessonsMobileAdminCommentModalSelectedLesson, getFormData()).then(request => {
            switch (request.status){
                case 201:
                    bsLessonsMobileAdminCommentModal.hide()
                    showSuccessToast("Комментарий успешно добавлен. Обновите страницу при необходимости")
                    break
                case 400:
                    lessonsMobileAdminCommentValidate(request.response)
                    break
                default:
                    bsLessonsMobileAdminCommentModal.hide()
                    showErrorToast("Не удалось добавить комментарий")
                    break
            }
        })
    }
}

function lessonsMobileAdminCommentModalDestroy(){
    lessonsAPISetAdminComment(lessonsMobileAdminCommentModalSelectedLesson, null).then(request => {
        bsLessonsMobileAdminCommentModal.hide()
        switch (request.status){
            case 200:
                showSuccessToast("Комментарий успешно удалён. Обновите страницу при необходимости")
                break
            default:
                showErrorToast("Не удалось удалить комментарий")
                break
        }
    })
}

let lessonsMobileAdminCommentModalSelectedLesson = null
const lessonsMobileAdminCommentModal = document.querySelector("#lessonsMobileAdminCommentModal")
const bsLessonsMobileAdminCommentModal = new bootstrap.Modal(lessonsMobileAdminCommentModal)
const lessonsMobileAdminCommentModalCommentField = lessonsMobileAdminCommentModal.querySelector("#lessonsMobileAdminCommentModalCommentField")
const lessonsMobileAdminCommentModalCommentError = lessonsMobileAdminCommentModal.querySelector("#lessonsMobileAdminCommentModalCommentError")
const lessonsMobileAdminCommentModalDelete = lessonsMobileAdminCommentModal.querySelector("#lessonsMobileAdminCommentModalDelete")
const lessonsMobileAdminCommentModalSave = lessonsMobileAdminCommentModal.querySelector("#lessonsMobileAdminCommentModalSave")

lessonsMobileAdminCommentMain()