async function programsMainShowMain(){
    lProgramsTabHW.addEventListener("click", async function () {
        lProgramsTabHW.classList.add("active")
        lProgramsTabLessons.classList.remove("active")
        lProgramsTabPhases.classList.remove("active")
        lProgramsTabPrograms.classList.remove("active")
        await programsMainShowHWList(true)
    })
    lProgramsTabLessons.addEventListener("click", async function () {
        lProgramsTabHW.classList.remove("active")
        lProgramsTabLessons.classList.add("active")
        lProgramsTabPhases.classList.remove("active")
        lProgramsTabPrograms.classList.remove("active")
        await programsMainShowLessonList(true)
    })
    lProgramsTabPhases.addEventListener("click", async function () {
        lProgramsTabHW.classList.remove("active")
        lProgramsTabLessons.classList.remove("active")
        lProgramsTabPhases.classList.add("active")
        lProgramsTabPrograms.classList.remove("active")
        await programsMainShowPhaseList(true)
    })
    lProgramsTabPrograms.addEventListener("click", async function () {
        lProgramsTabHW.classList.remove("active")
        lProgramsTabLessons.classList.remove("active")
        lProgramsTabPhases.classList.remove("active")
        lProgramsTabPrograms.classList.add("active")
        await programsMainShowProgramList(true)
    })
    modalProgramDeleteButton.addEventListener("click", async function (){
        await programsMainDelete(
            this.attributes.getNamedItem("data-action").value,
            this.attributes.getNamedItem("data-id").value
        )
    })
    await programsMainShowProgramList(true)
}

function programsMainShowMaterialListGetHTML(materials){
    if (materials.length === 0){
        return '<li class="list-group-item">Материалы отсутствуют</li>'
    }
    let materialsHTML = '<ul class="list-group list-group-flush">'
    materials.map(mat => {
        materialsHTML += `<li class="list-group-item"><a href="/materials/${mat.id}">${mat.name}</a></li>`
    })
    materialsHTML += '</ul>'
    return materialsHTML
}

function programsMainShowHWListGetHTML(homeworks, actionButtons=false){
    let hwHTML = ""
    homeworks.map(hw => {
        hwHTML += `
        <div class="accordion-item">
            <h2 class="accordion-header" id="panelsStayOpen-headingTwo">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionCollapseHW${hw.id}" aria-expanded="false" aria-controls="accordionCollapseHW${hw.id}">
            ${hw.name}</button>
            </h2>
            <div id="accordionCollapseHW${hw.id}" class="accordion-collapse collapse" aria-labelledby="accordionCollapseHW${hw.id}">
                <div class="accordion-body">
                    <div class="row justify-content-between">
                        <div class="col-5">
                            <div class="card mb-3">
                                <div class="card-header">Информация</div>
                                <div class="card-body">
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item">Наименование: ${hw.name}</li>
                                        <li class="list-group-item">Описание: ${hw.description}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="card mb-3">
                                <div class="card-header">Материалы</div>
                                <div class="card-body">
                                    ${programsMainShowMaterialListGetHTML(hw.materials)}
                                </div>
                            </div>
                        </div>
`

        if (actionButtons){
            hwHTML += `
            <div class="col-3">
                <button type="button" class="btn btn-primary mt-1 btn-hw-edit" data-hw-id="${hw.id}"  data-bs-toggle="modal" data-bs-target="#modalLProgramHW">Редактировать</button>
                <button type="button" class="btn btn-danger mt-1 btn-hw-delete" data-hw-id="${hw.id}">Удалить</button>
            </div>
            `
        }

        hwHTML += `</div></div></div></div>`
    })
    return hwHTML
}

function programsMainShowLessonListGetHTML(lessons, actionButtons=false){
    let lessonHTML = ""
    lessons.map(lesson => {
        lessonHTML += `
        <div class="accordion-item">
            <h2 class="accordion-header" id="panelsStayOpen-headingTwo">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionCollapseLesson${lesson.id}" aria-expanded="false" aria-controls="accordionCollapseLesson${lesson.id}">
            ${lesson.name}</button>
            </h2>
            <div id="accordionCollapseLesson${lesson.id}" class="accordion-collapse collapse" aria-labelledby="accordionCollapseLesson${lesson.id}">
                <div class="accordion-body">
                    <div class="row justify-content-between">
                        <div class="col-5">
                            <div class="card mb-3">
                                <div class="card-header">Информация</div>
                                <div class="card-body">
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item">Наименование: ${lesson.name}</li>
                                        <li class="list-group-item">Описание: ${lesson.description}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="card mb-3">
                                <div class="card-header">Материалы</div>
                                <div class="card-body">
                                    ${programsMainShowMaterialListGetHTML(lesson.materials)}
                                </div>
                            </div>
                        </div>
`

        if (actionButtons){
            lessonHTML += `
            <div class="col-3">
                <button type="button" class="btn btn-primary mt-1 btn-lesson-edit" data-lesson-id="${lesson.id}"  data-bs-toggle="modal" data-bs-target="#modalLProgramLesson">Редактировать</button>
                <button type="button" class="btn btn-danger mt-1 btn-lesson-delete" data-lesson-id="${lesson.id}">Удалить</button>
            </div>
            `
        }

        lessonHTML += `</div></div></div></div>`
    })
    return lessonHTML
}

function programsMainShowPhaseListGetHTML(phases, actionButtons=false){
    let phaseHTML = ""
    phases.forEach(phase => {
        phaseHTML += `
        <div class="accordion-item">
            <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionCollapsePhase${phase.id}" aria-expanded="false" aria-controls="accordionCollapsePhase${phase.id}">
            ${phase.name}</button>
            </h2>
            <div id="accordionCollapsePhase${phase.id}" class="accordion-collapse collapse" aria-labelledby="accordionCollapsePhase${phase.id}">
                <div class="accordion-body">
                    <div class="row justify-content-between">
                        <div class="col-9">
                            <div class="card mb-3">
                                <div class="card-header">Информация</div>
                                <div class="card-body">
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item">Наименование: ${phase.name}</li>
                                        <li class="list-group-item">Цель этапа обучения: ${phase.purpose}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
`

        if (actionButtons){
            phaseHTML += `
            <div class="col-3">
                <button type="button" class="btn btn-primary mt-1 btn-phase-edit" data-phase-id="${phase.id}"  data-bs-toggle="modal" data-bs-target="#modalLProgramPhase">Редактировать</button>
                <button type="button" class="btn btn-danger mt-1 btn-phase-delete" data-phase-id="${phase.id}">Удалить</button>
            </div>
            `
        }

        phaseHTML += `</div>`

        const orderedLessons = phase.lessons_order.map(lessonID => {
            return phase.lessons.find(l => l.id === Number(lessonID))
        })

        phaseHTML += `
        <div class="accordion ms-5">
            <div class="accordion-item">
                <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionCollapsePhases${phase.id}Lessons" aria-expanded="false" aria-controls="accordionCollapsePhases${phase.id}Lessons">
                Уроки</button>
                </h2>
                <div id="accordionCollapsePhases${phase.id}Lessons" class="accordion-collapse collapse">
                    <div class="accordion-body">${programsMainShowLessonListGetHTML(orderedLessons)}</div>
                </div>
            </div>
        </div>
        `



        phaseHTML += `</div></div></div>`
    })
    return phaseHTML
}

function programsMainShowProgramListGetHTML(programs, actionButtons=false){
    let programHTML = ""
    programs.forEach(program => {
        programHTML += `
        <div class="accordion-item">
            <h2 class="accordion-header" id="panelsStayOpen-headingTwo">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionCollapseProgram${program.id}" aria-expanded="false" aria-controls="accordionCollapseProgram${program.id}">
            ${program.name}</button>
            </h2>
            <div id="accordionCollapseProgram${program.id}" class="accordion-collapse collapse" aria-labelledby="accordionCollapseProgram${program.id}">
                <div class="accordion-body">
                    <div class="row justify-content-between">
                        <div class="col-9">
                            <div class="card mb-3">
                                <div class="card-header">Информация</div>
                                <div class="card-body">
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item">Наименование: ${program.name}</li>
                                        <li class="list-group-item">Цель программы обучения: ${program.purpose}</li>
                                        <li class="list-group-item">Дата создания: ${program.created_at}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
`

        if (actionButtons){
            programHTML += `
            <div class="col-3">
                <button type="button" class="btn btn-primary mt-1 btn-program-edit" data-program-id="${program.id}" data-bs-toggle="modal" data-bs-target="#modalLProgramProgram">Редактировать</button>
                <button type="button" class="btn btn-danger mt-1 btn-program-delete" data-program-id="${program.id}">Удалить</button>
            </div>
            `
        }
        programHTML += `</div>`

        const orderedPhases = program.phases_order.map(phaseID => {
            return program.phases.find(p => p.id === Number(phaseID))
        })

        programHTML += `
        <div class="accordion ms-5">
            <div class="accordion-item">
                <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionCollapseProgram${program.id}Phases" aria-expanded="false" aria-controls="accordionCollapseProgram${program.id}Phases">
                Этапы обучения</button>
                </h2>
                <div id="accordionCollapseProgram${program.id}Phases" class="accordion-collapse collapse">
                    <div class="accordion-body">${programsMainShowPhaseListGetHTML(orderedPhases)}</div>
                </div>
            </div>
        </div>
        `



        programHTML += `</div></div></div>`
    })
    return programHTML
}

async function programsMainShowHWList(actionButtons=false){
    lProgramsAccordion.innerHTML = ""
    programsAPIHWGetAll().then(request => {
        switch (request.status){
            case 200:
                lProgramsAccordion.innerHTML = programsMainShowHWListGetHTML(request.response, actionButtons)
                if (actionButtons) {
                    programsMainShowHWListListeners()
                }
                break
            default:
                showErrorToast()
                break
        }
    })
}

async function programsMainShowLessonList(actionButtons=false){
    lProgramsAccordion.innerHTML = ""
    programsAPILessonGetAll().then(request => {
        switch (request.status){
            case 200:
                lProgramsAccordion.innerHTML = programsMainShowLessonListGetHTML(request.response, actionButtons)
                if (actionButtons) {
                    programsMainShowLessonListListeners()
                }
                break
            default:
                showErrorToast()
                break
        }
    })
}

async function programsMainShowPhaseList(actionButtons=false){
    lProgramsAccordion.innerHTML = ""
    programsAPIPhaseGetAll().then(request => {
        switch (request.status){
            case 200:
                lProgramsAccordion.innerHTML = programsMainShowPhaseListGetHTML(request.response, actionButtons)
                if (actionButtons) {
                    programsMainShowPhaseListListeners()
                }
                break
            default:
                showErrorToast()
                break
        }
    })
}

async function programsMainShowProgramList(actionButtons=false){
    lProgramsAccordion.innerHTML = ""
    programsAPIProgramGetAll().then(request => {
        switch (request.status) {
            case 200:
                lProgramsAccordion.innerHTML = programsMainShowProgramListGetHTML(request.response, actionButtons)
                if (actionButtons) {
                    programsMainShowProgramListListeners()
                }
                break
            default:
                showErrorToast()
                break
        }
    })
}

function programsMainShowProgramListListeners(){
    lProgramsAccordion.querySelectorAll(".btn-program-edit").forEach(btn => {
        btn.addEventListener("click", async function(){
            await programsProgramSetModal(btn.attributes.getNamedItem("data-program-id").value)
        })
    })
    lProgramsAccordion.querySelectorAll(".btn-program-delete").forEach(btn => {
        btn.addEventListener("click", function () {
            programsMainSetDeleteModal(
                "program",
                btn.attributes.getNamedItem("data-program-id").value
            )
        })
    })
}

function programsMainShowPhaseListListeners(){
    lProgramsAccordion.querySelectorAll(".btn-phase-edit").forEach(btn => {
        btn.addEventListener("click", async function(){
            await programsPhaseSetModal(btn.attributes.getNamedItem("data-phase-id").value)
        })
    })
    lProgramsAccordion.querySelectorAll(".btn-phase-delete").forEach(btn => {
        btn.addEventListener("click", function () {
            programsMainSetDeleteModal(
                "phase",
                btn.attributes.getNamedItem("data-phase-id").value
            )
        })
    })
}

function programsMainShowLessonListListeners(){
    lProgramsAccordion.querySelectorAll(".btn-lesson-edit").forEach(btn => {
        btn.addEventListener("click", async function(){
            await programsLessonSetModal(btn.attributes.getNamedItem("data-lesson-id").value)
        })
    })
    lProgramsAccordion.querySelectorAll(".btn-lesson-delete").forEach(btn => {
        btn.addEventListener("click", function () {
            programsMainSetDeleteModal(
                "lesson",
                btn.attributes.getNamedItem("data-lesson-id").value
            )
        })
    })
}

function programsMainShowHWListListeners(){
    lProgramsAccordion.querySelectorAll(".btn-hw-edit").forEach(btn => {
        btn.addEventListener("click", async function(){
            await programsHWSetModal(btn.attributes.getNamedItem("data-hw-id").value)
        })
    })
    lProgramsAccordion.querySelectorAll(".btn-hw-delete").forEach(btn => {
        btn.addEventListener("click", function () {
            programsMainSetDeleteModal(
                "hw",
                btn.attributes.getNamedItem("data-hw-id").value
            )
        })
    })
}

function programsMainSetDeleteModal(action, itemID){
    switch (action){
        case "program":
            modalProgramDeleteBody.innerHTML = "Вы уверены, что хотите удалить программу обучения?<br>Действие обратимо только с помощью администратора"
            break
        case "phase":
            modalProgramDeleteBody.innerHTML = "Вы уверены, что хотите удалить этап обучения?<br>Действие обратимо только с помощью администратора"
            break
        case "lesson":
            modalProgramDeleteBody.innerHTML = "Вы уверены, что хотите удалить урок?<br>Действие обратимо только с помощью администратора"
            break
        case "hw":
            modalProgramDeleteBody.innerHTML = "Вы уверены, что хотите удалить домашнее задание?<br>Действие обратимо только с помощью администратора"
            break
    }
    modalProgramDeleteButton.setAttribute("data-id", itemID)
    modalProgramDeleteButton.setAttribute("data-action", action)
    bsModalLProgramsDelete.show()
}

async function programsMainDelete(action, itemID){
    let request
    switch (action){
        case "program":
            request = await programsAPIProgramDestroy(itemID)
            break
        case "phase":
            request = await programsAPIPhaseDestroy(itemID)
            break
        case "lesson":
            request = await programsAPILessonDestroy(itemID)
            break
        case "hw":
            request = await programsAPIHWDestroy(itemID)
            break
    }
    bsModalLProgramsDelete.hide()
    switch (request.status) {
        case 204:
            showSuccessToast("Успешно удалено")
            break
        default:
            showErrorToast()
            break
    }
}

const lProgramsAccordion = document.querySelector("#lProgramsAccordion")

//tabs
const lProgramsTabPrograms = document.querySelector("#lProgramsTabPrograms")
const lProgramsTabPhases = document.querySelector("#lProgramsTabPhases")
const lProgramsTabLessons = document.querySelector("#lProgramsTabLessons")
const lProgramsTabHW = document.querySelector("#lProgramsTabHW")

//delete modal
const modalLProgramsDelete = document.querySelector("#modalLProgramDelete")
const bsModalLProgramsDelete = new bootstrap.Modal(modalLProgramsDelete)
const modalProgramDeleteBody = modalLProgramsDelete.querySelector("#modalLProgramDeleteBody")
const modalProgramDeleteButton = modalLProgramsDelete.querySelector("#modalLProgramDeleteButton")

programsMainShowMain()

