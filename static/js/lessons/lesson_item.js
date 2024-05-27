function lessonItemMain(){
    if (lessonItemAddMaterialsButton !== null){
        lessonItemAddMaterialsButton.addEventListener("click", function () {
            materialEmbedAction = "addToLesson"
            lessonsAPIGetItem(lessonID).then(request => {
                switch (request.status){
                    case 200:
                        materialsEmbedSet(
                            request.response.materials.map(material => {
                                return material.id
                            })
                        )
                        break
                    default:
                        showErrorToast()
                        break
                }
            })
        })
    }
}

//Buttons
const lessonItemAddMaterialsButton = document.querySelector("#LessonItemAddMaterialsButton")
const lessonItemSendMaterialsButton = document.querySelector("#LessonItemSendMaterialsButton")

//Lists
const lessonItemMaterialsList = document.querySelector("#lessonItemMaterialsList")

lessonItemMain()