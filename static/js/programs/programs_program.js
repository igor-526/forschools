function programsProgramMain(){
    lProgramsAddProgramButton.addEventListener('click', async function(){
        await programsProgramSetModal(0)
    })
    lProgramProgramSaveButton.addEventListener('click', async function(){
        const programID = lProgramProgramSaveButton.attributes.getNamedItem("data-program-id").value
        await programsProgramEditSave(programID)
    })
}

function programsProgramReset(){
    programsProgramResetValidation()
    lProgramProgramForm.reset()
    lProgramProgramPhaseList.innerHTML = ""
    lProgramProgramPhaseListAdded.innerHTML = ""
}

async function programsProgramSetModal(programID=0){

    function getButtonGroup(phaseID){
        const buttonGroup = document.createElement("div")
        const buttonUp = document.createElement("button")
        const buttonDown = document.createElement("button")
        buttonGroup.classList.add("btn-group")
        buttonGroup.role = "button"
        buttonUp.type = "button"
        buttonDown.type = "button"
        buttonUp.classList.add("btn", "btn-outline-primary", "btn-sm", "me-2")
        buttonDown.classList.add("btn", "btn-outline-primary", "btn-sm", "me-2")
        buttonUp.innerHTML = '<i class="bi bi-chevron-up"></i>'
        buttonDown.innerHTML = '<i class="bi bi-chevron-down"></i>'
        buttonUp.setAttribute("data-action", "up")
        buttonDown.setAttribute("data-action", "down")
        buttonUp.setAttribute("data-phase-id", phaseID)
        buttonDown.setAttribute("data-phase-id", phaseID)
        buttonGroup.insertAdjacentElement("beforeend", buttonUp)
        buttonGroup.insertAdjacentElement("beforeend", buttonDown)
        buttonUp.addEventListener('click', function (event) {
            setListenerNaviButtons(buttonUp, event)
        })
        buttonDown.addEventListener('click', function (event) {
            setListenerNaviButtons(buttonDown, event)
        })
        return buttonGroup
    }

    function setListenerNaviButtons(element, event){
        const selectedPhases = lProgramProgramPhaseListAdded.querySelectorAll("a")
        const phaseIndex = Array.from(selectedPhases).indexOf(element.parentElement.parentElement)
        switch (element.attributes.getNamedItem("data-action").value) {
            case "up":
                if (phaseIndex !== 0){
                    lProgramProgramPhaseListAdded.insertBefore(selectedPhases[phaseIndex], selectedPhases[phaseIndex-1])
                }
                break
            case "down":
                lProgramProgramPhaseListAdded.insertBefore(selectedPhases[phaseIndex], selectedPhases[phaseIndex+2])
                break
        }

        event.stopPropagation()
    }

    function setListenerNotAdded(){
        const element = document.createElement("a")
        element.href = "#"
        element.classList.add("list-group-item", "list-group-item-action")
        element.innerHTML = `<span>${this.querySelector("span").innerHTML}</span>`
        element.insertAdjacentElement("afterbegin", getButtonGroup(this.attributes.getNamedItem("data-phase-id").value))
        element.setAttribute("data-phase-id", this.attributes.getNamedItem("data-phase-id").value)
        lProgramProgramPhaseListAdded.insertAdjacentElement('beforeend', element)
        this.remove()
        element.addEventListener("click", setListenerAdded)
    }

    function setListenerAdded(){
        const element = document.createElement("a")
        element.href = "#"
        element.classList.add("list-group-item", "list-group-item-action")
        element.innerHTML = `<span>${this.querySelector("span").innerHTML}</span>`
        element.setAttribute("data-phase-id", this.attributes.getNamedItem("data-phase-id").value)
        lProgramProgramPhaseList.insertAdjacentElement('beforeend', element)
        this.remove()
        element.addEventListener("click", setListenerNotAdded)
    }

    programsProgramReset()
    const phases = await programsAPIPhaseGetAll()
    if (programID === 0){
        lProgramProgramSaveButton.setAttribute("data-program-id", "0")
        if (phases.status === 200){
            phases.response.forEach(phase => {
                const element = document.createElement("a")
                element.href = "#"
                element.classList.add("list-group-item", "list-group-item-action")
                element.innerHTML = `<span>${phase.name}</span>`
                element.setAttribute("data-phase-id", phase.id)
                lProgramProgramPhaseList.insertAdjacentElement('beforeend', element)
                element.addEventListener("click", setListenerNotAdded)
            })
        }
    } else {
        programsAPIProgramGetItem(programID).then(request => {
            if (request.status === 200){
                lProgramProgramNameField.value = request.response.name
                lProgramProgramPurposeField.value = request.response.purpose
                const selectedPhases = request.response.phases_order.map(phaseID => {
                    return {
                        phaseID: Number(phaseID),
                        object: null
                    }
                })
                if (phases.status === 200){
                    phases.response.forEach(phase => {
                        if (selectedPhases.find(p => p.phaseID === phase.id) === undefined){
                            const element = document.createElement("a")
                            element.href = "#"
                            element.classList.add("list-group-item", "list-group-item-action")
                            element.innerHTML = `<span>${phase.name}</span>`
                            element.setAttribute("data-phase-id", phase.id)
                            lProgramProgramPhaseList.insertAdjacentElement('beforeend', element)
                            element.addEventListener("click", setListenerNotAdded)
                        } else {
                            selectedPhases.find(p => p.phaseID === phase.id).object = phase
                        }
                    })
                    selectedPhases.forEach(phase => {
                        const element = document.createElement("a")
                        element.href = "#"
                        element.classList.add("list-group-item", "list-group-item-action")
                        element.innerHTML = `<span>${phase.object.name}</span>`
                        element.insertAdjacentElement("afterbegin", getButtonGroup(phase.phaseID))
                        element.setAttribute("data-phase-id", phase.phaseID)
                        lProgramProgramPhaseListAdded.insertAdjacentElement('beforeend', element)
                        element.addEventListener("click", setListenerAdded)
                    })
                }
            }
        })
        lProgramProgramSaveButton.setAttribute("data-program-id", programID)
    }
}

function programsProgramResetValidation(){
    lProgramProgramNameField.classList.remove("is-invalid")
    lProgramProgramPurposeField.classList.remove("is-invalid")
    lProgramProgramNameError.innerHTML = ""
    lProgramProgramPurposeError.innerHTML = ""
}

function programsProgramClientValidation(){
    programsProgramResetValidation()
    let validationStatus = true
    if (lProgramProgramNameField.value === ""){
        lProgramProgramNameField.classList.add("is-invalid")
        lProgramProgramNameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }
    return validationStatus
}

function programsProgramServerValidation(errors){
    if (errors.hasOwnProperty("name")){
        lProgramProgramNameField.classList.add("is-invalid")
        lProgramProgramNameError.innerHTML = errors.name
    }
    if (errors.hasOwnProperty("purpose")){
        lProgramProgramPurposeField.classList.add("is-invalid")
        lProgramProgramPurposeError.innerHTML = errors.description
    }
}

async function programsProgramEditSave(programID=0){
    if (programsProgramClientValidation()){
        const formData = new FormData(lProgramProgramForm)
        const phasesList = Array.from(lProgramProgramPhaseListAdded.querySelectorAll('a')).map(element => {
            return element.attributes.getNamedItem("data-phase-id").value
        })
        phasesList.forEach(phaseID => {
            formData.append("phases_order", phaseID)
        })
        if (programID === "0"){
            programsAPIProgramCreate(formData).then(request => {
                switch (request.status){
                    case 201:
                        bsModalLProgramProgram.hide()
                        showSuccessToast("Программа успешно создана")
                        break
                    case 400:
                        programsProgramServerValidation(request.response)
                        break
                    default:
                        bsModalLProgramProgram.hide()
                        showErrorToast()
                        break
                }
            })
        } else {
            programsAPIProgramUpdate(programID, formData).then(request => {
                switch (request.status){
                    case 200:
                        bsModalLProgramProgram.hide()
                        showSuccessToast("Программа успешно изменена")
                        break
                    case 400:
                        programsProgramServerValidation(request.response)
                        break
                    default:
                        bsModalLProgramProgram.hide()
                        showErrorToast()
                        break
                }
            })
        }
    }
}

//bootstrap Elements
const modalLProgramProgram = document.querySelector("#modalLProgramProgram")
const bsModalLProgramProgram = new bootstrap.Modal(modalLProgramProgram)

//phases
const lProgramProgramPhaseList = modalLProgramProgram.querySelector("#modalLProgramProgramPhaseList")
const lProgramProgramPhaseListAdded = modalLProgramProgram.querySelector("#modalLProgramProgramPhaseListAdded")

//main form
const lProgramProgramForm = modalLProgramProgram.querySelector("#modalLProgramProgramForm")
const lProgramProgramNameField = lProgramProgramForm.querySelector("#modalLProgramProgramNameField")
const lProgramProgramNameError = lProgramProgramForm.querySelector("#modalLProgramProgramNameError")
const lProgramProgramPurposeField = lProgramProgramForm.querySelector("#modalLProgramProgramPurposeField")
const lProgramProgramPurposeError = lProgramProgramForm.querySelector("#modalLProgramProgramPurposeError")

//buttons
const lProgramProgramSaveButton = modalLProgramProgram.querySelector("#modalLProgramProgramSaveButton")
const lProgramsAddProgramButton = document.querySelector("#lProgramsAddProgramButton")


programsProgramMain()