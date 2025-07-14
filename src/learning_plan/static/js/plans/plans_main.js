function learningPlansMain(){
    learningPlansSelectedListeners = getHashValue("listener")?[Number(getHashValue("listener"))]:[]
    learningPlansSelectedTeachers = getHashValue("teacher")?[Number(getHashValue("teacher"))]:[]
    if (getHashValue("new")){
        plansAddSetOffcanvas()
    }
    learningPlansGet()
    if (plansCanDownload){
        plansTableSelect.addEventListener("change", learningPlansSelectAllListener)
        plansDownloadInfo.addEventListener("click", plansAllDownloadSetModal)
    }
    plansTableShowMoreButton.addEventListener("click", function () {
        plansCurrentOffset += 50
        learningPlansGet(true)
    })
}

function learningPlansGet(more=false){
    if (!more && plansCurrentOffset !== 0){
        plansCurrentOffset = 0
    }
    plansAPIGet(plansCurrentOffset, null, null, learningPlansSelectedName, learningPlansSelectedTeachers,
        learningPlansSelectedListeners, learningPlansSelectedStatus, learningPlansSelectedNameSort).then(request => {
        switch (request.status){
            case 200:
                learningPlansShow(request.response, !more)
                request.response.length === 50 ? plansTableShowMoreButton.classList.remove("d-none") :
                    plansTableShowMoreButton.classList.add("d-none")
                break
            default:
                showErrorToast()
                break
        }
    })
}

function learningPlansShow(plans, clear=true){
    function getSelectListener(planID, checked){
        const index = plansSelected.indexOf(planID)
        if (checked){
            if (index === -1){
                plansSelected.push(planID)
            }
        } else {
            if (index !== -1){
                plansSelected.splice(index, 1)
            }
        }
        const selectedLength = plansSelected.length
        switch (selectedLength){
            case 0:
                plansDownloadInfo.disabled = true
                break
            default:
                plansDownloadInfo.disabled = false
                break
        }
        plansTableSelectLabel.innerHTML = `(${selectedLength})`
    }

    function getElement(plan){
        const tr = document.createElement("tr")
        if (plan.color){
            tr.classList.add(`table-${plan.color}`)
        }

        if (plansCanDownload){
            const tdSelect = document.createElement("td")
            const tdSelectCheckbox = document.createElement("input")
            tdSelectCheckbox.classList.add("form-check-input")
            tdSelectCheckbox.type = "checkbox"
            tdSelectCheckbox.setAttribute("data-plan-id", plan.id)
            tdSelectCheckbox.addEventListener("click", function () {
                getSelectListener(plan.id, tdSelectCheckbox.checked)
            })
            tr.insertAdjacentElement("beforeend", tdSelect)
            tdSelect.insertAdjacentElement("beforeend", tdSelectCheckbox)
        }

        const tdName = document.createElement("td")
        tdName.innerHTML = plan.name
        tr.insertAdjacentElement("beforeend", tdName)

        const tdTeacher = document.createElement("td")
        tdTeacher.innerHTML = getUsersString([plan.teacher])
        tr.insertAdjacentElement("beforeend", tdTeacher)

        const tdListeners = document.createElement("td")
        tdListeners.innerHTML = getUsersString(plan.listeners)
        tr.insertAdjacentElement("beforeend", tdListeners)

        const tdActions = document.createElement("td")
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
        const tdActionsBtnGroup = document.createElement("div")
        tdActionsBtnGroup.role = "group"
        tdActionsBtnGroup.classList.add("btn-group")
        const tdActionsEdit = document.createElement("button")
        tdActionsEdit.classList.add("btn", "btn-primary")
        tdActionsEdit.type = "button"
        tdActionsEdit.innerHTML = '<i class="bi bi-pencil"></i>'
        tdActionsEdit.addEventListener("click", function (){
            plansAddSetOffcanvas(plan.id)
        })
        tdActionsBtnGroup.insertAdjacentElement("beforeend", tdActionsEdit)
        const tdActionsLogs = document.createElement("a")
        tdActionsLogs.href = `/user_logs/#plan_id=${plan.id}`
        tdActionsLogs.classList.add("btn", "btn-primary")
        tdActionsLogs.innerHTML = '<i class="bi bi-card-list"></i>'
        tdActionsBtnGroup.insertAdjacentElement("beforeend", tdActionsLogs)
        const tdActionsGo = document.createElement("a")
        tdActionsGo.href = `/learning_plans/${plan.id}`
        tdActionsGo.classList.add("btn", "btn-primary")
        tdActionsGo.innerHTML = '<i class="bi bi-chevron-right"></i>'
        tdActionsBtnGroup.insertAdjacentElement("beforeend", tdActionsGo)
        tdActions.insertAdjacentElement("beforeend", tdActionsBtnGroup)
        tr.insertAdjacentElement("beforeend", tdActions)
        return tr
    }

    if (clear) plansTableBody.innerHTML = ''
    plans.forEach(plan => {
        plansTableBody.insertAdjacentElement("beforeend", getElement(plan))
    })
}

function learningPlansSelectAllListener(){
    const elements = plansTableBody.querySelectorAll("input")
    elements.forEach(element => {
        element.checked = this.checked
        const planID = Number(element.attributes.getNamedItem("data-plan-id").value)
        const index = plansSelected.indexOf(planID)
        if (this.checked){
            if (index === -1){
                plansSelected.push(planID)
            }
        } else {
            if (index !== -1){
                plansSelected.splice(index, 1)
            }
        }
    })
    const selectedLength = plansSelected.length
    switch (selectedLength){
        case 0:
            plansDownloadInfo.disabled = true
            break
        default:
            plansDownloadInfo.disabled = false
            break
    }
    plansTableSelectLabel.innerHTML = `(${selectedLength})`
}

let plansSelected = []
const plansDownloadInfo = plansCanDownload ? document.querySelector("#plansDownloadInfo") : null
const plansTableSelect = plansCanDownload ? document.querySelector("#plansTableSelect") : null
const plansTableSelectLabel = plansCanDownload ? document.querySelector("#plansTableSelectLabel") : null

const plansTableBody = document.querySelector("#PlansTableBody")
const plansTableShowMoreButton = document.querySelector("#plansTableShowMoreButton")

//Filtering
let plansCurrentOffset = 0
let learningPlansSelectedStatus = "processing"
let learningPlansSelectedName = null
let learningPlansSelectedNameSort = null
let learningPlansSelectedTeachers = []
let learningPlansSelectedListeners = []

learningPlansMain()