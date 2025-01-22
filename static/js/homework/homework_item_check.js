function hwItemCheckMain(){
    hwItemCheckButton.addEventListener("click", hwItemCheckSetModal)
    hwItemCheckModalAcceptButton.addEventListener("click", function () {
        hwItemCheck(4)
    })
    hwItemCheckModalDeclineButton.addEventListener("click", function () {
        hwItemCheck(5)
    })
}

function hwItemCheckReset(validationOnly = false){
    function resetValidation(){
        hwItemCheckModalFormCommentField.classList.remove("is-invalid")
        hwItemCheckModalFormFileField.classList.remove("is-invalid")
        hwItemCheckModalFormCommentError.innerHTML = ""
        hwItemCheckModalFormFileError.innerHTML = ""
    }

    resetValidation()
    if (!validationOnly){
        hwItemCheckModalForm.reset()
        hwItemCheckModalAnswer.classList.add("d-none")
        hwItemCheckModalAnswerBody.innerHTML = ""
    }

}

function hwItemCheckSetModal(){
    hwItemCheckReset()
    homeworkAPIGetLogs(hwID, true).then(request => {
        switch (request.status){
            case 200:
                if (request.response.length > 0){
                    hwItemCheckModalAnswer.classList.remove("d-none")
                    request.response.forEach(log => {
                        hwItemCheckModalAnswerBody.insertAdjacentElement("beforeend", homeworkItemLogGetBody(log))
                    })
                }
                break
            default:
                showErrorToast()
                break
        }
    })
    bsHwItemCheckModal.show()
}

function hwItemCheckValidation(errors = null){
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
                hwItemCheckModalFormCommentError,
                hwItemCheckModalFormCommentField
            )
        } else {
            if (hwItemCheckModalFormCommentField.value.trim().length > 2000){
                setInvalid(
                    "Длина комментария не может превышать 2000 символов",
                    hwItemCheckModalFormCommentError,
                    hwItemCheckModalFormCommentField
                )
            }
        }
    }

    function validateFiles(error = null){
        if (error){
            setInvalid(
                error,
                hwItemCheckModalFormFileError,
                hwItemCheckModalFormFileField
            )
        } else {

        }
    }

    let validationStatus = true
    hwItemCheckReset(true)
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

function hwItemCheck(status){
    function getFD(){
        const fd = new FormData(hwItemCheckModalForm)
        const comment = fd.get("comment")
        fd.set("comment", comment.trim())
        fd.append("status", status)
        return fd
    }

    if (hwItemCheckValidation()){
        homeworkAPISend(hwID, getFD(status)).then(request => {
            switch (request.status){
                case 201:
                    bsHwItemCheckModal.hide()
                    switch (status){
                        case 4:
                            showSuccessToast("ДЗ успешно принято!")
                            break
                        case 5:
                            showSuccessToast("ДЗ отправлено на доработку!")
                            break
                        default:
                            showSuccessToast("Успешно!")
                            break
                    }
                    homeworkItemShowLogs([request.response], false)
                    break
                case 400:
                    hwItemSendValidation(request.response)
                    break
                default:
                    bsHwItemCheckModal.hide()
                    showErrorToast()
                    break
            }
        })
    }
}

const hwItemCheckButton = document.querySelector("#hwItemCheckButton")
const hwItemCheckModal = document.querySelector("#hwItemCheckModal")
const bsHwItemCheckModal = new bootstrap.Modal(hwItemCheckModal)
const hwItemCheckModalForm = hwItemCheckModal.querySelector("#hwItemCheckModalForm")
const hwItemCheckModalFormCommentField = hwItemCheckModalForm.querySelector("#hwItemCheckModalFormCommentField")
const hwItemCheckModalFormCommentError = hwItemCheckModalForm.querySelector("#hwItemCheckModalFormCommentError")
const hwItemCheckModalFormFileField = hwItemCheckModalForm.querySelector("#hwItemCheckModalFormFileField")
const hwItemCheckModalFormFileError = hwItemCheckModalForm.querySelector("#hwItemCheckModalFormFileError")
const hwItemCheckModalAnswer = hwItemCheckModal.querySelector("#hwItemCheckModalAnswer")
const hwItemCheckModalAnswerBody = hwItemCheckModal.querySelector("#hwItemCheckModalAnswerBody")
const hwItemCheckModalAcceptButton = hwItemCheckModal.querySelector("#hwItemCheckModalAcceptButton")
const hwItemCheckModalDeclineButton = hwItemCheckModal.querySelector("#hwItemCheckModalDeclineButton")

hwItemCheckMain()