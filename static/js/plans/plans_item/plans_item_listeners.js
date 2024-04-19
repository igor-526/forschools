function plansItemListenersPhaseModal(){
    plansItemPhaseModalSaveButton.addEventListener("click", function () {
        const phaseID = Number(this.attributes.getNamedItem("data-phase-id").value)
        if (phaseID === 0){
            planItemAddPhase()
        } else {
            planItemEditPhase(phaseID)
        }
    })
}

function plansItemListenersPhaseEdit(){
    plansItemTableBody.querySelectorAll("#PlansItemTableEditButton")
        .forEach(button => {
            button.addEventListener('click', function () {
                planItemAddModalPhase(Number(this.attributes.getNamedItem("data-phase-id").value))
            })
        })

    plansItemTableBody.querySelector("#PlansItemTableAddButton")
        .addEventListener('click', function () {
            planItemAddModalPhase(0)
        })
}

function plansItemListenersLessonsAddEdit(){
    plansItemTableBody.querySelectorAll("#PlansItemLessonTableAddButton, #PlansItemLessonEditButton")
        .forEach(button => {
            button.addEventListener("click", function () {
                phaseItemAddModalLesson(Number(this.attributes.getNamedItem("data-phase-id").value),
                    Number(this.attributes.getNamedItem("data-lesson-id").value))
            })
        })
}

function plansItemListenersLessonModalSave(){
    plansItemPhaseLessonModalSaveButton.addEventListener("click", function () {
    if (this.attributes.getNamedItem("data-lesson-id").value === "0"){
        phaseItemLessonAdd(this.attributes.getNamedItem("data-phase-id").value)
    } else {
        phaseItemLessonEdit(this.attributes.getNamedItem("data-phase-id").value,
            this.attributes.getNamedItem("data-lesson-id").value)
    }
})
}

