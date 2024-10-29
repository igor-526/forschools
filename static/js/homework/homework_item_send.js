function hwItemSendMain(){
    hwItemSendButton.addEventListener("click", hwItemSendSetModal)
    hwItemSendModalSendButton.addEventListener("click", hwItemSend)
}

function hwItemSendReset(validationOnly = false){
    function resetValidation(){
        hwItemSendModalFormCommentField.classList.remove("is-invalid")
        hwItemSendModalFormFileField.classList.remove("is-invalid")
        hwItemSendModalFormCommentError.innerHTML = ""
        hwItemSendModalFormFileError.innerHTML = ""
    }

    resetValidation()
    if (!validationOnly){
        hwItemSendModalForm.reset()
        hwItemSendModalAnswer.classList.add("d-none")
        hwItemSendModalAnswerBody.innerHTML = ""
    }

}

function hwItemSendSetModal(){
    hwItemSendReset()
    bsHwItemSendModal.show()
}

function hwItemSendValidation(errors = null){
    function setInvalid(error=null, errorElement=null, element=null){
        if (errorElement && error){
            errorElement.innerHTML = error
        }
        if (element){
            element.classList.add("is-invalid")
        }
        validationStatus = false
    }

    function validateComment(error = null){
        if (error){
            setInvalid(
                error,
                hwItemSendModalFormCommentError,
                hwItemSendModalFormCommentField
            )
        } else {
            if (hwItemSendModalFormCommentField.value.trim().length > 2000){
                setInvalid(
                    "Длина комментария не может превышать 2000 символов",
                    hwItemSendModalFormCommentError,
                    hwItemSendModalFormCommentField
                )
            }
        }
    }

    function validateFiles(error = null){
        if (error){
            setInvalid(
                error,
                hwItemSendModalFormFileError,
                hwItemSendModalFormFileField
            )
        } else {

        }
    }

    let validationStatus = true
    hwItemSendReset(true)
    if (errors){
        if (errors.hasOwnProperty("comment")){
            validateComment(errors.comment)
        }
        if (errors.hasOwnProperty("files")){
            validateFiles(errors.files)
        }
    } else {
        validateComment()
        validateFiles()
    }
    return validationStatus
}

function hwItemSend(){
    function getFD(){
        const fd = new FormData(hwItemSendModalForm)
        fd.append("status", 3)
        const comment = fd.get("comment")
        fd.set("comment", comment.trim())
        return fd
    }

    if (hwItemSendValidation()){
        homeworkAPISend(hwID, getFD()).then(request => {
            switch (request.status){
                case 201:
                    bsHwItemSendModal.hide()
                    showSuccessToast("Решение успешно отправлено!")
                    homeworkItemShowLogs([request.response], false)
                    break
                case 400:
                    hwItemSendValidation(request.response)
                    break
                default:
                    bsHwItemSendModal.hide()
                    showErrorToast()
                    break
            }
        })
    }
}

const hwItemSendButton = document.querySelector("#hwItemSendButton")
const hwItemSendModal = document.querySelector("#hwItemSendModal")
const bsHwItemSendModal = new bootstrap.Modal(hwItemSendModal)
const hwItemSendModalForm = hwItemSendModal.querySelector("#hwItemSendModalForm")
const hwItemSendModalFormCommentField = hwItemSendModalForm.querySelector("#hwItemSendModalFormCommentField")
const hwItemSendModalFormCommentError = hwItemSendModalForm.querySelector("#hwItemSendModalFormCommentError")
const hwItemSendModalFormFileField = hwItemSendModalForm.querySelector("#hwItemSendModalFormFileField")
const hwItemSendModalFormFileError = hwItemSendModalForm.querySelector("#hwItemSendModalFormFileError")
const hwItemSendModalAnswer = hwItemSendModal.querySelector("#hwItemSendModalAnswer")
const hwItemSendModalAnswerBody = hwItemSendModal.querySelector("#hwItemSendModalAnswerBody")
const hwItemSendModalSendButton = hwItemSendModal.querySelector("#hwItemSendModalSendButton")

hwItemSendMain()