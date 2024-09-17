function tgJournalMain(){
    tgJournalGet()
}

function tgJournalGet(
    event = [],
    date = "",
    timeFrom = "",
    timeTo = "",
    initiator = [],
    recipient = [],
    status = []
){
    telegramAPIGetJournal(
        event, date, timeFrom, timeTo,
        initiator, recipient, status
    ).then(request => {
        switch (request.status){
            case 200:
                tgJournalShow(request.response)
                break
            default:
                showErrorToast()
        }
    })
}

function tgJournalShow(list=[], clear=true){

    function getElement(note){
        const tr = document.createElement("tr")
        const tdEvent = document.createElement("td")
        const tdDateTime = document.createElement("td")
        const tdInitiator = document.createElement("td")
        const tdRecipient = document.createElement("td")
        const tdStatus = document.createElement("td")
        tdEvent.innerHTML = tgJournalGetEventStr(note.event)
        tdDateTime.innerHTML = timeUtilsDateTimeToStr(note.dt)
        if (note.initiator){
            tdInitiator.innerHTML = `
            <a href="/profile/${note.initiator.id}" target="_blank">${note.initiator.first_name} ${note.initiator.last_name}</a>
            `
        } else {
            tdInitiator.innerHTML = "Система"
        }
        tdRecipient.innerHTML = `
            <a href="/profile/${note.recipient.id} target="_blank"">${note.recipient.first_name} ${note.recipient.last_name}</a>
            `
        const tdStatusButton = document.createElement("button")
        tdStatus.insertAdjacentElement("beforeend", tdStatusButton)
        tdStatusButton.type = "button"
        if (note.readed){
            tdStatusButton.classList.add("btn", "btn-success")
            tdStatusButton.innerHTML = '<i class="bi bi-check"></i>'
        } else {
            tdStatusButton.classList.add("btn", note.data.status === "success"?"btn-primary":"btn-danger")
            tdStatusButton.innerHTML = note.data.status === "success"?'<i class="bi bi-check"></i>':'<i class="bi bi-x-lg"></i>'
        }
        tdStatusButton.addEventListener("click", function (){
            tgJournalStatusSetModal(note.id)
        })

        tr.insertAdjacentElement("beforeend", tdEvent)
        tr.insertAdjacentElement("beforeend", tdDateTime)
        tr.insertAdjacentElement("beforeend", tdInitiator)
        tr.insertAdjacentElement("beforeend", tdRecipient)
        tr.insertAdjacentElement("beforeend", tdStatus)
        return tr
    }

    if (clear){
        tgJournalTableBody.innerHTML = ""
    }
    list.forEach(note => {
        tgJournalTableBody.insertAdjacentElement("beforeend", getElement(note))
    })
}

function tgJournalGetEventStr(event){
    switch (Number(event)) {
        case 0:
            return "Другое"
        case 1:
            return "Расписание на завтра"
        case 2:
            return "Напоминание о занятии"
        case 3:
            return "Домашнее заданее: новое"
        case 4:
            return "Домашнее заданее: сдача/проверка"
        case 5:
            return "Материалы: ручная отправка"
        case 6:
            return "Материалы: автоматическая отправка"
        case 7:
            return "Новое сообщение"
        default:
            return ""
    }
}


const tgJournalTableBody = document.querySelector("#tgJournalTableBody")

tgJournalMain()