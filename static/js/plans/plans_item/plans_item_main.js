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
                <th scope="col">Действие</th>
            </tr>`
    const collapseTableTBody = document.createElement("tbody")
    collapseTable.insertAdjacentElement("beforeend", collapseTableTHead)
    collapseTable.insertAdjacentElement("beforeend", collapseTableTBody)
    phase.lessons.forEach(lesson => {
        collapseTableTBody.insertAdjacentElement("beforeend", planItemGetLessonElement(lesson))
    })
    return tr
}

function planItemGetLessonElement(lesson){
    let date = "-"
    let time = "-"
    if (lesson.date !== null){
        const dateObj = new Date(lesson.date)
        date = `${dateObj.toLocaleDateString()}`
    }
    if (lesson.start_time !== null){
        const st = new Date(Date.parse(`${lesson.date}T${lesson.start_time}`))
        const et = new Date(Date.parse(`${lesson.date}T${lesson.end_time}`))
        const stH = st.getHours().toString().padStart(2, "0")
        const stM = st.getMinutes().toString().padStart(2, "0")
        const etH = et.getHours().toString().padStart(2, "0")
        const etM = et.getMinutes().toString().padStart(2, "0")
        time = `${stH}:${stM} - ${etH}:${etM}`
    }
    const tr = document.createElement("tr")
    const tdName = document.createElement("td")
    const tdDate = document.createElement("td")
    const tdTime = document.createElement("td")
    const tdActions = document.createElement("td")
    tr.insertAdjacentElement("beforeend", tdName)
    tr.insertAdjacentElement("beforeend", tdDate)
    tr.insertAdjacentElement("beforeend", tdTime)
    tr.insertAdjacentElement("beforeend", tdActions)
    tr.setAttribute("data-lesson-id", lesson.id)
    switch (lesson.status){
        case 1:
            tr.classList.add("table-success")
            break
        case 2:
            tr.classList.add("table-danger")
            break
    }
    tdName.innerHTML = lesson.name
    tdDate.innerHTML = date
    tdTime.innerHTML = time
    if (lesson.deletable){
        const tdActionsDelete = document.createElement("button")
        tdActionsDelete.type = "button"
        tdActionsDelete.classList.add("btn", "btn-danger", "mx-1")
        tdActionsDelete.setAttribute("data-lesson-del-id", lesson.id)
        tdActionsDelete.innerHTML = '<i class="bi bi-trash3"></i>'
        tdActions.insertAdjacentElement("beforeend", tdActionsDelete)
        tdActionsDelete.addEventListener("click", planItemModalsLessonDeleteSet)
    }

    if (lesson.can_set_not_held){
        const tdActionsSetNotHeld = document.createElement("button")
        tdActionsSetNotHeld.type = "button"
        tdActionsSetNotHeld.classList.add("btn", "btn-warning", "mx-1")
        tdActionsSetNotHeld.setAttribute("data-lesson-notheld-id", lesson.id)
        tdActionsSetNotHeld.innerHTML = '<i class="bi bi-clipboard-x"></i>'
        tdActions.insertAdjacentElement("beforeend", tdActionsSetNotHeld)
        tdActionsSetNotHeld.addEventListener("click", planItemModalsLessonNotHeldSet)
    }

    if (lesson.status === 0 && canEditPlan){
        const tdActionsEdit = document.createElement("button")
        tdActionsEdit.type = "button"
        tdActionsEdit.classList.add("btn", "btn-warning", "mx-1")
        tdActionsEdit.innerHTML = '<i class="bi bi-pencil"></i>'
        tdActions.insertAdjacentElement("beforeend", tdActionsEdit)
        tdActionsEdit.addEventListener("click", function () {
            lessonEditSetModalLesson(lesson.id, null, {
                "name": tdName,
                "date": tdDate,
                "time": tdTime
            })
        })




        const tdActionsReschedule = document.createElement("button")
        tdActionsReschedule.type = "button"
        tdActionsReschedule.classList.add("btn", "btn-warning", "mx-1")
        tdActionsReschedule.setAttribute("data-lesson-reschedule-id", lesson.id)
        tdActionsReschedule.innerHTML = '<i class="bi bi-calendar3-range"></i>'
        tdActions.insertAdjacentElement("beforeend", tdActionsReschedule)
        tdActionsReschedule.addEventListener("click", plansItemReschedulingSetModal)
    }
    const tdActionsGo = document.createElement("a")
    tdActionsGo.href = `/lessons/${lesson.id}`
    const tdActionsGoBtn = document.createElement("button")
    tdActionsGo.insertAdjacentElement("beforeend", tdActionsGoBtn)
    tdActionsGoBtn.type = "button"
    tdActionsGoBtn.classList.add("btn", "btn-primary", "mx-1")
    tdActionsGoBtn.innerHTML = '<i class="bi bi-chevron-right"></i>'
    tdActions.insertAdjacentElement("beforeend", tdActionsGo)
    return tr
}

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

planItemMain()
