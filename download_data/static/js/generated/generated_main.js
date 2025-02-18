function generatedMain(){
    generatedGet()
}

function generatedGet(){
    generatedAPIGetAll(generatedFiltersType, generatedFiltersInitiator,
        generatedFiltersDateFrom, generatedFiltersDateTo,
        generatedFiltersComplete).then(request => {
        switch (request.status){
            case 200:
                generatedShow(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function generatedShow(notes, clear=true){
    function getElement(note){
        const tr = document.createElement("tr")
        const tdType = document.createElement("td")
        tdType.innerHTML = note.type
        tr.insertAdjacentElement("beforeend", tdType)
        const tdInitiator = document.createElement("td")
        tdInitiator.innerHTML = getUsersString([note.initiator])
        tr.insertAdjacentElement("beforeend", tdInitiator)
        const tdDate = document.createElement("td")
        tdDate.innerHTML = timeUtilsDateTimeToStr(note.task_dt)
        tr.insertAdjacentElement("beforeend", tdDate)
        const tdComplete = document.createElement("td")
        tdComplete.innerHTML = note.task_complete ? timeUtilsDateTimeToStr(note.task_complete) : "Не выполнено"
        if (note.output_file){
            const button = document.createElement("a")
            button.classList.add("btn", "btn-primary", "ms-3")
            button.href = note.output_file
            button.innerHTML = '<i class="bi bi-download"></i>'
            tdComplete.insertAdjacentElement("beforeend", button)
        }
        tr.insertAdjacentElement("beforeend", tdComplete)
        return tr
    }

    if (clear){
        generatedTableBody.innerHTML = ""
    }
    notes.forEach(note => {
        generatedTableBody.insertAdjacentElement("beforeend", getElement(note))
    })
}

let generatedFiltersType = []
let generatedFiltersInitiator = []
let generatedFiltersDateFrom = null
let generatedFiltersDateTo = null
let generatedFiltersComplete = null

const generatedTableBody = document.querySelector("#generatedTableBody")

generatedMain()