async function planItemMain(){
    await planItemGetPhases()
    planItemShowPhases()
    plansItemPhaseModalSaveButton.addEventListener("click", function () {
        const phaseID = Number(this.attributes.getNamedItem("data-phase-id").value)
        if (phaseID === 0){
            planItemAddPhase()
        } else {
            planItemEditPhase(phaseID)
        }
    })
    await plansItemLessonMain()

}

async function planItemGetPhases() {
    await fetch(`/api/v1/learning_plans/${planID}/phases/`)
        .then(async response => await response.json())
        .then(phases => phases_set = phases)
}

function planItemShowPhases(list = phases_set) {
    plansItemTableBody.innerHTML = ''
    list.map(phase => {
        let lessonsHTML = ""
        phase.lessons.map(lesson => {
            let date = "-"
            let time = "-"
            if (lesson.date !== null){
                const dateObj = new Date(lesson.date)
                date = `${dateObj.getDay()}.${dateObj.getMonth()}.${dateObj.getFullYear()}`
            }
            if (lesson.start_time !== null){
                const timeStartObj = new Date()
                timeStartObj.setHours(lesson.start_time.split(":")[0],
                    lesson.start_time.split(":")[1], 0)
                const timeEndObj = new Date()
                timeStartObj.setHours(lesson.end_time.split(":")[0],
                    lesson.end_time.split(":")[1], 0)

                time = `${timeStartObj.getHours()}:${timeStartObj.getMinutes()} - ${timeEndObj.getHours()}:${timeEndObj.getMinutes()}`
            }

            lessonsHTML += `
            <tr>
                <td>${lesson.name}</td>
                <td>${date}</td>
                <td>${time}</td>
                <td>
                    <button type="button" class="btn btn-primary" id="PlansItemLessonEditButton" data-lesson-id="${lesson.id}" data-phase-id="${phase.id}">
                    <i class="fa-solid fa-pen-to-square"></i></button>
                    <a href="/lessons/${lesson.id}"><button type="button" class="btn btn-primary">
                    <i class="fa-solid fa-chevron-right"></i></button></a>
                </td>
            </tr> 
            `
        })
        plansItemTableBody.insertAdjacentHTML('beforeend', `
        <tr data-phase-id="${phase.id}">
            <td style="max-width: 300px;">${phase.name}</td>
            <td>${phase.purpose}</td>
            <td>
                <button type="button" class="btn btn-primary" id="PlansItemTableEditButton" data-phase-id="${phase.id}">
                    <i class="fa-solid fa-pen-to-square"></i></button>
                <button type="button" class="btn btn-primary"  data-phase-id="${phase.id}" data-bs-toggle="collapse" data-bs-target="#PlansItemTablePhaseCollapse${phase.id}">
                    <i class="fa-solid fa-chevron-right"></i></button>
            </td>
        </tr>
        
        <tr>
            <td colspan="4">
            
            <div class="collapse ms-3" id="PlansItemTablePhaseCollapse${phase.id}">
                <div class="card card-body">
                <h4>Уроки этапа "${phase.name}":</h4>
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
                            <td colspan="3">Добавить урок</td>
                            <td>
                                <button type="button" class="btn btn-primary" id="PlansItemLessonTableAddButton" 
                                data-phase-id="${phase.id}" data-lesson-id="0"><i class="fa-solid fa-plus"></i></button>
                            </td>
                        </tr>                               
                    </tbody>
                </table>
                </div>
            </div>
            </td>
        </tr>


`)
    })

    plansItemTableBody.querySelectorAll("#PlansItemTableEditButton")
        .forEach(button => {
            button.addEventListener('click', function () {
                planItemAddModalPhase(Number(this.attributes.getNamedItem("data-phase-id").value))
            })
        })

    plansItemTableBody.insertAdjacentHTML('beforeend', `
        <tr data-phase-id="0">
            <td style="max-width: 300px;">Добавить этап</td>
            <td></td>
            <td>
                <button type="button" class="btn btn-primary" id="PlansItemTableAddButton">
                <i class="fa-solid fa-plus"></i></button>
            </td>
        </tr>`)
    plansItemTableBody.querySelector("#PlansItemTableAddButton")
        .addEventListener('click', function () {
            planItemAddModalPhase(0)
        })
}

//Sets
let phases_set = []

//Tables
const plansItemTableBody = document.querySelector("#PlansItemTableBody")

planItemMain()
