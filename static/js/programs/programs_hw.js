function programsHWMain(){
    lProgramsAddHWButton.addEventListener('click', async function(){
        await programsHWSetModal(0)
    })
    lProgramHWSaveButton.addEventListener('click', async function(){
        const hwID = lProgramHWSaveButton.attributes.getNamedItem("data-hw-id").value
        await programsHWEditSave(hwID)
    })
}

function programsHWReset(){
    programsHWResetValidation()
    lProgramHWForm.reset()
    modalLProgramHWMaterialsSet = []
    lProgramHWMaterialsList.innerHTML = '<li class="list-group-item">Материалы не прикреплены</li>'
}

async function programsHWSetModal(hwID=0){
    programsHWReset()
    materialEmbedAction = "programHW"
    materialsEmbedModalCloseButton.setAttribute("data-bs-target", "#modalLProgramHW")
    materialsEmbedModalAddButton.setAttribute("data-bs-target", "#modalLProgramHW")
    if (hwID === 0){
        lProgramHWDescriptionField.value = "Выполните следующее задание:"
        lProgramHWSaveButton.setAttribute("data-hw-id", "0")
    } else {
        lProgramHWSaveButton.setAttribute("data-hw-id", hwID)
        programsAPIHWGetItem(hwID).then(request => {
            if (request.status === 200){
                lProgramHWNameField.value = request.response.name
                lProgramHWDescriptionField.value = request.response.description
                if (request.response.materials.length === 0){
                    lProgramHWMaterialsList.innerHTML = '<li class="list-group-item">Материалы не прикреплены</li>'
                } else {
                    lProgramHWMaterialsList.innerHTML = ''
                    modalLProgramHWMaterialsSet = request.response.materials.map(mat => {
                        lProgramHWMaterialsList.insertAdjacentHTML("beforeend", `
                            <li class="list-group-item"><button type="button" class="btn btn-danger material-embed-delete" data-mat-id="${mat.id}">
                            <i class="bi bi-trash3"></i></button>
                            <a href="/materials/${mat.id}">${mat.name}</a></li>`)
                        return mat.id
                    })
                    lProgramHWMaterialsList.querySelectorAll(".material-embed-delete").forEach(matDelButton => {
                        matDelButton.addEventListener("click", materialsEmbedDelete)
                    })
                }
            }
        })
    }
}

function programsHWResetValidation(){
    lProgramHWNameField.classList.remove("is-invalid")
    lProgramHWDescriptionField.classList.remove("is-invalid")
    lProgramHWNameError.innerHTML = ""
    lProgramHWDescriptionError.innerHTML = ""
}

function programsHWClientValidation(){
    programsHWResetValidation()
    let validationStatus = true

    if (lProgramHWNameField.value === ""){
        lProgramHWNameField.classList.add("is-invalid")
        lProgramHWNameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    return validationStatus
}

function programsHWServerValidation(errors){
    if (errors.hasOwnProperty("name")){
        lProgramHWNameField.classList.add("is-invalid")
        lProgramHWNameError.innerHTML = errors.name
    }
    if (errors.hasOwnProperty("description")){
        lProgramHWDescriptionField.classList.add("is-invalid")
        lProgramHWDescriptionError.innerHTML = errors.description
    }
}

async function programsHWEditSave(hwID=0){
    if (programsHWClientValidation()){
        const formData = new FormData(lProgramHWForm)
        modalLProgramHWMaterialsSet.map(matID => {
            formData.append("materials", matID)
        })
        if (hwID === "0"){
            programsAPIHWCreate(formData).then(request => {
                switch (request.status){
                    case 201:
                        bsModalLProgramHW.hide()
                        showSuccessToast("Домашнее задание успешно создано")
                        break
                    case 400:
                        programsHWServerValidation(request.response)
                        break
                    default:
                        bsModalLProgramHW.hide()
                        showErrorToast()
                        break
                }
            })
        } else {
            programsAPIHWUpdate(hwID, formData).then(request => {
                switch (request.status){
                    case 200:
                        bsModalLProgramHW.hide()
                        showSuccessToast("Домашнее задание успешно изменено")
                        break
                    case 400:
                        programsHWServerValidation(request.response)
                        break
                    default:
                        bsModalLProgramHW.hide()
                        showErrorToast()
                        break
                }
            })
        }
    }
}


//bootstrap Elements
const modalLProgramHW = document.querySelector("#modalLProgramHW")
const bsModalLProgramHW = new bootstrap.Modal(modalLProgramHW)

//main form
const lProgramHWForm = modalLProgramHW.querySelector("#modalLProgramHWForm")
const lProgramHWNameField = lProgramHWForm.querySelector("#modalLProgramHWNameField")
const lProgramHWNameError = lProgramHWForm.querySelector("#modalLProgramHWNameError")
const lProgramHWDescriptionField = lProgramHWForm.querySelector("#modalLProgramHWDescriptionField")
const lProgramHWDescriptionError =lProgramHWForm.querySelector("#modalLProgramHWDescriptionError")

//materials
let modalLProgramHWMaterialsSet = []
const lProgramHWMaterialsList = modalLProgramHW.querySelector("#modalLProgramHWMaterialsList")
const lProgramHWMaterialsAddButton = modalLProgramHW.querySelector("#modalLProgramHWMaterialsAddButton")

//buttons
const lProgramHWSaveButton = modalLProgramHW.querySelector("#modalLProgramHWSaveButton")
const lProgramsAddHWButton = document.querySelector("#lProgramsAddHWButton")

programsHWMain()