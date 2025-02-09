function userLogsTagsReset(){
    userLogsOffcanvasTagsList.innerHTML = ""
}

function userLogsTagsSet(tag){
    userLogsMessagesSelectedTag = tag
    userLogsTagsReset()
    userLogsAPIGetMessagesByTag(userLogsSelectedPlan, tag).then(request => {
        switch (request.status){
            case 200:
                console.log(request.response)
                userLogsTagsSetMessages(request.response)
                bsUserLogsOffcanvasTags.show()
                break
            default:
                showErrorToast("Не удалось загрузить список сообщений")
                break
        }
    })
}

function userLogsTagsSetMessages(messages){
    function getElement(message){
        const a = document.createElement("a")
        a.href = "#"
        a.classList.add("list-group-item", "list-group-item-action")
        const header = document.createElement("div")
        header.classList.add("w-100")
        a.insertAdjacentElement("beforeend", header)
        const headerNames = document.createElement("h5")
        headerNames.classList.add("mb-1")
        headerNames.innerHTML = `${message.sender_name} -> ${message.receiver_name}`
        header.insertAdjacentElement("beforeend", headerNames)
        const mainText = document.createElement("p")
        mainText.classList.add("mb-1")
        mainText.innerHTML = message.text
        a.insertAdjacentElement("beforeend", mainText)
        const dataText = document.createElement("small")
        dataText.classList.add("text-muted")
        dataText.innerHTML = timeUtilsDateTimeToStr(message.date)
        if (message.files){
            dataText.innerHTML += " (вложения)"
        }
        a.insertAdjacentElement("beforeend", dataText)
        a.addEventListener("click", function (){
            userLogsMessagesSelectedFirstUser = message.sender_id
            userLogsMessagesSelectedSecondUser = message.receiver_id
            userLogsMessagesDownloaded = false
            userLogsMessagesSelectedMsgID = message.id
            userLogsTabsActions.classList.remove("active")
            userLogsTabsMessages.classList.add("active")
            userLogsBodyMessages.classList.remove("d-none")
            userLogsBodyActions.classList.add("d-none")
            userLogsMessagesSet()
            bsUserLogsOffcanvasTags.hide()
        })
        return a
    }
    messages.forEach(message => {
        userLogsOffcanvasTagsList.insertAdjacentElement("beforeend", getElement(message))
    })
}

const userLogsOffcanvasTags = document.querySelector("#userLogsOffcanvasTags")
const bsUserLogsOffcanvasTags = new bootstrap.Offcanvas(userLogsOffcanvasTags)
const userLogsOffcanvasTagsList = userLogsOffcanvasTags.querySelector("#userLogsOffcanvasTagsList")