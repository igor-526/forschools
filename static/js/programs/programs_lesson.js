function programsLessonMain(){
    lProgramsAddLessonButton.addEventListener('click', async function(){
        await programsLessonSetModal(0)
    })
    lProgramLessonSaveButton.addEventListener('click', async function(){
        const lessonID = lProgramLessonSaveButton.attributes.getNamedItem("data-lesson-id").value
        await programsLessonEditSave(lessonID)
    })
    lProgramLessonMaterialsAddButton.addEventListener("click", function () {
        materialsEmbedSet(modalLProgramLessonMaterialsSet)
    })
}

function programsLessonReset(){
    programsLessonResetValidation()
    lProgramLessonForm.reset()
    modalLProgramLessonMaterialsSet = []
    lProgramLessonMaterialsList.innerHTML = '<li class="list-group-item">Материалы не прикреплены</li>'
    lProgramLessonHWList.innerHTML = ""
    lProgramLessonHWListAdded.innerHTML = ""
}

async function programsLessonSetModal(lessonID=0){

    function setListenerAdded(){
        const element = document.createElement("a")
        element.href = "#"
        element.classList.add("list-group-item", "list-group-item-action")
        element.innerHTML = `<span>${this.querySelector("span").innerHTML}</span>`
        element.setAttribute("data-hw-id", this.attributes.getNamedItem("data-hw-id").value)
        lProgramLessonHWList.insertAdjacentElement('beforeend', element)
        this.remove()
        element.addEventListener("click", setListenerNotAdded)
    }

    function setListenerNotAdded(){
        const element = document.createElement("a")
        element.href = "#"
        element.classList.add("list-group-item", "list-group-item-action")
        element.innerHTML = `<span>${this.querySelector("span").innerHTML}</span>`
        element.setAttribute("data-hw-id", this.attributes.getNamedItem("data-hw-id").value)
        lProgramLessonHWListAdded.insertAdjacentElement('beforeend', element)
        this.remove()
        element.addEventListener("click", setListenerAdded)
    }

    programsLessonReset()
    materialEmbedAction = "programLesson"
    materialsEmbedModalCloseButton.setAttribute("data-bs-target", "#modalLProgramLesson")
    materialsEmbedModalAddButton.setAttribute("data-bs-target", "#modalLProgramLesson")
    const homeworks = await programsAPIHWGetAll()
    if (lessonID === 0){
        lProgramLessonDescriptionField.value = ""
        lProgramLessonSaveButton.setAttribute("data-lesson-id", "0")
        if (homeworks.status === 200){
            homeworks.response.forEach(hw => {
                const element = document.createElement("a")
                element.href = "#"
                element.classList.add("list-group-item", "list-group-item-action")
                element.innerHTML = `<span>${hw.name}</span>`
                element.setAttribute("data-hw-id", hw.id)
                lProgramLessonHWList.insertAdjacentElement('beforeend', element)
                element.addEventListener("click", setListenerNotAdded)
            })
        }
    } else {
        programsAPILessonGetItem(lessonID).then(request => {
            if (request.status === 200){
                lProgramLessonNameField.value = request.response.name
                lProgramLessonDescriptionField.value = request.response.description
                if (request.response.materials.length === 0){
                    lProgramLessonMaterialsList.innerHTML = '<li class="list-group-item">Материалы не прикреплены</li>'
                } else {
                    lProgramLessonMaterialsList.innerHTML = ''
                    modalLProgramLessonMaterialsSet = request.response.materials.map(mat => {
                        lProgramLessonMaterialsList.insertAdjacentHTML("beforeend", `
                            <li class="list-group-item">
                            <a href="/materials/${mat.id}">${mat.name}</a></li>`)
                        return mat.id
                    })
                    lProgramLessonMaterialsList.querySelectorAll(".material-embed-delete").forEach(matDelButton => {
                        matDelButton.addEventListener("click", materialsEmbedDelete)
                    })
                }
                if (homeworks.status === 200){
                    console.log(homeworks.response)
                    console.log(request.response.homeworks)
                    homeworks.response.forEach(hw => {
                        const selected = request.response.homeworks.find(h => h.id === hw.id)
                        if (selected === undefined){
                            const element = document.createElement("a")
                            element.href = "#"
                            element.classList.add("list-group-item", "list-group-item-action")
                            element.innerHTML = `<span>${hw.name}</span>`
                            element.setAttribute("data-hw-id", hw.id)
                            lProgramLessonHWList.insertAdjacentElement('beforeend', element)
                            element.addEventListener("click", setListenerNotAdded)
                        } else {
                            const element = document.createElement("a")
                            element.href = "#"
                            element.classList.add("list-group-item", "list-group-item-action")
                            element.innerHTML = `<span>${hw.name}</span>`
                            element.setAttribute("data-hw-id", hw.id)
                            lProgramLessonHWListAdded.insertAdjacentElement('beforeend', element)
                            element.addEventListener("click", setListenerAdded)
                        }
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
        const hwList = Array.from(lProgramLessonHWListAdded.querySelectorAll('a')).map(element => {
            return element.attributes.getNamedItem("data-hw-id").value
        })
        hwList.forEach(hwID => {
            formData.append("homeworks_ids", hwID)
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

//homeworks
const lProgramLessonHWList = modalLProgramLesson.querySelector("#modalLProgramLessonHWList")
const lProgramLessonHWListAdded = modalLProgramLesson.querySelector("#modalLProgramLessonHWListAdded")

//materials
let modalLProgramLessonMaterialsSet = []
const lProgramLessonMaterialsList = modalLProgramLesson.querySelector("#modalLProgramLessonMaterialsList")
const lProgramLessonMaterialsAddButton = modalLProgramLesson.querySelector("#modalLProgramLessonMaterialsAddButton")

//buttons
const lProgramLessonSaveButton = modalLProgramLesson.querySelector("#modalLProgramLessonSaveButton")
const lProgramsAddLessonButton = document.querySelector("#lProgramsAddLessonButton")

programsLessonMain()