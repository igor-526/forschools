function programsLessonMain(){
    lProgramsAddLessonButton.addEventListener('click', async function(){
        await programsLessonSetModal(0)
    })
    lProgramLessonSaveButton.addEventListener('click', async function(){
        const lessonID = lProgramLessonSaveButton.attributes.getNamedItem("data-lesson-id").value
        await programsLessonEditSave(lessonID)
    })
}

function programsLessonReset(){
    programsLessonResetValidation()
    lProgramLessonForm.reset()
    modalLProgramLessonMaterialsSet = []
    lProgramLessonMaterialsList.innerHTML = '<li class="list-group-item">Материалы не прикреплены</li>'
}

async function programsLessonSetModal(lessonID=0){
    programsLessonReset()
    materialEmbedAction = "programLesson"

    materialsEmbedModalCloseButton.setAttribute("data-bs-target", "#modalLProgramLesson")
    materialsEmbedModalAddButton.setAttribute("data-bs-target", "#modalLProgramLesson")
    if (lessonID === 0){
        lProgramLessonDescriptionField.value = ""
        lProgramLessonSaveButton.setAttribute("data-lesson-id", "0")
    } else {
        programsAPILessonGetItem(lessonID).then(request => {
            if (request.status === 200){
                console.log(request.response)

                lProgramLessonNameField.value = request.response.name
                lProgramLessonDescriptionField.value = request.response.description
                if (request.response.materials.length === 0){
                    lProgramLessonMaterialsList.innerHTML = '<li class="list-group-item">Материалы не прикреплены</li>'
                } else {
                    lProgramLessonMaterialsList.innerHTML = ''
                    modalLProgramLessonMaterialsSet = request.response.materials.map(mat => {
                        lProgramLessonMaterialsList.insertAdjacentHTML("beforeend", `
                            <li class="list-group-item"><button type="button" class="btn btn-danger material-embed-delete" data-mat-id="${mat.id}">
                            <i class="bi bi-trash3"></i></button>
                            <a href="/materials/${mat.id}">${mat.name}</a></li>`)
                        return mat.id
                    })
                    lProgramLessonMaterialsList.querySelectorAll(".material-embed-delete").forEach(matDelButton => {
                        matDelButton.addEventListener("click", materialsEmbedDelete)
                    })
                }
            }
        })
        lProgramLessonSaveButton.setAttribute("data-lesson-id", lessonID)
    }
}

function programsLessonResetValidation(){
    lProgramLessonNameField.classList.remove("is-invalid")
    lProgramLessonDescriptionField.classList.remove("is-invalid")
    lProgramLessonNameError.innerHTML = ""
    lProgramLessonDescriptionError.innerHTML = ""
}

function programsLessonClientValidation(){
    programsLessonResetValidation()
    let validationStatus = true

    if (lProgramLessonNameField.value === ""){
        lProgramLessonNameField.classList.add("is-invalid")
        lProgramLessonNameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    return validationStatus
}

function programsLessonServerValidation(errors){
    if (errors.hasOwnProperty("name")){
        lProgramLessonNameField.classList.add("is-invalid")
        lProgramLessonNameError.innerHTML = errors.name
    }
    if (errors.hasOwnProperty("description")){
        lProgramLessonDescriptionField.classList.add("is-invalid")
        lProgramLessonDescriptionError.innerHTML = errors.description
    }
}

async function programsLessonEditSave(lessonID=0){
    if (programsLessonClientValidation()){
        const formData = new FormData(lProgramLessonForm)
        modalLProgramLessonMaterialsSet.map(matID => {
            formData.append("materials", matID)
        })
        if (lessonID === "0"){
            programsAPILessonCreate(formData).then(request => {
                switch (request.status){
                    case 201:
                        bsModalLProgramLesson.hide()
                        showSuccessToast("Урок успешно создан")
                        break
                    case 400:
                        programsLessonServerValidation(request.response)
                        break
                    default:
                        bsModalLProgramLesson.hide()
                        showErrorToast()
                        break
                }
            })
        } else {
            programsAPILessonUpdate(lessonID, formData).then(request => {
                switch (request.status){
                    case 200:
                        bsModalLProgramLesson.hide()
                        showSuccessToast("Урок успешно изменён")
                        break
                    case 400:
                        programsProgramServerValidation(request.response)
                        break
                    default:
                        bsModalLProgramLesson.hide()
                        showErrorToast()
                        break
                }
            })
        }
    }
}

//bootstrap Elements
const modalLProgramLesson = document.querySelector("#modalLProgramLesson")
const bsModalLProgramLesson = new bootstrap.Modal(modalLProgramLesson)

//main form
const lProgramLessonForm = modalLProgramLesson.querySelector("#modalLProgramLessonForm")
const lProgramLessonNameField = lProgramLessonForm.querySelector("#modalLProgramLessonNameField")
const lProgramLessonNameError = lProgramLessonForm.querySelector("#modalLProgramLessonNameError")
const lProgramLessonDescriptionField = lProgramLessonForm.querySelector("#modalLProgramLessonDescriptionField")
const lProgramLessonDescriptionError = lProgramLessonForm.querySelector("#modalLProgramLessonDescriptionError")

//materials
let modalLProgramLessonMaterialsSet = []
const lProgramLessonMaterialsList = modalLProgramLesson.querySelector("#modalLProgramLessonMaterialsList")
const lProgramLessonMaterialsAddButton = modalLProgramLesson.querySelector("#modalLProgramLessonMaterialsAddButton")

//buttons
const lProgramLessonSaveButton = modalLProgramLesson.querySelector("#modalLProgramLessonSaveButton")
const lProgramsAddLessonButton = document.querySelector("#lProgramsAddLessonButton")

programsLessonMain()