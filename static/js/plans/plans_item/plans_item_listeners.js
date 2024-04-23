function plansItemListenersPhaseModal(){
    plansItemPhaseModalSaveButton.addEventListener("click", async function () {
        const phaseID = Number(this.attributes.getNamedItem("data-phase-id").value)
        if (phaseID === 0){
            await planItemAddPhase()
        } else {
            await planItemEditPhase(phaseID)
        }
    })
    plansItemPhaseDeleteModalButton.addEventListener('click', async function(){
        await planItemDestroyPhase(this.attributes.getNamedItem('data-phase-id').value)
    })
}

function plansItemListenersPhaseEdit(){
    plansItemTableBody.querySelectorAll(".phase-table-button-edit")
        .forEach(button => {
            button.addEventListener('click', function () {
                planItemAddModalPhase(Number(this.attributes.getNamedItem("data-phase-id").value))
            })
        })

    plansItemTableBody.querySelectorAll(".phase-table-button-delete")
        .forEach(button => {
            button.addEventListener('click', function (){
                plansItemPhaseDeleteModalButton.attributes.getNamedItem('data-phase-id').value =
                    button.attributes.getNamedItem('data-phase-id').value
            })

        })

    plansItemTableBody.querySelector("#PlansItemTableAddButton")
        .addEventListener('click', function () {
            planItemAddModalPhase(0)
        })
}

function plansItemListenersLessonsAddEdit(){
    plansItemTableBody.querySelectorAll(".phase-lesson-button-add, .phase-lesson-button-edit")
        .forEach(button => {
            button.addEventListener("click", function () {
                phaseItemAddModalLesson(Number(this.attributes.getNamedItem("data-phase-id").value),
                    Number(this.attributes.getNamedItem("data-lesson-id").value))
            })
        })
    plansItemTableBody.querySelectorAll(".phase-lesson-button-delete")
        .forEach(button => {
            button.addEventListener("click", function (){
                lessonDeleteModalButton.attributes.getNamedItem('data-lesson-id').value =
                    button.attributes.getNamedItem('data-lesson-id').value
            })
        })
}

function plansItemListenersLessonModalSave(){
    plansItemPhaseLessonModalSaveButton.addEventListener("click", async function () {
        if (this.attributes.getNamedItem("data-lesson-id").value === "0"){
            await phaseItemLessonAdd(this.attributes.getNamedItem("data-phase-id").value)
        } else {
            await phaseItemLessonEdit(this.attributes.getNamedItem("data-phase-id").value,
                this.attributes.getNamedItem("data-lesson-id").value)
        }
    })
    lessonDeleteModalButton.addEventListener("click", async function(){
        await phaseItemLessonDestroy(this.attributes.getNamedItem('data-lesson-id').value)
    })
}
