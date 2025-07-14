function planItemMain(){
    planItemAPIGetPhases().then(request => {
        switch (request.status){
            case 200:
                planItemShowPhases(request.response)
                break
            default:
                showErrorToast()
        }
    })
    plansItemAddLessonsButton.addEventListener("click", function (){
        plansItemAddLessonsSetModal()
    })
    planItemAPIGetInfo().then(request => {
        switch (request.status){
            case 200:
                plansItemPhasesPassed.innerHTML = request.response.phases_passed
                plansItemLessonsAll.innerHTML = request.response.lessons_all
                plansItemLessonsPassed.innerHTML = request.response.lessons_passed
                if (request.response.can_close){
                    plansItemSetStatusModalFunc()
                }
                break
            default:
                showErrorToast()
                break
        }
    })
    if (isAdmin){
        planItemInitAdminComment()
    }
}

function planItemInitAdminComment(){
    function setModal(){
        const m = new modalEngine()
        m.title = `Комментарий к плану обучения`

        const textAreaDiv = document.createElement("div")
        textAreaDiv.classList.add("mb-3")

        const textAreaLabel = document.createElement("label")
        textAreaLabel.classList.add("form-label")
        textAreaLabel.innerHTML = "Комментарий"
        textAreaLabel.for = "planItemAdminCommentTextArea"

        const textAreaInput = document.createElement("textarea")
        textAreaInput.rows = 10
        textAreaInput.classList.add("form-control")
        textAreaInput.id = "planItemAdminCommentTextArea"
        // if (this.data.admin_comment){
        //     textAreaInput.value = this.data.admin_comment
        // }

        const textAreaInvalidFeedback = document.createElement("div")
        textAreaInvalidFeedback.classList.add("invalid-feedback")

        textAreaDiv.insertAdjacentElement("beforeend", textAreaLabel)
        textAreaDiv.insertAdjacentElement("beforeend", textAreaInput)
        textAreaDiv.insertAdjacentElement("beforeend", textAreaInvalidFeedback)

        m.addContent(textAreaDiv)

        const deleteButton = document.createElement("button")
        deleteButton.type = "button"
        deleteButton.classList.add("btn", "btn-danger")
        deleteButton.addEventListener("click", () => {
            destroyAdminComment(m)
        })
        deleteButton.innerHTML = '<i class="bi bi-trash3"></i>'

        const saveButton = document.createElement("button")
        saveButton.type = "button"
        saveButton.classList.add("btn", "btn-success")
        saveButton.addEventListener("click", () => {
            updateAdminComment(m, textAreaInput, textAreaInvalidFeedback)
        })
        saveButton.innerHTML = '<i class="bi bi-floppy"></i> Сохранить'

        m.addButtons([deleteButton, saveButton])
        m.show()
    }

    function validate(errors=null, field, error){
        if (errors && errors.comment){
            field.classList.add("is-invalid")
            error.innerHTML = errors.comment
            return false
        }

        let validationStatus = true
        field.classList.remove("is-invalid")
        error.innerHTML = ""
        const comment = field.value.trim()
        if (comment.length === 0){
            field.classList.add("is-invalid")
            error.innerHTML = "Комментарий не должен быть пустым<br>Для удаления комментария воспользуйтесь красной кнопкой"
            validationStatus = false
        } else if (comment.length > 2000){
            field.classList.add("is-invalid")
            error.innerHTML = "Комментарий не может содержать больше 2000 символов"
            validationStatus = false
        }
        return validationStatus
    }

    function getFormData(field){
        const fd = new FormData()
        fd.set("comment", field.value.trim())
        return fd
    }

    function destroyAdminComment(modal){
        planItemAPISetAdminComment(planID, null).then(request => {
            modal.close()
            const toast = new toastEngine()
            switch (request.status){
                case 200:
                    toast.setSuccess("Комментарий успешно удалён")
                    setTimeout(()=>{window.location.reload()}, 750)
                    break
                case 403:
                    toast.setError("Нет доступа")
                    break
                default:
                    toast.setError("Не удалось удалить комментарий")
                    break
            }
            toast.show()
        })
    }

    function updateAdminComment(modal, field, error){
        if (validate(null, field, error)){
            planItemAPISetAdminComment(planID, getFormData(field)).then(request => {
                const toast = new toastEngine()
                switch (request.status){
                    case 201:
                        modal.close()
                        toast.setSuccess("Комментарий успешно изменён")
                        toast.show()
                        setTimeout(()=>{window.location.reload()}, 750)
                        break
                    case 400:
                        validate(request.response)
                        break
                    case 403:
                        modal.close()
                        toast.setError("Нет доступа")
                        break
                    default:
                        modal.close()
                        toast.setError("Не удалось добавить комментарий")
                        break
                }
            })
        }
    }

    plansItemCommentEditButton = document.querySelector("#plansItemCommentEditButton")
    plansItemCommentEditButton.addEventListener("click", ()=>{setModal()})
}

function plansItemSetStatusModalFunc(){
    plansItemSetStatusButton.classList.remove("d-none")
    plansItemSetStatusButton.addEventListener("click", function () {
        bsPlansItemSetStatusModal.show()
    })
    plansItemSetStatusModalConfirmButton.addEventListener("click", function (){
        plansItemAPIClosePlan().then(request => {
            bsPlansItemSetStatusModal.hide()
            switch (request.status){
                case 200:
                    showSuccessToast("Обучение закрыто")
                    setTimeout(function () {
                        location.reload()
                    }, 500)
                    break
                default:
                    showErrorToast()
            }
        })
    })
}

function planItemGetPhaseElement(phase){
    const tr = document.createElement("tr")
    const tdName = document.createElement("td")
    const tdPurpose = document.createElement("td")
    const tdActions = document.createElement("td")
    tr.insertAdjacentElement("beforeend", tdName)
    tr.insertAdjacentElement("beforeend", tdPurpose)
    tr.insertAdjacentElement("beforeend", tdActions)
    tr.setAttribute("data-phase-id", phase.id)
    tdName.style = "max-width: 300px;"
    tdName.innerHTML = phase.name
    tdPurpose.innerHTML = phase.purpose
    if (canEditPlan) {
        if (phase.deletable) {
            const actionsDelete = document.createElement("button")
            actionsDelete.type = "button"
            actionsDelete.classList.add("btn", "btn-danger", "mx-1")
            actionsDelete.setAttribute("data-phase-del-id", phase.id)
            actionsDelete.innerHTML = '<i class="bi bi-trash3"></i>'
            tdActions.insertAdjacentElement("beforeend", actionsDelete)
            actionsDelete.addEventListener("click", planItemModalsPhaseDeleteSet)
        }
        const actionsEdit = document.createElement("button")
        actionsEdit.type = "button"
        actionsEdit.classList.add("btn", "btn-warning", "mx-1")
        actionsEdit.setAttribute("data-phase-edit-id", phase.id)
        actionsEdit.innerHTML = '<i class="bi bi-pencil"></i>'
        tdActions.insertAdjacentElement("beforeend", actionsEdit)
        actionsEdit.addEventListener("click", planItemModalsPhaseEditSet)
    }
    const actionsShow = document.createElement("button")
    actionsShow.type = "button"
    actionsShow.classList.add("btn", "btn-primary", "mx-1")
    actionsShow.setAttribute("data-bs-toggle", "collapse")
    actionsShow.setAttribute("data-bs-target", `#plansItemTablePhaseCollapse${phase.id}`)
    actionsShow.innerHTML = '<i class="bi bi-chevron-right"></i>'
    tdActions.insertAdjacentElement("beforeend", actionsShow)
    return tr
}

function planItemGetPhaseCollapse(phase){
    const tr = document.createElement("tr")
    const td = document.createElement("td")
    tr.insertAdjacentElement("beforeend", td)
    tr.setAttribute("data-phase-col-id", phase.id)
    td.colSpan = 4
    const divCollapse = document.createElement("div")
    td.insertAdjacentElement("beforeend", divCollapse)
    divCollapse.classList.add("collapse", "ms-3")
    divCollapse.id = `plansItemTablePhaseCollapse${phase.id}`
    const divCard = document.createElement("div")
    divCollapse.insertAdjacentElement("beforeend", divCard)
    divCard.classList.add("card", "card-body")
    const collapseH = document.createElement("h4")
    divCard.insertAdjacentElement("beforeend", collapseH)
    collapseH.innerHTML = `Занятия этапа "${phase.name}":`
    const collapseTable = document.createElement("table")
    divCard.insertAdjacentElement("beforeend", collapseTable)
    collapseTable.style = "width: 100%;"
    collapseTable.classList.add("table", "table-hover", "mb-3")
    const collapseTableTHead = document.createElement("thead")
    collapseTableTHead.innerHTML = `
            <tr>
                <th scope="col">Наименование</th>
                <th scope="col">Дата</th>
                <th scope="col">Время</th>
            </tr>`
    const collapseTableTBody = document.createElement("tbody")
    collapseTable.insertAdjacentElement("beforeend", collapseTableTHead)
    collapseTable.insertAdjacentElement("beforeend", collapseTableTBody)
    phase.lessons.forEach(lesson => {
        const lsnUtils = new lessonUtils(lesson)
        collapseTableTBody.insertAdjacentElement("beforeend", lsnUtils.getPhaseTableElement())
    })
    return tr
}

function planItemGetLessonElement(lesson){}

function planItemShowPhases(list, clear = true) {
    function getAddPhaseButton(){
        const tr = document.createElement("tr")
        const tdTitle = document.createElement("td")
        const tdButton = document.createElement("td")
        const button = document.createElement("button")
        tdButton.insertAdjacentElement("beforeend", button)
        tdTitle.style = "max-width: 300px;"
        tdTitle.innerHTML = "Добавить этап"
        button.type = "button"
        button.classList.add("btn", "btn-primary")
        button.innerHTML = '<i class="bi bi-plus-lg"></i>'
        tr.insertAdjacentElement("beforeend", tdTitle)
        tr.insertAdjacentElement("beforeend", document.createElement("td"))
        tr.insertAdjacentElement("beforeend", tdButton)
        button.addEventListener("click", planItemModalsPhaseAddSet)
        return tr
    }

    if (clear){
        plansItemTableBody.innerHTML = ''
    }

    list.forEach(phase => {
        plansItemTableBody.insertAdjacentElement("beforeend", planItemGetPhaseElement(phase))
        plansItemTableBody.insertAdjacentElement("beforeend", planItemGetPhaseCollapse(phase))
    })
    if (canEditPlan){
        plansItemTableBody.insertAdjacentElement("beforeend", getAddPhaseButton())
    }
}

function planItemChangePhase(phase=null, id=null){
    if (phase){
        const element = document.querySelector(`[data-phase-id='${phase.id}']`)
        if (element){
            element.replaceWith(planItemGetPhaseElement(phase))
        } else {
            plansItemTableBody.insertAdjacentElement("afterbegin", planItemGetPhaseCollapse(phase))
            plansItemTableBody.insertAdjacentElement("afterbegin", planItemGetPhaseElement(phase))
        }
    } else {
        const element = document.querySelector(`[data-phase-id='${id}']`)
        element.remove()
    }
}

function planItemChangeLesson(lesson=null, id=null, phaseID=null){
    if (lesson){
        const element = document.querySelector(`[data-lesson-id='${lesson.id}']`)
        if (element){
            element.replaceWith(planItemGetLessonElement(lesson))
        }
    } else {
        const element = document.querySelector(`[data-lesson-id='${id}']`)
        element.remove()
    }
}

//Tables
const plansItemTableBody = document.querySelector("#PlansItemTableBody")
const plansItemAddLessonsButton = document.querySelector("#plansItemAddLessonsButton")
const plansItemSetStatusButton = document.querySelector("#plansItemSetStatusButton")
const plansItemPhasesPassed = document.querySelector("#plansItemPhasesPassed")
const plansItemLessonsAll = document.querySelector("#plansItemLessonsAll")
const plansItemLessonsPassed = document.querySelector("#plansItemLessonsPassed")
const plansItemSetStatusModal = document.querySelector("#plansItemSetStatusModal")
const bsPlansItemSetStatusModal = new bootstrap.Modal(plansItemSetStatusModal)
const plansItemSetStatusModalConfirmButton = plansItemSetStatusModal.querySelector("#plansItemSetStatusModalConfirmButton")

let plansItemCommentEditButton

planItemMain()
