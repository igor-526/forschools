function supportTicketsMain(){
    supportTicketsGet()
}

function supportTicketsGetStrStatus(status){
    switch (status){
        case null:
            return "Новое обращение"
        case 0:
            return "Взято в работу"
        case 1:
            return "Проблема решена"
        case 2:
            return "Проблема не решена"
        default:
            return ""
    }
}

function supportTicketsGet(){
    supportAPITicketGet(supportTicketsFilteringSelectedDescription,
        supportTicketsFilteringSelectedStatus,
        supportTicketsFilteringSelectedDateStart,
        supportTicketsFilteringSelectedDateEnd,
        supportTicketsFilteringSelectedUsers).then(request => {
        switch (request.status){
            case 200:
                supportTicketsShow(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function supportTicketsShow(tickets = []){
    function getElement(ticket){
        const tr = document.createElement("tr")
        switch (ticket.status){
            case 0:
                tr.classList.add("table-warning")
                break
            case 1:
                tr.classList.add("table-success")
                break
            case 2:
                tr.classList.add("table-danger")
                break
        }

        if (supportTicketsAdminMode){
            supportTicketsTableUsersTH.classList.remove("d-none")
            const tdUser = document.createElement("td")
            if (ticket.user){
                tdUser.innerHTML = getUsersString([ticket.user])
            } else {
                tdUser.innerHTML = "Без пользователя"
            }
            tr.insertAdjacentElement("beforeend", tdUser)
        }

        const tdDate = document.createElement("td")
        tdDate.innerHTML = new Date(ticket.dt).toLocaleDateString()
        const tdDescription = document.createElement("td")
        tdDescription.innerHTML = ticket.description.slice(0, 50)
        const tdStatus = document.createElement("td")
        tdStatus.innerHTML = supportTicketsGetStrStatus(ticket.status)
        const tdActions = document.createElement("td")
        const tdActionsShowButton = document.createElement("button")
        tdActionsShowButton.type = "button"
        tdActionsShowButton.classList.add("btn", "btn-primary")
        tdActionsShowButton.innerHTML = '<i class="bi bi-info-square"></i>'
        tdActionsShowButton.addEventListener("click", function () {
            supportTicketsSetModal(ticket.id)
        })
        tdActions.insertAdjacentElement("beforeend", tdActionsShowButton)
        tr.insertAdjacentElement("beforeend", tdDate)
        tr.insertAdjacentElement("beforeend", tdDescription)
        tr.insertAdjacentElement("beforeend", tdStatus)
        tr.insertAdjacentElement("beforeend", tdActions)
        return tr
    }

    supportTicketsTableBody.innerHTML = ""
    tickets.forEach(ticket => {
        supportTicketsTableBody.insertAdjacentElement("beforeend", getElement(ticket))
    })
}

function supportTicketsSetModal(ticketID){

}

const supportTicketsTableBody = document.querySelector("#supportTicketsTableBody")
const supportTicketsTableUsersTH = document.querySelector("#supportTicketsTableUsersTH")

//Filtering
let supportTicketsFilteringSelectedDateStart = null
let supportTicketsFilteringSelectedDateEnd = null
let supportTicketsFilteringSelectedDescription = null
let supportTicketsFilteringSelectedStatus = []
let supportTicketsFilteringSelectedUsers = []

supportTicketsMain()