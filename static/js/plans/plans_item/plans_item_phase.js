function planItemClientValidation(){
    plansItemPhaseModalNameField.classList.remove("is-invalid")
    plansItemPhaseModalPurposeField.classList.remove("is-invalid")
    plansItemPhaseModalNameError.innerHTML = ''
    plansItemPhaseModalPurposeError.innerHTML = ''

    let validationStatus = true

    if (plansItemPhaseModalNameField.value === ""){
        plansItemPhaseModalNameField.classList.add("is-invalid")
        plansItemPhaseModalNameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    if (plansItemPhaseModalPurposeField.value === ""){
        plansItemPhaseModalPurposeField.classList.add("is-invalid")
        plansItemPhaseModalPurposeError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    return validationStatus
}

function planItemServerValidation(errors){
    plansItemPhaseModalNameField.classList.add("is-invalid")
    plansItemPhaseModalNameError.innerHTML = errors.name
}

async function planItemAddPhase() {
    if (planItemClientValidation()) {
        const formData = new FormData(plansItemPhaseModalForm)
        const response = await fetch(`/api/v1/learning_plans/${planID}/phases/`, {
            method: "post",
            credentials: 'same-origin',
            headers:{
                "X-CSRFToken": csrftoken,
            },
            body: formData
        })
        if (response.status === 201){
            bsPlansItemPhaseModal.hide()
            showToast("Успешно", "Этап успешно добавлен")
            await planItemMain()
        } else if (response.status === 400){
            planItemServerValidation(await response.json())
        } else {
            showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
        }
    }
}

function planItemAddModalPhase(phaseID = 0) {
    plansItemPhaseModalSaveButton.attributes
        .getNamedItem("data-phase-id").value=`${phaseID}`
    if (phaseID === 0){
        plansItemPhaseModalTitle.innerHTML = "Новый этап обучения"
        plansItemPhaseModalNameField.value = ""
        plansItemPhaseModalPurposeField.value = ""
    } else {
        const phase = phasesArray.find(phase => phase.id === phaseID)
        plansItemPhaseModalTitle.innerHTML = "Редактирование"
        plansItemPhaseModalNameField.value = phase.name
        plansItemPhaseModalPurposeField.value = phase.purpose
    }
    bsPlansItemPhaseModal.show()
}

async function planItemEditPhase(phaseID) {
    if (planItemClientValidation()) {
        const formData = new FormData(plansItemPhaseModalForm)
        const response = await fetch(`/api/v1/learning_plans/${planID}/phases/${phaseID}/`, {
            method: "PATCH",
            credentials: 'same-origin',
            headers:{
                "X-CSRFToken": csrftoken,
            },
            body: formData
        })
        if (response.status === 201){
            bsPlansItemPhaseModal.hide()
            showToast("Успешно", "Этап успешно отредактирован")
            await planItemGetPhases()
            planItemShowPhases()
        } else if (response.status === 400){
            planItemServerValidation(await response.json())
        } else {
            showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
        }
    }
}

async function planItemDestroyPhase(phaseID){
    const request = await planItemAPIDestroyPhase(planID, phaseID)
    bsPlansItemPhaseDeleteModal.hide()
    if (request.status === 204){
        showToast("Успешно", "Этап успешно удалён")
        await planItemMain()
    } else {
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

const plansItemPhaseModal = document.querySelector("#PlansItemPhaseModal")
const bsPlansItemPhaseModal = new bootstrap.Modal(plansItemPhaseModal)
const plansItemPhaseDeleteModal = document.querySelector("#PhaseDeleteModal")
const bsPlansItemPhaseDeleteModal = new bootstrap.Modal(plansItemPhaseDeleteModal)

const plansItemPhaseModalTitle = plansItemPhaseModal.querySelector("#PlansItemPhaseModalTitle")

//Forms
const plansItemPhaseModalForm = plansItemPhaseModal.querySelector("#PlansItemPhaseModalForm")
const plansItemPhaseModalNameField = plansItemPhaseModalForm.querySelector("#PlansItemPhaseModalNameField")
const plansItemPhaseModalNameError = plansItemPhaseModalForm.querySelector("#PlansItemPhaseModalNameError")
const plansItemPhaseModalPurposeField = plansItemPhaseModalForm.querySelector("#PlansItemPhaseModalPurposeField")
const plansItemPhaseModalPurposeError = plansItemPhaseModalForm.querySelector("#PlansItemPhaseModalPurposeError")
const plansItemPhaseModalSaveButton = plansItemPhaseModal.querySelector("#PlansItemPhaseModalSaveButton")
const plansItemPhaseDeleteModalButton = plansItemPhaseDeleteModal.querySelector("#LearningPhaseDeleteModalButton")

plansItemListenersPhaseModal()