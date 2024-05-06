function programsPhaseMain(){
    lProgramsAddPhaseButton.addEventListener("click", async function(){
        await programsPhaseSetModal(0)
    })
    lProgramPhaseSaveButton.addEventListener("click", async function(){
        const phaseID = lProgramPhaseSaveButton.attributes.getNamedItem("data-phase-id").value
        await programsPhaseEditSave(phaseID)
    })
}

function programsPhaseReset(){
    programsPhaseResetValidation()
    lProgramPhaseForm.reset()
}

async function programsPhaseSetModal(phaseID=0){
    programsPhaseReset()
    if (phaseID === 0){
        lProgramPhaseSaveButton.setAttribute("data-phase-id", "0")
    } else {
        programsAPIPhaseGetItem(phaseID).then(request => {
            if (request.status === 200){
                lProgramPhaseNameField.value = request.response.name
                lProgramPhasePurposeField.value = request.response.purpose
            }
        })
        lProgramPhaseSaveButton.setAttribute("data-phase-id", phaseID)
    }
}

function programsPhaseResetValidation(){
    lProgramPhaseNameField.classList.remove("is-invalid")
    lProgramPhasePurposeField.classList.remove("is-invalid")
    lProgramPhasePurposeError.innerHTML = ""
    lProgramPhaseNameError.innerHTML = ""
}

function programsPhaseClientValidation(){
    programsPhaseResetValidation()
    let validationStatus = true
    if (lProgramPhaseNameField.value === ""){
        lProgramPhaseNameField.classList.add("is-invalid")
        lProgramPhaseNameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }
    return validationStatus
}

function programsPhaseServerValidation(errors){
    if (errors.hasOwnProperty("name")){
        lProgramPhaseNameField.classList.add("is-invalid")
        lProgramPhaseNameError.innerHTML = errors.name
    }
    if (errors.hasOwnProperty("purpose")){
        lProgramPhasePurposeField.classList.add("is-invalid")
        lProgramPhasePurposeError.innerHTML = errors.description
    }
}

async function programsPhaseEditSave(phaseID=0){
    if (programsPhaseClientValidation()){
        const formData = new FormData(lProgramPhaseForm)
        if (phaseID === "0"){
            programsAPIPhaseCreate(formData).then(request => {
                switch (request.status){
                    case 201:
                        bsModalLProgramPhase.hide()
                        showSuccessToast("Этап успешно создан")
                        break
                    case 400:
                        programsPhaseServerValidation(request.response)
                        break
                    default:
                        bsModalLProgramPhase.hide()
                        showErrorToast()
                        break
                }
            })
        } else {
            programsAPIPhaseUpdate(phaseID, formData).then(request => {
                switch (request.status){
                    case 200:
                        bsModalLProgramPhase.hide()
                        showSuccessToast("Этап успешно изменён")
                        break
                    case 400:
                        programsProgramServerValidation(request.response)
                        break
                    default:
                        bsModalLProgramPhase.hide()
                        showErrorToast()
                        break
                }
            })
        }
    }
}

//bootstrap Elements
const modalLProgramPhase = document.querySelector("#modalLProgramPhase")
const bsModalLProgramPhase = new bootstrap.Modal(modalLProgramPhase)

//main form
const lProgramPhaseForm = modalLProgramPhase.querySelector("#modalLProgramPhaseForm")
const lProgramPhaseNameField = modalLProgramPhaseForm.querySelector("#modalLProgramPhaseNameField")
const lProgramPhaseNameError = modalLProgramPhaseForm.querySelector("#modalLProgramPhaseNameError")
const lProgramPhasePurposeField = modalLProgramPhaseForm.querySelector("#modalLProgramPhasePurposeField")
const lProgramPhasePurposeError = modalLProgramPhaseForm.querySelector("#modalLProgramPhasePurposeError")

//buttons
const lProgramPhaseSaveButton = modalLProgramPhase.querySelector("#modalLProgramPhaseSaveButton")
const lProgramsAddPhaseButton = document.querySelector("#lProgramsAddPhaseButton")

programsPhaseMain()