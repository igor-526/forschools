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
}

async function programsProgramSetModal(programID=0){
    programsProgramReset()
    if (programID === 0){
        lProgramProgramSaveButton.setAttribute("data-program-id", "0")
    } else {
        programsAPIProgramGetItem(programID).then(request => {
            if (request.status === 200){
                lProgramProgramNameField.value = request.response.name
                lProgramProgramPurposeField.value = request.response.purpose
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