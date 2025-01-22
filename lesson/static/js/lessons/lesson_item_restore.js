function lessonItemRestoreMain(){
    lessonItemRestoreModalButton.addEventListener("click", lessonItemRestoreUpdate)
}

function lessonItemRestoreModalSet(){
    lessonsAPIGetItem(lessonID).then(request => {
        switch (request.status){
            case 200:
                if (request.response.from_program_lesson){
                    lessonItemRestoresModalFormInfo.checked = false
                    lessonItemRestoresModalFormMaterials.checked = false
                    lessonItemRestoresModalFormHW.checked = false
                    switch (request.response.status){
                        case 0:
                            lessonItemRestoresModalFormInfo.disabled = false
                            lessonItemRestoresModalFormMaterials.disabled = false
                            lessonItemRestoresModalFormHW.disabled = false
                            break
                        case 1:
                            lessonItemRestoresModalFormInfo.disabled = false
                            lessonItemRestoresModalFormMaterials.disabled = false
                            lessonItemRestoresModalFormHW.disabled = true
                            break
                        case 2:
                            lessonItemRestoresModalFormInfo.disabled = false
                            lessonItemRestoresModalFormMaterials.disabled = true
                            lessonItemRestoresModalFormHW.disabled = true
                            break
                    }
                    bslessonItemRestoresModal.show()
                } else {
                    showErrorToast("Шаблон отсутствует")
                }
                break
            default:
                showErrorToast()
                break
        }
    })
}

function lessonItemRestoreUpdate(){
    lessonsAPIRestore(lessonID, new FormData(lessonItemRestoresModalForm)).then(request => {
        switch (request.status){
            case 200:
                bslessonItemRestoresModal.hide()
                showSuccessToast("Занятие успешно восстановлено")
                setTimeout(function () {
                    location.reload()
                }, 500)
                break
            case 400:
                bslessonItemRestoresModal.hide()
                showErrorToast()
        }
    })
}

const lessonItemRestoresModal = document.querySelector("#lessonItemRestoresModal")
const bslessonItemRestoresModal = new bootstrap.Modal(lessonItemRestoresModal)
const lessonItemRestoresModalForm = lessonItemRestoresModal.querySelector("#lessonItemRestoresModalForm")
const lessonItemRestoresModalFormInfo = lessonItemRestoresModalForm.querySelector("#lessonItemRestoresModalFormInfo")
const lessonItemRestoresModalFormMaterials = lessonItemRestoresModalForm.querySelector("#lessonItemRestoresModalFormMaterials")
const lessonItemRestoresModalFormHW = lessonItemRestoresModalForm.querySelector("#lessonItemRestoresModalFormHW")
const lessonItemRestoreModalButton = lessonItemRestoresModal.querySelector("#lessonItemRestoreModalButton")

lessonItemRestoreMain()