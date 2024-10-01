async function learningPlansMain(){
    learningPlansSelectedListeners = getHashValue("listener")?[Number(getHashValue("listener"))]:[]
    learningPlansSelectedTeachers = getHashValue("teacher")?[Number(getHashValue("teacher"))]:[]
    if (getHashValue("new")){
        plansAddSetOffcanvas()
    }
    learningPlansGet()

}

function learningPlansGet(){
    plansAPIGet(null, learningPlansSelectedTeachers, learningPlansSelectedListeners).then(request => {
        switch (request.status){
            case 200:
                learningPlansShow(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function learningPlansShow(plans){
    function getElement(plan){
    const tr = document.createElement("tr")
    const tdName = document.createElement("td")
    const tdTeacher = document.createElement("td")
    const tdListeners = document.createElement("td")
    const tdActions = document.createElement("td")

    tdName.innerHTML = plan.name
    tdTeacher.innerHTML = getUsersString([plan.teacher])
    tdListeners.innerHTML = getUsersString(plan.listeners)

    if (plan.deletable){
        const tdActionsDelete = document.createElement("button")
        tdActionsDelete.classList.add("btn", "btn-danger", "mx-1")
        tdActionsDelete.type = "button"
        tdActionsDelete.innerHTML = '<i class="bi bi-trash3"></i>'
        tdActionsDelete.addEventListener("click", function (){
            plansAddDestroySetModal(plan.id)
        })
        tdActions.insertAdjacentElement("beforeend", tdActionsDelete)
    }

    const tdActionsEdit = document.createElement("button")
    tdActionsEdit.classList.add("btn", "btn-primary", "mx-1")
    tdActionsEdit.type = "button"
    tdActionsEdit.innerHTML = '<i class="bi bi-pencil"></i>'
    tdActionsEdit.addEventListener("click", function (){
        plansAddSetOffcanvas(plan.id)
    })
    tdActions.insertAdjacentElement("beforeend", tdActionsEdit)

    const tdActionsGo = document.createElement("button")
    const tdActionsGoA = document.createElement("a")
    tdActionsGoA.insertAdjacentElement("beforeend", tdActionsGo)
    tdActionsGoA.target = "_blank"
    tdActionsGoA.href = `/learning_plans/${plan.id}`
    tdActionsGo.classList.add("btn", "btn-primary", "mx-1")
    tdActionsGo.type = "button"
    tdActionsGo.innerHTML = '<i class="bi bi-chevron-right"></i>'
    tdActions.insertAdjacentElement("beforeend", tdActionsGoA)


    tr.insertAdjacentElement("beforeend", tdName)
    tr.insertAdjacentElement("beforeend", tdTeacher)
    tr.insertAdjacentElement("beforeend", tdListeners)
    tr.insertAdjacentElement("beforeend", tdActions)
    return tr

}

    plansTableBody.innerHTML = ''
    plans.forEach(plan => {
        plansTableBody.insertAdjacentElement("beforeend", getElement(plan))
    })
}

const plansTableBody = document.querySelector("#PlansTableBody")

//Filtering
let learningPlansSelectedTeachers = []
let learningPlansSelectedListeners = []

learningPlansMain()