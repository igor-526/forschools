function planItemPreHWCommentMain(){
    plansItemPreHWCommentButton.addEventListener("click", planItemPreHWCommentSetModal)
    plansItemPreHWCommentModalDeleteButton.addEventListener("click", planItemPreHWCommentDelete)
    plansItemPreHWCommentModalSaveButton.addEventListener("click", planItemPreHWCommentSave)
}

function planItemPreHWCommentSetModal(){
    plansAPIGetItem(planID).then(request => {
        switch (request.status){
            case 200:
                if (request.response.pre_hw_comment){
                    plansItemPreHWCommentModalField.innerHTML = request.response.pre_hw_comment
                } else {
                    plansItemPreHWCommentModalField.innerHTML = ""
                }
                bsPlansItemPreHWCommentModal.show()
                break
            default:
                showErrorToast("")
                break
        }
    })
}

function planItemPreHWCommentValidate(){
    plansItemPreHWCommentModalField.classList.remove("is-invalid")
    plansItemPreHWCommentModalFieldError.innerHTML = ""
    let validationStatus = true
    const value = plansItemPreHWCommentModalField.value.trim()
    if (value === ""){
        plansItemPreHWCommentModalField.classList.add("is-invalid")
        plansItemPreHWCommentModalFieldError.innerHTML = "Поле не может быть пустым. Для удаления комментария воспользуйтесь кнопкой <b>удалить</b>"
        validationStatus = false
    }
    if (value.length > 1000){
        plansItemPreHWCommentModalField.classList.add("is-invalid")
        plansItemPreHWCommentModalFieldError.innerHTML = `Количество символов не может превышать 1000. У вас ${value.length}`
        validationStatus = false
    }
    return validationStatus
}

function planItemPreHWCommentSave(){
    function getFormData(){
        const fd = new FormData()
        fd.set("pre_hw_comment", plansItemPreHWCommentModalField.value.trim())
        return fd
    }

    if (planItemPreHWCommentValidate()){
        planItemAPIPreHWComment(planID, getFormData()).then(request => {
            bsPlansItemPreHWCommentModal.hide()
            switch (request.status){
                case 201:
                    showSuccessToast("Комментарий перед формированием ДЗ успешно изменён")
                    setTimeout(function () {
                        location.reload()
                    }, 750)
                    break
                case 403:
                    showErrorToast("Недостаточно прав")
                    break
                default:
                    showErrorToast()
                    break
            }
        })
    }
}

function planItemPreHWCommentDelete(){
        planItemAPIPreHWComment(planID).then(request => {
            bsPlansItemPreHWCommentModal.hide()
            switch (request.status){
                case 201:
                    showSuccessToast("Комментарий перед формированием ДЗ успешно удалён")
                    setTimeout(function () {
                        location.reload()
                    }, 750)
                    break
                case 403:
                    showErrorToast("Недостаточно прав")
                    break
                default:
                    showErrorToast()
                    break
            }
        })
}

const plansItemPreHWCommentButton = document.querySelector("#plansItemPreHWCommentButton")
const plansItemPreHWCommentModal = document.querySelector("#plansItemPreHWCommentModal")
const bsPlansItemPreHWCommentModal = new bootstrap.Modal(plansItemPreHWCommentModal)
const plansItemPreHWCommentModalField = plansItemPreHWCommentModal.querySelector("#plansItemPreHWCommentModalField")
const plansItemPreHWCommentModalFieldError = plansItemPreHWCommentModal.querySelector("#plansItemPreHWCommentModalFieldError")
const plansItemPreHWCommentModalDeleteButton = plansItemPreHWCommentModal.querySelector("#plansItemPreHWCommentModalDeleteButton")
const plansItemPreHWCommentModalSaveButton = plansItemPreHWCommentModal.querySelector("#plansItemPreHWCommentModalSaveButton")
planItemPreHWCommentMain()