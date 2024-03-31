async function planItemMain(){
    await planItemGetPhases()
    planItemShowPhases()
    plansItemPhaseModalSaveButton.addEventListener("click", function () {
        const phaseID = Number(this.attributes.getNamedItem("data-phase-id").value)
        if (phaseID === 0){
            planItemAddPhase()
        } else {
            planItemEditPhase(phaseID)
        }
    })
}

async function planItemGetPhases() {
    await fetch(`/api/v1/learning_plans/${planID}/phases/`)
        .then(async response => await response.json())
        .then(phases => phases_set = phases)
}

function planItemShowPhases(list = phases_set) {
    plansItemTableBody.innerHTML = ''

    list.map(phase => {
        plansItemTableBody.insertAdjacentHTML('beforeend', `
        <tr>
            <td style="max-width: 300px;">${phase.name}</td>
            <td>${phase.purpose}</td>
            <td>
                <button type="button" class="btn btn-primary" id="PlansItemTableEditButton" data-phase-id="${phase.id}">
                    <i class="fa-solid fa-pen-to-square"></i></button>
                                    <button type="button" class="btn btn-primary" id="PlansItemTableLessonsButton" data-phase-id="${phase.id}">
                    <i class="fa-solid fa-chevron-right"></i></button>
            </td>
        </tr>`)
    })

    plansItemTableBody.querySelectorAll("#PlansItemTableEditButton")
        .forEach(button => {
            button.addEventListener('click', function () {
                planItemAddModalPhase(Number(this.attributes.getNamedItem("data-phase-id").value))
            })
        })

    plansItemTableBody.insertAdjacentHTML('beforeend', `
        <tr data-phase-id="0">
            <td style="max-width: 300px;">Добавить этап</td>
            <td></td>
            <td>
                <button type="button" class="btn btn-primary" id="PlansItemTableAddButton">
                    <i class="fa-solid fa-plus"></i></button>
            </td>
        </tr>`)
    plansItemTableBody.querySelector("#PlansItemTableAddButton")
        .addEventListener('click', function () {
            planItemAddModalPhase(0)
        })
}

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
            await planItemGetPhases()
            planItemShowPhases()
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
        const phase = phases_set.find(phase => phase.id === phaseID)
        plansItemPhaseModalTitle.innerHTML = "Редактирование"
        plansItemPhaseModalNameField.value = phase.name
        plansItemPhaseModalPurposeField.value = phase.purpose
    }
    bsPlansItemPhaseModal.show()
}

async function planItemEditPhase(phaseID) {
    if (planItemClientValidation()) {
        const formData = new FormData(plansItemPhaseModalForm)
        const response = await fetch(`/api/v1/learning_plans/${planID}/phases/${phaseID}`, {
            method: "patch",
            credentials: 'same-origin',
            headers:{
                "X-CSRFToken": csrftoken,
            },
            body: formData
        })
        console.log(response.status)
        console.log(await response.json())
        // if (response.status === 201){
        //     bsPlansItemPhaseModal.hide()
        //     showToast("Успешно", "Этап успешно добавлен")
        //     await planItemGetPhases()
        //     planItemShowPhases()
        // } else if (response.status === 400){
        //     planItemServerValidation(await response.json())
        // } else {
        //     showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
        // }
    }
}

//Sets
let phases_set = []

//BootStrap Elements
const plansItemPhaseModal = document.querySelector("#PlansItemPhaseModal")
const bsPlansItemPhaseModal = new bootstrap.Modal(plansItemPhaseModal)

//Tables
const plansItemTableBody = document.querySelector("#PlansItemTableBody")
const plansItemPhaseModalTitle = plansItemPhaseModal.querySelector("#PlansItemPhaseModalTitle")

//Forms
const plansItemPhaseModalForm = plansItemPhaseModal.querySelector("#PlansItemPhaseModalForm")
const plansItemPhaseModalNameField = plansItemPhaseModalForm.querySelector("#PlansItemPhaseModalNameField")
const plansItemPhaseModalNameError = plansItemPhaseModalForm.querySelector("#PlansItemPhaseModalNameError")
const plansItemPhaseModalPurposeField = plansItemPhaseModalForm.querySelector("#PlansItemPhaseModalPurposeField")
const plansItemPhaseModalPurposeError = plansItemPhaseModalForm.querySelector("#PlansItemPhaseModalPurposeError")
const plansItemPhaseModalSaveButton = plansItemPhaseModal.querySelector("#PlansItemPhaseModalSaveButton")

planItemMain()