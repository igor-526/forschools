function planItemModalsMain(){
    planItemPhaseModalSaveButton.addEventListener("click", planItemModalsPhaseUpdate)
    planItemPhaseDeleteModalButton.addEventListener("click", planItemModalsPhaseDestroy)
    planItemLessonDeleteModalButton.addEventListener("click", planItemModalsLessonDestroy)
    planItemPhaseModalNewAddButton.addEventListener("click", planItemModalsPhaseCreate)
    plansItemNotHeldModalButton.addEventListener("click", planItemModalsLessonSetNotHeld)
}

function planItemModalsPhaseEditSet(){
    const phaseID = Number(this.attributes.getNamedItem("data-phase-edit-id").value)
    bsPlanItemPhaseModal.show()
    planItemPhaseModalSaveButton.setAttribute("data-phase-edit-id", phaseID)
    planItemPhaseModalNameError.innerHTML = ""
    planItemPhaseModalPurposeError.innerHTML = ""
    planItemPhaseModalNameField.classList.remove("is-invalid")
    planItemPhaseModalPurposeField.classList.remove("is-invalid")
    planItemAPIGetPhases(planID).then(request => {
        switch (request.status){
            case 200:
                const phase = request.response.find(ph => ph.id === phaseID)
                planItemPhaseModalTitle.innerHTML = `Изменение этапа "${phase.name}"`
                planItemPhaseModalNameField.value = phase.name
                planItemPhaseModalPurposeField.value = phase.purpose
                break
            default:
                showErrorToast()
                break
        }
    })

}

function planItemModalsPhaseDeleteSet(){
    const phaseID = this.attributes.getNamedItem("data-phase-del-id").value
    bsPlanItemPhaseDeleteModal.show()
    planItemPhaseDeleteModalButton.setAttribute("data-phase-del-id", phaseID)
}

function planItemModalsPhaseAddSet(){
    bsPlanItemPhaseModalNew.show()
}

function planItemModalsPhaseValidation(action, errors){
    function resetUpdValidation() {
        planItemPhaseModalNameError.innerHTML = ""
        planItemPhaseModalPurposeError.innerHTML = ""
        planItemPhaseModalNameField.classList.remove("is-invalid")
        planItemPhaseModalPurposeField.classList.remove("is-invalid")
    }

    function resetCrValidation() {
        planItemPhaseModalNewNameError.innerHTML = ""
        planItemPhaseModalNewPurposeError.innerHTML = ""
        planItemPhaseModalNewNameField.classList.remove("is-invalid")
        planItemPhaseModalNewPurposeField.classList.remove("is-invalid")
    }

    function setInvalid(element, error, errorText){
        validationStatus = false
        element.classList.add("is-invalid")
        if (error){
            error.innerHTML = errorText
        }
    }

    function validateUpdName(){
        if (planItemPhaseModalNameField.value.trim() === ""){
            setInvalid(planItemPhaseModalNameField,
                planItemPhaseModalNameError,
                "Наименование не может быть пустым")
        }
        if (planItemPhaseModalNameField.value.length > 200){
            setInvalid(planItemPhaseModalNameField,
                planItemPhaseModalNameError,
                "Длина наименования не может быть более 200 символов")
        }
    }

    function validateUpdPurpose(){
        if (planItemPhaseModalPurposeField.value.length > 1000){
            setInvalid(planItemPhaseModalPurposeField,
                planItemPhaseModalPurposeError,
                "Длина цели не может быть более 1000 символов")
        }
    }

    function validateCrName(){
        if (planItemPhaseModalNewNameField.value.trim() === ""){
            setInvalid(planItemPhaseModalNewNameField,
                planItemPhaseModalNewNameError,
                "Наименование не может быть пустым")
        }
        if (planItemPhaseModalNewNameField.value.length > 200){
            setInvalid(planItemPhaseModalNewNameField,
                planItemPhaseModalNewNameError,
                "Длина наименования не может быть более 200 символов")
        }
    }

    function validateCrPurpose(){
        if (planItemPhaseModalNewPurposeField.value.length > 1000){
            setInvalid(planItemPhaseModalNewPurposeField,
                planItemPhaseModalNewPurposeError,
                "Длина цели не может быть более 1000 символов")
        }
    }

    let validationStatus = true

    switch (action){
        case "update":
            resetUpdValidation()
            if (!errors){
                validateUpdName()
                validateUpdPurpose()
                return validationStatus
            } else {
                if (errors.hasOwnProperty("name")){
                    setInvalid(planItemPhaseModalNameField,
                        planItemPhaseModalNameError,
                        errors.name)
                }
                if (errors.hasOwnProperty("purpose")){
                    setInvalid(planItemPhaseModalPurposeField,
                        planItemPhaseModalPurposeError,
                        errors.purpose)
                }
            }
            break
        case "create":
            resetCrValidation()
            if (!errors){
                validateCrName()
                validateCrPurpose()
                return validationStatus
            } else {
                if (errors.hasOwnProperty("name")){
                    setInvalid(planItemPhaseModalNewNameField,
                        planItemPhaseModalNewNameError,
                        errors.name)
                }
                if (errors.hasOwnProperty("purpose")){
                    setInvalid(planItemPhaseModalNewPurposeField,
                        planItemPhaseModalNewPurposeError,
                        errors.purpose)
                }
            }
            break
    }
}

function planItemModalsPhaseUpdate(){
    function cleanFormData() {
        const dirtyFD = new FormData(planItemPhaseModalForm)
        const dirtyFDName = dirtyFD.get("name")
        const dirtyFDPurpose = dirtyFD.get("purpose")
        dirtyFD.set("name", dirtyFDName.trim())
        dirtyFD.set("purpose", dirtyFDPurpose.trim())
        return dirtyFD
    }

    if (planItemModalsPhaseValidation("update")){
        planItemAPIUpdatePhase(
            planID,
            this.attributes.getNamedItem("data-phase-edit-id").value,
            cleanFormData()
        ).then(request => {
            switch (request.status){
                case 201:
                    bsPlanItemPhaseModal.hide()
                    showSuccessToast("Этап успешно изменён")
                    planItemChangePhase(request.response, null)
                    break
                case 400:
                    planItemModalsPhaseValidation("update", request.response)
                    break
                default:
                    bsPlanItemPhaseModal.hide()
                    showErrorToast()
                    break
            }
        })
    }
}

function planItemModalsPhaseDestroy(){
    const phaseID= Number(this.attributes.getNamedItem("data-phase-del-id").value)
    planItemAPIDestroyPhase(planID, phaseID).then(request => {
        switch (request.status){
            case 204:
                bsPlanItemPhaseDeleteModal.hide()
                showSuccessToast("Этап успешно удалён")
                planItemChangePhase(null, phaseID)
                break
            default:
                bsPlanItemPhaseDeleteModal.hide()
                showErrorToast()
                break
        }
    })
}

function planItemModalsPhaseCreate(){
    function getFormData() {
        const fd = new FormData()
        fd.set("name", planItemPhaseModalNewNameField.value.trim())
        fd.set("purpose", planItemPhaseModalNewPurposeField.value.trim())
        return fd
    }

    if (planItemModalsPhaseValidation("create")){
        planItemAPICreatePhase(planID, getFormData()).then(request => {
            switch (request.status){
                case 201:
                    bsPlanItemPhaseModalNew.hide()
                    showSuccessToast("Этап успешно создан")
                    planItemChangePhase(request.response, null)
                    break
                case 400:
                    planItemModalsPhaseValidation("create", request.response)
                    break
                default:
                    bsPlanItemPhaseModalNew.hide()
                    showErrorToast()
                    break
            }
        })
    }
}

function planItemModalsLessonDeleteSet(){
    const lessonID = this.attributes.getNamedItem("data-lesson-del-id").value
    bsPlanItemLessonDeleteModal.show()
    planItemLessonDeleteModalButton.setAttribute("data-lesson-del-id", lessonID)
}

function planItemModalsLessonNotHeldSet(){
    const lessonID = this.attributes.getNamedItem("data-lesson-notheld-id").value
    bsPlansItemNotHeldModal.show()
    plansItemNotHeldModalButton.setAttribute("data-lesson-notheld-id", lessonID)
}


function planItemModalsLessonDestroy(){
    const lessonID= Number(this.attributes.getNamedItem("data-lesson-del-id").value)
    planItemAPIDestroyLesson(lessonID).then(request => {
        switch (request.status){
            case 204:
                bsPlanItemLessonDeleteModal.hide()
                showSuccessToast("Занятие успешно удалено")
                planItemChangeLesson(null, lessonID)
                break
            default:
                bsPlanItemLessonDeleteModal.hide()
                showErrorToast()
                break
        }
    })
}

function planItemModalsLessonSetNotHeld(){
    const lessonID= Number(this.attributes.getNamedItem("data-lesson-notheld-id").value)
    lessonsAPISetNotHeld(lessonID).then(request => {
        switch (request.status){
            case 201:
                bsPlansItemNotHeldModal.hide()
                showSuccessToast("Занятие успешно изменено")
                planItemChangeLesson(request.response)
                break
            default:
                bsPlansItemNotHeldModal.hide()
                showErrorToast()
                break
        }
    })
}

//PhaseEdit
const planItemPhaseModal = document.querySelector("#planItemPhaseModal")
const bsPlanItemPhaseModal = new bootstrap.Modal(planItemPhaseModal)
const planItemPhaseModalTitle = planItemPhaseModal.querySelector("#planItemPhaseModalTitle")
const planItemPhaseModalForm = planItemPhaseModal.querySelector("#planItemPhaseModalForm")
const planItemPhaseModalNameField = planItemPhaseModalForm.querySelector("#planItemPhaseModalNameField")
const planItemPhaseModalNameError = planItemPhaseModalForm.querySelector("#planItemPhaseModalNameError")
const planItemPhaseModalPurposeField = planItemPhaseModalForm.querySelector("#planItemPhaseModalPurposeField")
const planItemPhaseModalPurposeError = planItemPhaseModalForm.querySelector("#planItemPhaseModalPurposeError")
const planItemPhaseModalSaveButton = planItemPhaseModal.querySelector("#planItemPhaseModalSaveButton")

//PhaseDelete
const planItemPhaseDeleteModal = document.querySelector("#planItemPhaseDeleteModal")
const bsPlanItemPhaseDeleteModal = new bootstrap.Modal(planItemPhaseDeleteModal)
const planItemPhaseDeleteModalButton = planItemPhaseDeleteModal.querySelector("#planItemPhaseDeleteModalButton")

//LessonDelete
const planItemLessonDeleteModal = document.querySelector("#planItemLessonDeleteModal")
const bsPlanItemLessonDeleteModal = new bootstrap.Modal(planItemLessonDeleteModal)
const planItemLessonDeleteModalButton = planItemLessonDeleteModal.querySelector("#planItemLessonDeleteModalButton")

//LessonSetNotHeld
const plansItemNotHeldModal = document.querySelector("#plansItemNotHeldModal")
const bsPlansItemNotHeldModal = new bootstrap.Modal(plansItemNotHeldModal)
const plansItemNotHeldModalButton = plansItemNotHeldModal.querySelector("#plansItemNotHeldModalButton")

//PhaseAdd
const planItemPhaseModalNew = document.querySelector("#planItemPhaseModalNew")
const bsPlanItemPhaseModalNew = new bootstrap.Modal(planItemPhaseModalNew)
const planItemPhaseModalNewNameField = planItemPhaseModalNew.querySelector("#planItemPhaseModalNewNameField")
const planItemPhaseModalNewNameError = planItemPhaseModalNew.querySelector("#planItemPhaseModalNewNameError")
const planItemPhaseModalNewPurposeField = planItemPhaseModalNew.querySelector("#planItemPhaseModalNewPurposeField")
const planItemPhaseModalNewPurposeError = planItemPhaseModalNew.querySelector("#planItemPhaseModalNewPurposeError")
const planItemPhaseModalNewAddButton = planItemPhaseModalNew.querySelector("#planItemPhaseModalNewAddButton")

planItemModalsMain()