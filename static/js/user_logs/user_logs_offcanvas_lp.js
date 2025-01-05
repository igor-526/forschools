function userLogsOffcanvasShow(){
    if (!userLogsOffcanvasDownloaded){
        userLogsOffcanvasGetLearningPlans()
    }
    bsUserLogsOffcanvasLP.show()
}

function userLogsOffcanvasGetLearningPlans(){
    plansAPIGet().then(request => {
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
    function getElement(plan){
        const a = document.createElement("a")
        a.classList.add("list-group-item")
        a.innerHTML = plan.name
        a.href = "#"
        a.addEventListener("click", function (){
            userLogsSelectedPlan = plan.id
            bsUserLogsOffcanvasLP.hide()
            userLogsGetActions()
        })
        return a
    }

    plans.forEach(plan => {
        userLogsOffcanvasLPList.insertAdjacentElement("beforeend", getElement(plan))
    })
}

let userLogsOffcanvasDownloaded = false
const userLogsOffcanvasLP = document.querySelector("#userLogsOffcanvasLP")
const bsUserLogsOffcanvasLP = new bootstrap.Offcanvas(userLogsOffcanvasLP)
const userLogsOffcanvasLPSearchField = userLogsOffcanvasLP.querySelector("#userLogsOffcanvasLPSearchField")
const userLogsOffcanvasLPList = userLogsOffcanvasLP.querySelector("#userLogsOffcanvasLPList")