function lessonItemSendMaterialsMain(){
    lessonItemSendTGModalButton.addEventListener("click", lessonItemSendMaterialsSend)
}

function lessonItemSendMaterialsSetModal(materials){
    lessonItemSendMaterialsSelectedArray = materials
    bsLessonItemSendTGModal.show()
}

function lessonItemSendMaterialsSend(){
    telegramAPISendLessonMaterials(lessonID, lessonItemSendMaterialsSelectedArray).then(request => {
        switch (request.status){
            case 200:
                bsLessonItemSendTGModal.hide()
                showSuccessToast("Материалы успешно отправлены")
                const checks = lessonItemMaterialsList.querySelectorAll("input")
                checks.forEach(check => {
                    check.checked = false
                })
                lessonItemSendMaterialsButton.disabled = true
                LessonItemDeleteMaterialsButton.disabled = true
                lessonItemCheckedMaterials = []
                LessonItemCheckMaterialsButton.attributes.getNamedItem("data-action").value = "check"
                break
            default:
                bsLessonItemSendTGModal.hide()
                showErrorToast()
                break
        }
    })
}

const lessonItemSendTGModal = document.querySelector("#lessonItemSendTGModal")
const bsLessonItemSendTGModal = new bootstrap.Modal(lessonItemSendTGModal)
const lessonItemSendTGModalButton = lessonItemSendTGModal.querySelector("#lessonItemSendTGModalButton")
let lessonItemSendMaterialsSelectedArray = []

lessonItemSendMaterialsMain()