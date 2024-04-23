async function learningPlansMain(){
    const request = await plansGet()
    if (request.status === 200){
        learningPlansArray = request.response
    }
    learningPlansShow()
}

function learningPlansShowListenersHTML(listeners){
    let listenersHTML = ''
    listeners.map(listener => {
        listenersHTML += `<a href="/profile/${listener.id}">${listener.first_name} ${listener.last_name}<br></a>`
    })
    return listenersHTML
}

function learningPlansShowHTML(plan){
    let planHTML
    const listenersHTML = learningPlansShowListenersHTML(plan.listeners)
    if (plan.deletable){
        planHTML = `
        <tr>
            <td style="max-width: 300px;">${plan.name}</td>
            <td><a href="/profile/${plan.teacher.id}">${plan.teacher.first_name} ${plan.teacher.last_name}</a></td>
            <td>${listenersHTML}</td>
            <td>
                <button type="button" class="btn btn-danger plans-table-button-delete" data-bs-toggle="modal" href="#LearningPlanDeleteModal" data-plan-id="${plan.id}">
                    <i class="fa-solid fa-trash"></i></button>
                <button type="button" class="btn btn-primary plans-table-button-edit" data-bs-toggle="offcanvas" href="#offcanvasNewPlan" data-plan-id="${plan.id}">
                    <i class="fa-solid fa-pen-to-square"></i></button>
                <a href="${plan.id}"><button type="button" class="btn btn-primary" id="PlansTableButtonGo">
                    <i class="fa-solid fa-chevron-right"></i></button></a>
            </td>
        </tr>`
    } else {
        planHTML = `
        <tr>
            <td style="max-width: 300px;">${plan.name}</td>
            <td><a href="/profile/${plan.teacher.id}">${plan.teacher.first_name} ${plan.teacher.last_name}</a></td>
            <td>${listenersHTML}</td>
            <td>
                <button type="button" class="btn btn-primary plans-table-button-edit" data-bs-toggle="offcanvas" href="#offcanvasNewPlan" data-plan-id="${plan.id}">
                    <i class="fa-solid fa-pen-to-square"></i></button>
                <a href="${plan.id}"><button type="button" class="btn btn-primary plans-table-button-delete" id="PlansTableButtonGo">
                    <i class="fa-solid fa-chevron-right"></i></button></a>
            </td>
        </tr>`
    }
    return planHTML
}

function learningPlansShow(list = learningPlansArray){
    plansTableBody.innerHTML = ''
    list.map(plan => {
        plansTableBody.insertAdjacentHTML("beforeend", learningPlansShowHTML(plan))
    })
}

let learningPlansArray = []
const plansTableBody = document.querySelector("#PlansTableBody")

learningPlansMain()