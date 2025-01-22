function lessonItemDeleteMaterialsMain(){
    lessonItemDeleteMaterialsModalButton.addEventListener("click", lessonItemDeleteMaterialsDelete)
}

function lessonItemDeleteMaterialsSetModal(materialsID){
    lessonItemDeleteMaterialsIdsArray = materialsID
    bsLessonItemDeleteMaterialsModal.show()
}

function lessonItemDeleteMaterialsDelete(){
    lessonsAPIDeleteMaterials(lessonItemDeleteMaterialsIdsArray, lessonID).then(request => {
        switch (request.status){
            case 204:
                bsLessonItemDeleteMaterialsModal.hide()
                lessonItemSetMaterials(lessonItemDeleteMaterialsIdsArray, true)
                showSuccessToast("Материалы успешно удалены")
                break
            case 400:
                bsLessonItemDeleteMaterialsModal.hide()
                showErrorToast()
                break
        }
    })
}


const lessonItemDeleteMaterialsModal = document.querySelector("#lessonItemDeleteMaterialsModal")
const bsLessonItemDeleteMaterialsModal = new bootstrap.Modal(lessonItemDeleteMaterialsModal)
const lessonItemDeleteMaterialsModalButton = lessonItemDeleteMaterialsModal.querySelector("#lessonItemDeleteMaterialsModalButton")
let lessonItemDeleteMaterialsIdsArray = []

lessonItemDeleteMaterialsMain()