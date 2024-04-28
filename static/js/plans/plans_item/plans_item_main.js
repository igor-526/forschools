async function planItemMain(){
    const request = await planItemGetPhases()
    if (request.status === 200){
        phasesArray = request.response
        planItemShowPhases()
    }
}

function planItemGetLessonHTML(lessons, phaseID){
    let lessonsHTML = ""
    lessons.map(lesson => {
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
        if (canEditPlan){
            if (lesson.deletable){
                lessonsHTML += `
            <tr>
                <td>${lesson.name}</td>
                <td>${date}</td>
                <td>${time}</td>
                <td>
                    <button type="button" class="btn btn-danger phase-lesson-button-delete" data-bs-toggle="modal" href="#LessonDeleteModal" data-lesson-id="${lesson.id}">
                        <i class="bi bi-trash3"></i></button>
                    <button type="button" class="btn btn-primary phase-lesson-button-edit" data-lesson-id="${lesson.id}" data-phase-id="${phaseID}">
                        <i class="bi bi-pencil"></i></button>
                    <a href="/lessons/${lesson.id}"><button type="button" class="btn btn-primary">
                        <i class="bi bi-chevron-right"></i></button></a>
                </td>
            </tr> 
            `
            } else {
                lessonsHTML += `
            <tr>
                <td>${lesson.name}</td>
                <td>${date}</td>
                <td>${time}</td>
                <td>
                    <button type="button" class="btn btn-primary phase-lesson-button-edit" data-lesson-id="${lesson.id}" data-phase-id="${phaseID}">
                        <i class="bi bi-pencil"></i></button>
                    <a href="/lessons/${lesson.id}"><button type="button" class="btn btn-primary">
                        <i class="bi bi-chevron-right"></i></button></a>
                </td>
            </tr> 
            `
            }

        } else {
            lessonsHTML += `
            <tr>
                <td>${lesson.name}</td>
                <td>${date}</td>
                <td>${time}</td>
                <td>
                    <a href="/lessons/${lesson.id}"><button type="button" class="btn btn-primary">
                    <i class="bi bi-chevron-right"></i></button></a>
                </td>
            </tr> 
            `
        }

    })
    return lessonsHTML
}

function planItemGetPhaseHTML(phase){
    let phaseHTML
    const lessonsHTML = planItemGetLessonHTML(phase.lessons, phase.id)
    if (canEditPlan){
        if (phase.deletable){
            phaseHTML = `
        <tr data-phase-id="${phase.id}">
            <td style="max-width: 300px;">${phase.name}</td>
            <td>${phase.purpose}</td>
            <td>
                <button type="button" class="btn btn-danger phase-table-button-delete" data-bs-toggle="modal" href="#PhaseDeleteModal" data-phase-id="${phase.id}">
                    <i class="bi bi-trash3"></i></button>
                <button type="button" class="btn btn-primary phase-table-button-edit" data-phase-id="${phase.id}">
                    <i class="bi bi-pencil"></i></button>
                <button type="button" class="btn btn-primary"  data-phase-id="${phase.id}" data-bs-toggle="collapse" data-bs-target="#PlansItemTablePhaseCollapse${phase.id}">
                    <i class="bi bi-chevron-right"></i></button>
            </td>
        </tr>
            `
        } else {
            phaseHTML = `
        <tr data-phase-id="${phase.id}">
            <td style="max-width: 300px;">${phase.name}</td>
            <td>${phase.purpose}</td>
            <td>
                <button type="button" class="btn btn-primary phase-table-button-edit" data-phase-id="${phase.id}">
                    <i class="bi bi-pencil"></i></button>
                <button type="button" class="btn btn-primary"  data-phase-id="${phase.id}" data-bs-toggle="collapse" data-bs-target="#PlansItemTablePhaseCollapse${phase.id}">
                    <i class="bi bi-chevron-right"></i></button>
            </td>
        </tr>
            `
        }
        phaseHTML += `

        <tr>
            <td colspan="4">
            <div class="collapse ms-3" id="PlansItemTablePhaseCollapse${phase.id}">
                <div class="card card-body">
                <h4>Занятия этапа "${phase.name}":</h4>
                <table class="table table-hover mb-3" style="width: 100%;">
                    <thead>
                        <tr>
                            <th scope="col">Наименование</th>
                            <th scope="col">Дата</th>
                            <th scope="col">Время</th>
                            <th scope="col">Действие</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lessonsHTML}
                        <tr>
                            <td colspan="3">Добавить занятие</td>
                            <td>
                                <button type="button" class="btn btn-primary phase-lesson-button-add" 
                                data-phase-id="${phase.id}" data-lesson-id="0"><i class="bi bi-plus-lg"></i></button>
                            </td>
                        </tr>                               
                    </tbody>
                </table>
                </div>
            </div>
            </td>
        </tr>
`
    } else {
        phaseHTML = `
        <tr data-phase-id="${phase.id}">
            <td style="max-width: 300px;">${phase.name}</td>
            <td>${phase.purpose}</td>
            <td>
                <button type="button" class="btn btn-primary"  data-phase-id="${phase.id}" data-bs-toggle="collapse" data-bs-target="#PlansItemTablePhaseCollapse${phase.id}">
                    <i class="bi bi-chevron-right"></i></button>
            </td>
        </tr>
        <tr>
            <td colspan="4">
            <div class="collapse ms-3" id="PlansItemTablePhaseCollapse${phase.id}">
                <div class="card card-body">
                <h4>Занятия этапа "${phase.name}":</h4>
                <table class="table table-hover mb-3" style="width: 100%;">
                    <thead>
                        <tr>
                            <th scope="col">Наименование</th>
                            <th scope="col">Дата</th>
                            <th scope="col">Время</th>
                            <th scope="col">Действие</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lessonsHTML}                             
                    </tbody>
                </table>
                </div>
            </div>
            </td>
        </tr>
`
    }
    return phaseHTML
}

function planItemShowPhases(list = phasesArray) {
    plansItemTableBody.innerHTML = ''
    list.map(phase => {
        plansItemTableBody.insertAdjacentHTML('beforeend', planItemGetPhaseHTML(phase))
    })
    if (canEditPlan){
        plansItemTableBody.insertAdjacentHTML('beforeend', `
        <tr data-phase-id="0">
            <td style="max-width: 300px;">Добавить этап</td>
            <td></td>
            <td>
                <button type="button" class="btn btn-primary" id="PlansItemTableAddButton">
                <i class="bi bi-plus-lg"></i></button>
            </td>
        </tr>`)
        plansItemListenersPhaseEdit()
        plansItemListenersLessonsAddEdit()
    }
}

//Sets
let phasesArray = []

//Tables
const plansItemTableBody = document.querySelector("#PlansItemTableBody")

planItemMain()
