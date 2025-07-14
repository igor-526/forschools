function chatUnsentMain(){
    chatUnsentGet()
}

function chatUnsentGet(){
    chatAPIGetUnsent().then(request => {
        chatUnsentShow(request.response)
    })
}

function chatUnsentShow(messages){
    function getElement(message){
        const tr = document.createElement("tr")
        const tdUsers = document.createElement("td")
        tdUsers.innerHTML = message.user.full_name
        tdUsers.innerHTML += '<i class="bi bi-arrow-right"></i>' + (message.receiver ?
            message.receiver.full_name : '<i class="bi bi-person-fill-x"></i>')
        const tdMessageTime = document.createElement("td")
        tdMessageTime.innerHTML = message.start_time ? timeUtilsDateTimeToStr(message.start_time) : ""
        const tdMessageText = document.createElement("td")
        tdMessageText.innerHTML = message.message
        const tdAttachmentsCount = document.createElement("td")
        tdAttachmentsCount.innerHTML = message.attachments
        const tdActions = document.createElement("td")
        const tdActionsButtonInfo = document.createElement("button")
        const tdActionsButtonSend = document.createElement("button")
        tdActionsButtonInfo.disabled = true
        tdActionsButtonSend.disabled = true
        tdActionsButtonInfo.innerHTML = '<i class="bi bi-info-square"></i>'
        tdActionsButtonSend.innerHTML = '<i class="bi bi-send"></i>'
        tdActionsButtonInfo.classList.add("btn", "btn-primary", "mx-1")
        tdActionsButtonSend.classList.add("btn", "btn-primary", "mx-1")
        tdActions.insertAdjacentElement("beforeend", tdActionsButtonInfo)
        tdActions.insertAdjacentElement("beforeend", tdActionsButtonSend)
        tr.insertAdjacentElement("beforeend", tdUsers)
        tr.insertAdjacentElement("beforeend", tdMessageTime)
        tr.insertAdjacentElement("beforeend", tdMessageText)
        tr.insertAdjacentElement("beforeend", tdAttachmentsCount)
        tr.insertAdjacentElement("beforeend", tdActions)
        return tr
    }

    messages.forEach(message => {
        chatUnsentTableBody.insertAdjacentElement("beforeend", getElement(message))
    })
}

const chatUnsentTableBody = document.querySelector("#chatUnsentTableBody")
chatUnsentMain()