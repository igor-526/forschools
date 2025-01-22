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
        .addEventListener('click', async function () {
            await planItemAddModalPhase(0)
        })
}

function plansItemListenersLessonsAddEdit(){
    plansItemTableBody.querySelectorAll(".phase-lesson-button-add, .phase-lesson-button-edit")
        .forEach(button => {
            button.addEventListener("click", async function () {
                await phaseItemAddModalLesson(Number(this.attributes.getNamedItem("data-phase-id").value),
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
