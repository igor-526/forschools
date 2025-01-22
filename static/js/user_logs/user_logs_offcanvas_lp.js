function userLogsOffcanvasShow(){
    if (!userLogsOffcanvasDownloaded){
        userLogsOffcanvasGetLearningPlans()
    }
    bsUserLogsOffcanvasLP.show()
}

function userLogsOffcanvasGetLearningPlans(){
    plansAPIGet(userLogsOffcanvasQAllFilter, "true").then(request => {
        switch (request.status){
            case 200:
                userLogsOffcanvasShowLearningPlans(request.response)
                userLogsOffcanvasDownloaded = true
                break
            default:
                showErrorToast()
                break
        }
    })
}

function userLogsOffcanvasShowLearningPlans(plans){
    function getTooltipHTML(plan){
        const strings = []
        if (plan.teacher){
            strings.push(`<b>Преподаватель: </b>${getUsersString([plan.teacher], false)}`)
        }
        if (plan.default_hw_teacher && (plan.default_hw_teacher.id !== plan.teacher.id)){
            strings.push(`<b>Проверяющий ДЗ: </b>${getUsersString([plan.teacher], false)}`)
        }
        if (plan.metodist){
            strings.push(`<b>Методист: </b>${getUsersString([plan.metodist], false)}`)
        }
        if (plan.listeners && plan.listeners.length > 0){
            strings.push(`<b>${plan.listeners.length === 1 ? "Ученик" : "Ученики"}: </b>${getUsersString(plan.listeners, false)}`)
        }
        if (plan.curators && plan.curators.length > 0){
            strings.push(`<b>${plan.curators.length === 1 ? "Куратор" : "Кураторы"}: </b>${getUsersString(plan.curators, false)}`)
        }
        return strings.join("<br>")
    }

    function getElement(plan){
        const a = document.createElement("a")
        a.classList.add("list-group-item")
        a.innerHTML = plan.name
        a.href = "#"

        a.setAttribute("data-bs-toggle", "tooltip")
        a.setAttribute("data-bs-placement", "right")
        a.setAttribute("data-bs-html", "true")
        a.setAttribute("title", getTooltipHTML(plan))
        new bootstrap.Tooltip(a)

        a.addEventListener("click", function (){
            userLogsSelectedPlan = plan.id
            bsUserLogsOffcanvasLP.hide()
            userLogsGetActions()
        })
        return a
    }

    userLogsOffcanvasLPList.innerHTML = ""
    plans.forEach(plan => {
        userLogsOffcanvasLPList.insertAdjacentElement("beforeend", getElement(plan))
    })
}

function userLogsOffcanvasFilterListeners(){
    userLogsOffcanvasLPSearchClearButton.addEventListener("click", function () {
        userLogsOffcanvasLPSearchField.value = ""
        userLogsOffcanvasQAllFilter = null
        userLogsOffcanvasGetLearningPlans()
    })
    userLogsOffcanvasLPSearchField.addEventListener("input", function () {
        if (userLogsOffcanvasLPSearchField.value.trim() === ""){
            userLogsOffcanvasQAllFilter = null
            userLogsOffcanvasGetLearningPlans()
        } else {
            userLogsOffcanvasQAllFilter = userLogsOffcanvasLPSearchField.value.trim().toLowerCase()
            userLogsOffcanvasGetLearningPlans()
        }
    })
}

let userLogsOffcanvasQAllFilter = null

let userLogsOffcanvasDownloaded = false
const userLogsOffcanvasLP = document.querySelector("#userLogsOffcanvasLP")
const bsUserLogsOffcanvasLP = new bootstrap.Offcanvas(userLogsOffcanvasLP)
const userLogsOffcanvasLPSearchField = userLogsOffcanvasLP.querySelector("#userLogsOffcanvasLPSearchField")
const userLogsOffcanvasLPSearchClearButton = userLogsOffcanvasLP.querySelector("#userLogsOffcanvasLPSearchClearButton")
const userLogsOffcanvasLPList = userLogsOffcanvasLP.querySelector("#userLogsOffcanvasLPList")

userLogsOffcanvasFilterListeners()