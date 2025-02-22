function chatAdminMain(){
    chatMessagesAttachmentTypesArray = chatMessagesAttachmentTypesArray
        .concat(
            mediaFormats.imageFormats,
            mediaFormats.videoFormats,
            mediaFormats.animationFormats,
            mediaFormats.archiveFormats,
            mediaFormats.pdfFormats,
            mediaFormats.voiceFormats,
            mediaFormats.audioFormats,
            mediaFormats.textFormats,
            mediaFormats.presentationFormats
        )
    chatAdminGetUsers()
    chatAdminMessagesNewSend.addEventListener("click", chatAdminMessageSend)
    // chatMessagesNewAttachmentButton.addEventListener("click", function (){
    //     if (chatMessagesNewAttachmentInput.files.length === 0){
    //         chatMessagesNewAttachmentInput.click()
    //     } else {
    //         chatMessagesNewAttachmentInput.value = ""
    //         chatMessagesNewAttachmentButton.innerHTML = "Вложение (0)"
    //     }
    // })
    // chatMessagesNewAttachmentInput.addEventListener("change", function (){
    //     chatMessagesNewAttachmentButton.innerHTML = `Вложение (${chatMessagesNewAttachmentInput.files.length})`
    // })
}

function chatAdminGetUsers(){
    chatAPIGetAdminChats().then(request => {
        switch (request.status){
            case 200:
                chatAdminShowUsers(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function chatAdminSelectUser(userID){
    chatAdminUsersList.querySelectorAll("a").forEach(item => {
        item.classList.remove("active")
    })
    chatAdminGetMessages(userID)
}

function chatAdminShowUsers(userlist = []){
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
            chatAdminSelectUser(user.id)
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
        elemInfoName.innerHTML = user.name
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

    chatAdminUsersList.innerHTML = ""
    userlist.forEach(user => {
        chatAdminUsersList.insertAdjacentElement("beforeend", getElement(user))
    })
}

function chatAdminGetMessages(userID){
    chatAPIGetMessages(userID, "Admin").then(request => {
        switch (request.status){
            case 200:
                chatAdminShowMessages(request.response.messages)
                chatAdminMessagesUserName.innerHTML = request.response.username
                chatAdminMessagesSelectedUserID = userID
                break
            default:
                showErrorToast()
                break
        }
    })
}

function chatAdminShowMessages(messages=[], clear=true){
    function getElement(message){
        const messageDiv = document.createElement("div")
        const messageBody = document.createElement("div")
        const messageBodyText = document.createElement("p")
        const messageBodyData = document.createElement("span")
        messageDiv.classList.add("d-flex")
        if (message.receiver){
            messageDiv.classList.add("justify-content-end")
            messageBody.classList.add("chats-message-sender")
            const messageBodySenderName = document.createElement("div")
            console.log(message)
            messageBodySenderName.innerHTML = `${message.sender.first_name} ${message.sender.last_name}`
            messageBodySenderName.classList.add("chats-message-receiver-name", "mb-1")
            messageBody.insertAdjacentElement("beforeend", messageBodySenderName)
        } else {
            messageDiv.classList.add("justify-content-start")
            messageBody.classList.add("chats-message-receiver")


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
        chatAdminMessages.innerHTML = ""
    }
    let last_message = null
    messages.forEach(message => {
        const element = getElement(message)
        if (!last_message){
            last_message = element
        }
        chatAdminMessages.insertAdjacentElement(clear?"afterbegin":"beforeend", element)
    })
    if (last_message){
        last_message.scrollIntoView({block: "end", behavior: "auto"})
    }
}

function chatAdminMessageValidation(errors){
    function setInvalid(errorMsg){
        chatAdminMessagesNewText.classList.add("is-invalid")
        chatAdminMessagesNewTextError.innerHTML = errorMsg
        validationStatus = false
    }

    function validateText(){
        if (chatAdminMessagesNewText.value.trim().length === 0 && chatAdminMessagesNewAttachmentInput.files.length === 0){
            setInvalid("Сообщение не может быть пустым")
            return
        }

        if (chatAdminMessagesNewText.value.trim().length > 2000){
            setInvalid("Длина сообщения не может превышать более 2000 символов")
        }
    }

    function validateAttachments(){
        const filelist = chatAdminMessagesNewAttachmentInput.files
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
    chatAdminMessagesNewText.classList.remove("is-invalid")
    chatAdminMessagesNewTextError.innerHTML = ""
    if (errors){

    } else {
        validateText()
        validateAttachments()
    }

    return validationStatus
}

function chatAdminMessageSend(){
    function getFD(){
        const fd = new FormData()
        fd.set("message", chatAdminMessagesNewText.value.trim())
        fd.set("chat_type", "Admin")
        const files = chatAdminMessagesNewAttachmentInput.files
        for (const file of files){
            fd.append("attachments", file)
        }
        return fd
    }

    if (chatAdminMessageValidation()){
        chatAPISendMessage(chatAdminMessagesSelectedUserID, getFD()).then(request => {
            switch (request.status){
                case 201:
                    chatAdminShowMessages([request.response], false)
                    chatAdminMessagesNewText.value = ""
                    chatAdminMessagesNewAttachmentInput.value = ""
                    chatAdminMessagesNewAttachmentButton.innerHTML = "Вложение (0)"
                    break
                case 400:
                    chatAdminMessageValidation(request.response)
                    break
                default:
                    showErrorToast()
                    break
            }
        })
    }
}

let chatAdminMessagesSelectedUserID = null
let chatMessagesAttachmentTypesArray = []

const chatAdminUsersList = document.querySelector("#chatAdminUsersList")
const chatAdminMessagesUserName = document.querySelector("#chatAdminMessagesUserName")
const chatAdminMessagesCard = document.querySelector("#chatAdminMessagesCard")
const chatAdminMessages = document.querySelector("#chatAdminMessages")
const chatAdminMessagesNew = document.querySelector("#chatAdminMessagesNew")
const chatAdminMessagesNewAttachmentButton = chatAdminMessagesNew.querySelector("#chatAdminMessagesNewAttachmentButton")
const chatAdminMessagesNewAttachmentInput = chatAdminMessagesNew.querySelector("#chatAdminMessagesNewAttachmentInput")
const chatAdminMessagesNewText = chatAdminMessagesNew.querySelector("#chatAdminMessagesNewText")
const chatAdminMessagesNewSend = chatAdminMessagesNew.querySelector("#chatAdminMessagesNewSend")
const chatAdminMessagesNewTextError = chatAdminMessagesNew.querySelector("#chatAdminMessagesNewTextError")

chatAdminMain()