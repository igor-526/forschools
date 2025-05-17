function chatMain(){
    chatGetUsers()
    chatUsersSearchListeners()
    chatMessagesSelectedUserID = getHashValue("user")
    if (chatMessagesSelectedUserID){
        chatSelectUser(chatMessagesSelectedUserID, 0)
    }
    chatMessagesNewSend.addEventListener("click", chatMessageSend)
    chatMessagesNewAttachmentButton.addEventListener("click", function (){
        if (chatMessagesNewAttachmentInput.files.length === 0){
            chatMessagesNewAttachmentInput.click()
        } else {
            chatMessagesNewAttachmentInput.value = ""
            chatMessagesNewAttachmentButton.innerHTML = "Вложение (0)"
        }
    })
    chatMessagesNewAttachmentInput.addEventListener("change", function (){
        chatMessagesNewAttachmentButton.innerHTML = `Вложение (${chatMessagesNewAttachmentInput.files.length})`
    })

}

function chatUsersSearchListeners(){
    chatUsersListSearchErase.addEventListener("click", function () {
        chatUsersListSearchField.value = ""
        chatUsersSearch = null
        chatGetUsers()
    })
    chatUsersListSearchField.addEventListener("input", function () {
        const query = chatUsersListSearchField.value.trim().toLowerCase()
        if (query === ""){
            chatUsersSearch = null
        } else {
            chatUsersSearch = query
        }
        chatGetUsers()
    })
}

function chatGetUsers(){
    chatAPIGetChats(chatMessagesFromUserID, chatUsersSearch).then(request => {
        switch (request.status){
            case 200:
                chatShowUsers(request.response)
                if (chatsGroupCanAddNew){
                    chatsGroupSetUsers(request.response)
                }
                break
            default:
                showErrorToast()
                break
        }
    })
}

function chatSelectUser(userID, usertype=0){
    chatMessagesSelectedChatType = usertype
    chatUsersList.querySelectorAll("a").forEach(item => {
        item.classList.remove("active")
    })
    chatGetMessages(userID, usertype)
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
        a.href = "#"
        a.addEventListener("click", function (){
            chatSelectUser(
                user.id,
                user.usertype
            )
            a.classList.add("active")
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
        elemInfoName.innerHTML = user.note?`${user.name} [${user.note}]`:user.name
        if (user.unread !== 0){
            elemInfo.insertAdjacentElement("beforeend", getBadge(user.unread))
        }
        const elemDivDate = document.createElement("small")
        elemDivDate.innerHTML = user.last_message_date?timeUtilsDateTimeToStr(new Date(user.last_message_date)):"Нет сообщений"
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

function chatGetMessages(userID, usertype=0){
    chatAPIGetMessages(userID, usertype, chatMessagesFromUserID).then(request => {
        switch (request.status){
            case 200:
                chatShowMessages(request.response.messages)
                chatMessagesUserName.innerHTML = request.response.username
                chatMessagesSelectedUserID = userID
                if (!chatMessagesFromUserID){
                    chatMessagesNew.classList.remove("d-none")
                }
                break
            default:
                showErrorToast()
                break
        }
    })
}

function chatShowMessages(messages=[], clear=true){
    function getElement(message){
        const messageDiv = document.createElement("div")
        const messageBody = document.createElement("div")
        const messageBodyText = document.createElement("p")
        const messageBodyData = document.createElement("span")
        messageDiv.classList.add("d-flex")
        if (message.role === "s"){
            messageDiv.classList.add("justify-content-end")
            messageBody.classList.add("chats-message-sender")
        } else {
            messageDiv.classList.add("justify-content-start")
            messageBody.classList.add("chats-message-receiver")
            if (chatMessagesSelectedChatType === 3){
                const messageBodySenderName = document.createElement("div")
                messageBodySenderName.innerHTML = message.sender ? `${message.sender.first_name} ${message.sender.last_name}` :
                    `${message.sender_tg.user.first_name} ${message.sender_tg.user.last_name} [${message.sender_tg.usertype}]`
                messageBodySenderName.classList.add("chats-message-receiver-name", "mb-1")
                messageBody.insertAdjacentElement("beforeend", messageBodySenderName)
            }
        }
        messageDiv.insertAdjacentElement("beforeend", messageBody)
        messageBodyText.innerHTML = message.message
        messageBodyData.classList.add("chats-message-data")
        messageBodyData.innerHTML = timeUtilsDateTimeToStr(new Date(message.date))
        const read_data = Object.keys(message.read_data)
        switch (read_data.length){
            case 0:
                break
            case 1:
                const rdtObj = (message.read_data[read_data[0]])
                const rdt = new Date()
                const rdtObjM = rdtObj.month === 1 ? 12 : rdtObj.month - 1
                rdt.setUTCFullYear(rdtObj.year, rdtObjM, rdtObj.day)
                rdt.setUTCHours(rdtObj.hour, rdtObj.minute, 0, 0)
                messageBodyData.innerHTML += ` | прочитано ${timeUtilsDateTimeToStr(rdt)}`
                break
            default:
                break
        }
        messageBody.insertAdjacentElement("beforeend", messageBodyText)
        if (message.files.length !== 0){
            messageBody.insertAdjacentElement("beforeend", chatShowMessagesGetAttachmentsElement(message.files))
        }
        messageBody.insertAdjacentElement("beforeend", messageBodyData)
        return messageDiv
    }

    if (clear){
        chatMessages.innerHTML = ""
    }
    let last_message = null
    messages.forEach(message => {
        const element = getElement(message)
        if (!last_message){
            last_message = element
        }
        chatMessages.insertAdjacentElement(clear?"afterbegin":"beforeend", element)
    })
    if (last_message){
        last_message.scrollIntoView({block: "end", behavior: "auto"})
    }
}

function chatMessageValidation(errors){
    function setInvalid(errorMsg){
        chatMessagesNewText.classList.add("is-invalid")
        chatMessagesNewTextError.innerHTML = errorMsg
        validationStatus = false
    }

    function validateText(){
        if (chatMessagesNewText.value.trim().length === 0 && chatMessagesNewAttachmentInput.files.length === 0){
            setInvalid("Сообщение не может быть пустым")
            return
        }

        if (chatMessagesNewText.value.trim().length > 2000){
            setInvalid("Длина сообщения не может превышать более 2000 символов")
        }
    }

    function validateAttachments(){
        const filelist = chatMessagesNewAttachmentInput.files
        for (const file of filelist){
            const filename = file.name.split(/([\\./])/g)
            const type = filename[filename.length-1]
            if (!chatMessagesAttachmentTypesArray.includes(type)){
                setInvalid("Формат файла не поддерживается")
                return
            }
        }
    }

    let validationStatus = true
    chatMessagesNewText.classList.remove("is-invalid")
    chatMessagesNewTextError.innerHTML = ""
    if (errors){

    } else {
        validateText()
        validateAttachments()
    }

    return validationStatus
}

function chatMessageSend(){
    function getFD(){
        const fd = new FormData()
        fd.set("message", chatMessagesNewText.value.trim())
        fd.set("usertype", chatMessagesSelectedChatType)
        const files = chatMessagesNewAttachmentInput.files
        for (const file of files){
            fd.append("attachments", file)
        }
        return fd
    }

    if (chatMessageValidation()){
        chatAPISendMessage(chatMessagesSelectedUserID, getFD()).then(request => {
            switch (request.status){
                case 201:
                    chatShowMessages([request.response], false)
                    chatMessagesNewText.value = ""
                    chatMessagesNewAttachmentInput.value = ""
                    chatMessagesNewAttachmentButton.innerHTML = "Вложение (0)"
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
const chatMessagesNewAttachmentButton = document.querySelector("#chatMessagesNewAttachmentButton")
const chatMessagesNewAttachmentInput = document.querySelector("#chatMessagesNewAttachmentInput")
const chatUsersListSearchErase = document.querySelector("#chatUsersListSearchErase")
const chatUsersListSearchField = document.querySelector("#chatUsersListSearchField")
let chatUsersSearch = null
let chatMessagesSelectedUserID = null
let chatMessagesSelectedChatType = null
let chatMessagesFromUserID = null
let chatMessagesAttachmentTypesArray = []

chatMain()