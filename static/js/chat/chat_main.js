function chatMain(){
    chatAPIGetChats().then(request => {
        switch (request.status){
            case 200:
                chatShowUsers(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
    chatMessagesNewSend.addEventListener("click", chatMessageSend)
}

function chatGetDateTimeString(dt){
    const date = new Date(dt)
    let datestring
    const difference = (new Date()
        .setHours(0,0,0,0) - new Date(dt)
        .setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)
    switch (difference){
        case 0:
            datestring = "сегодня в "
            break
        case 1:
            datestring = "вчера в "
            break
        default:
            datestring = `${date.getDate().toString().padStart(2, "0")}.${date.getMonth().toString().padStart(2, "0")}`
            break
    }
    datestring += ` ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
    return datestring
}

function chatSelectUser(userID){
    chatUsersList.querySelectorAll("a").forEach(item => {
        const itemUserID = Number(item.attributes.getNamedItem("data-chat-id").value)
        if (itemUserID === userID){
            item.classList.add("active")
            chatMessagesUserName.innerHTML = item.querySelector("h6").innerHTML
        } else {
            item.classList.remove("active")
        }
    })
    chatGetMessages(userID)
}

function chatShowUsers(userlist = []){
    function getBadge(number){
        const badge = document.createElement("span")
        badge.classList.add("badge", "bg-primary", "rounded-pill", "ms-1", "mb-1")
        badge.innerHTML = number
        return badge
    }

    function getElement(user){
        const a = document.createElement("a")
        a.classList.add("list-group-item", "d-flex")
        a.setAttribute("data-chat-id", user.id)
        a.href = "#"
        a.addEventListener("click", function (){
            chatSelectUser(user.id)
        })
        const avatar = document.createElement("img")
        avatar.classList.add("chats-profile_photo", "me-2")
        avatar.alt = ""
        avatar.src = user.photo
        const elem = document.createElement("div")
        elem.classList.add("w-100")
        const elemDiv = document.createElement("div")
        elemDiv.classList.add("d-flex", "w-100", "justify-content-between")
        const elemInfo = document.createElement("div")
        elemInfo.classList.add("d-flex")
        const elemInfoName = document.createElement("h6")
        elemInfoName.classList.add("mb-1")
        elemInfoName.innerHTML = user.name
        if (user.unread !== 0){
            elemInfo.insertAdjacentElement("beforeend", getBadge(user.unread))
        }
        const elemDivDate = document.createElement("small")
        elemDivDate.innerHTML = user.last_message_date?chatGetDateTimeString(user.last_message_date):"Нет сообщений"
        const elemMessage = document.createElement("p")
        elemMessage.classList.add("mb-1")
        elemMessage.innerHTML = user.last_message_text
        a.insertAdjacentElement("beforeend", avatar)
        a.insertAdjacentElement("beforeend", elem)
        elem.insertAdjacentElement("beforeend", elemDiv)
        elemDiv.insertAdjacentElement("beforeend", elemInfo)
        elemInfo.insertAdjacentElement("beforeend", elemInfoName)
        elemDiv.insertAdjacentElement("beforeend", elemDivDate)
        elem.insertAdjacentElement("beforeend", elemMessage)
        return a
    }

    chatUsersList.innerHTML = ""
    userlist.forEach(user => {
        chatUsersList.insertAdjacentElement("beforeend", getElement(user))
    })
}

function chatGetMessages(userID, fromUserID){
    chatAPIGetMessages(userID, fromUserID).then(request => {
        switch (request.status){
            case 200:
                console.log(request.response)
                chatShowMessages(request.response, userID)
                selectedUserId = userID
                if (!fromUserID){
                    chatMessagesNew.classList.remove("d-none")
                }
                break
            default:
                showErrorToast()
                break
        }
    })
}

function chatShowMessages(messages=[], userID, clear=true){
    function getElement(message){
        const messageDiv = document.createElement("div")
        messageDiv.classList.add("d-flex")
        messageDiv.classList.add(message.receiver.id === userID?"justify-content-end":"justify-content-start")
        const messageBody = document.createElement("div")
        messageDiv.insertAdjacentElement("beforeend", messageBody)
        messageBody.classList.add(message.receiver.id === userID?"chats-message-sender":"chats-message-receiver")
        const messageBodyText = document.createElement("p")
        messageBodyText.innerHTML = message.message
        const messageBodyData = document.createElement("span")
        messageBodyData.classList.add("chats-message-data")
        messageBodyData.innerHTML = chatGetDateTimeString(message.date)
        if (message.read){
            messageBodyData.innerHTML += ` | прочитано ${chatGetDateTimeString(message.read)}`
        }
        messageBody.insertAdjacentElement("beforeend", messageBodyText)
        messageBody.insertAdjacentElement("beforeend", messageBodyData)
        return messageDiv
    }

    if (clear){
        chatMessages.innerHTML = ""
    }
    messages.forEach(message => {
        chatMessages.insertAdjacentElement(clear?"afterbegin":"beforeend", getElement(message))
    })
}

function chatMessageValidation(errors){
    function setInvalid(errorMsg){
        chatMessagesNewText.classList.add("is-invalid")
        chatMessagesNewTextError.innerHTML = errorMsg
        validationStatus = false
    }

    function validateText(){
        if (chatMessagesNewText.value.trim().length === 0){
            setInvalid("Сообщение не может быть пустым")
            return
        }

        if (chatMessagesNewText.value.trim().length > 2000){
            setInvalid("Длина сообщения не может превышать более 2000 символов")
        }
    }

    let validationStatus = true
    if (errors){

    } else {
        validateText()
    }
    return validationStatus
}

function chatMessageSend(){
    if (chatMessageValidation()){
        const fd = new FormData()
        fd.set("message", chatMessagesNewText.value.trim())
        chatAPISendMessage(selectedUserId, fd).then(request => {
            switch (request.status){
                case 201:
                    chatShowMessages([request.response], selectedUserId, false)
                    chatMessagesNewText.value = ""
                    break
                case 400:
                    chatMessageValidation(request.response)
                    break
                default:
                    showErrorToast()
                    break
            }
        })
    }
}

const chatUsersList = document.querySelector("#chatUsersList")
const chatMessages = document.querySelector("#chatMessages")
const chatMessagesNew = document.querySelector("#chatMessagesNew")
const chatMessagesNewText = chatMessagesNew.querySelector("#chatMessagesNewText")
const chatMessagesNewSend = chatMessagesNew.querySelector("#chatMessagesNewSend")
const chatMessagesNewTextError = chatMessagesNew.querySelector("#chatMessagesNewTextError")
const chatMessagesUserName = document.querySelector("#chatMessagesUserName")
let selectedUserId

chatMain()