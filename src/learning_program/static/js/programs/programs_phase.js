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
    lProgramPhaseLessonList.innerHTML = ""
    lProgramPhaseLessonListAdded.innerHTML = ""
}

async function programsPhaseSetModal(phaseID=0){

    function setListenerNaviButtons(element, event){
        const selectedLessons = lProgramPhaseLessonListAdded.querySelectorAll("a")
        const lessonIndex = Array.from(selectedLessons).indexOf(element.parentElement.parentElement)
        switch (element.attributes.getNamedItem("data-action").value) {
            case "up":
                if (lessonIndex !== 0){
                    lProgramPhaseLessonListAdded.insertBefore(selectedLessons[lessonIndex], selectedLessons[lessonIndex-1])
                }
                break
            case "down":
                lProgramPhaseLessonListAdded.insertBefore(selectedLessons[lessonIndex], selectedLessons[lessonIndex+2])
                break
        }

        event.stopPropagation()
    }

    function getButtonGroup(lessonID){
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
        buttonUp.setAttribute("data-lesson-id", lessonID)
        buttonDown.setAttribute("data-lesson-id", lessonID)
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

    function setListenerNotAdded(){
        const element = document.createElement("a")
        element.href = "#"
        element.classList.add("list-group-item", "list-group-item-action")
        element.innerHTML = `<span>${this.querySelector("span").innerHTML}</span>`
        element.insertAdjacentElement("afterbegin", getButtonGroup(this.attributes.getNamedItem("data-lesson-id").value))
        element.setAttribute("data-lesson-id", this.attributes.getNamedItem("data-lesson-id").value)
        lProgramPhaseLessonListAdded.insertAdjacentElement('beforeend', element)
        this.remove()
        element.addEventListener("click", setListenerAdded)
    }

    function setListenerAdded(){
        const element = document.createElement("a")
        element.href = "#"
        element.classList.add("list-group-item", "list-group-item-action")
        element.innerHTML = `<span>${this.querySelector("span").innerHTML}</span>`
        element.setAttribute("data-lesson-id", this.attributes.getNamedItem("data-lesson-id").value)
        lProgramPhaseLessonList.insertAdjacentElement('beforeend', element)
        this.remove()
        element.addEventListener("click", setListenerNotAdded)
    }

    programsPhaseReset()
    const lessons = await programsAPILessonGetAll()
    if (phaseID === 0){
        lProgramPhaseSaveButton.setAttribute("data-phase-id", "0")
        if (lessons.status === 200){
            lessons.response.forEach(lesson => {
                const element = document.createElement("a")
                element.href = "#"
                element.classList.add("list-group-item", "list-group-item-action")
                element.innerHTML = `<span>${lesson.name}</span>`
                element.setAttribute("data-lesson-id", lesson.id)
                lProgramPhaseLessonList.insertAdjacentElement('beforeend', element)
                element.addEventListener("click", setListenerNotAdded)
            })
        }
    } else {
        programsAPIPhaseGetItem(phaseID).then(request => {
            if (request.status === 200){
                lProgramPhaseNameField.value = request.response.name
                lProgramPhasePurposeField.value = request.response.purpose
                const selectedLessons = request.response.lessons_order.map(lessonID => {
                    return {
                        lessonID: Number(lessonID),
                        object: null
                    }
                })
                if (lessons.status === 200){
                    lessons.response.forEach(lesson => {
                        if (selectedLessons.find(l => l.lessonID === lesson.id) === undefined){
                            const element = document.createElement("a")
                            element.href = "#"
                            element.classList.add("list-group-item", "list-group-item-action")
                            element.innerHTML = `<span>${lesson.name}</span>`
                            element.setAttribute("data-lesson-id", lesson.id)
                            lProgramPhaseLessonList.insertAdjacentElement('beforeend', element)
                            element.addEventListener("click", setListenerNotAdded)
                        } else {
                            selectedLessons.find(l => l.lessonID === lesson.id).object = lesson
                        }
                    })
                    selectedLessons.forEach(lesson => {
                        const element = document.createElement("a")
                        element.href = "#"
                        element.classList.add("list-group-item", "list-group-item-action")
                        element.innerHTML = `<span>${lesson.object.name}</span>`
                        element.insertAdjacentElement("afterbegin", getButtonGroup(lesson.lessonID))
                        element.setAttribute("data-lesson-id", lesson.lessonID)
                        lProgramPhaseLessonListAdded.insertAdjacentElement('beforeend', element)
                        element.addEventListener("click", setListenerAdded)
                    })
                }
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
        const lessonsList = Array.from(lProgramPhaseLessonListAdded.querySelectorAll('a')).map(element => {
            return element.attributes.getNamedItem("data-lesson-id").value
        })
        lessonsList.forEach(lessonID => {
            formData.append("lessons_order", lessonID)
        })
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
//lessons
const lProgramPhaseLessonList = modalLProgramPhase.querySelector("#modalLProgramPhaseLessonList")
const lProgramPhaseLessonListAdded = modalLProgramPhase.querySelector("#modalLProgramPhaseLessonListAdded")

//main form
const lProgramPhaseForm = modalLProgramPhase.querySelector("#modalLProgramPhaseForm")
const lProgramPhaseNameField = lProgramPhaseForm.querySelector("#modalLProgramPhaseNameField")
const lProgramPhaseNameError = lProgramPhaseForm.querySelector("#modalLProgramPhaseNameError")
const lProgramPhasePurposeField = lProgramPhaseForm.querySelector("#modalLProgramPhasePurposeField")
const lProgramPhasePurposeError = lProgramPhaseForm.querySelector("#modalLProgramPhasePurposeError")

//buttons
const lProgramPhaseSaveButton = modalLProgramPhase.querySelector("#modalLProgramPhaseSaveButton")
const lProgramsAddPhaseButton = document.querySelector("#lProgramsAddPhaseButton")

programsPhaseMain()