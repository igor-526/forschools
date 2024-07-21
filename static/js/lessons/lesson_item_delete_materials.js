function lessonItemDeleteMaterialsMain(){
    lessonItemDeleteMaterialsModalButton.addEventListener("click", lessonItemDeleteMaterialsDelete)
}

function lessonItemDeleteMaterialsSetModal(materialsID){
    lessonItemDeleteMaterialsIdsArray = materialsID
    bsLessonItemDeleteMaterialsModal.show()
}

function lessonItemDeleteMaterialsDelete(){

}


const lessonItemDeleteMaterialsModal = document.querySelector("#lessonItemDeleteMaterialsModal")
const bsLessonItemDeleteMaterialsModal = new bootstrap.Modal(lessonItemDeleteMaterialsModal)
const lessonItemDeleteMaterialsModalButton = document.querySelector("#lessonItemDeleteMaterialsModalButton")
let lessonItemDeleteMaterialsIdsArray = []

lessonItemDeleteMaterialsMain()