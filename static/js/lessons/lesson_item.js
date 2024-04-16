function lessonItemMain(){
    if (lessonItemAddMaterialsButton !== null){
        lessonItemAddMaterialsButton.addEventListener("click", function () {
            materialEmbedAction = "addToLesson"
        })
    }
}

//Buttons
const lessonItemAddMaterialsButton = document.querySelector("#LessonItemAddMaterialsButton")
const lessonItemSendMaterialsButton = document.querySelector("#LessonItemSendMaterialsButton")

lessonItemMain()