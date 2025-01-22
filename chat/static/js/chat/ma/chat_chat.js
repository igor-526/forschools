function chatMAMain(){
    selectedChatType = getHashValue("chat_type")
    chatMAFromUser = getHashValue("from_user")
    if (!chatMAFromUser){
        chatMA.style = `height: ${window.innerHeight - 120}px;`
        chatMANew.classList.remove("d-none")
        chatMAAttachmentTypesArray = chatMAAttachmentTypesArray
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
        chatMAAttachmentsListeners()
        chatMANewSend.addEventListener("click", chatMASend)
    }
    chatMAGetMessages()
}

function chatMAGetMessages(){
    chatAPIGetMessages(chatMAchatID, selectedChatType, chatMAFromUser).then(request => {
        switch (request.status){
            case 200:
                chatMAShowMessages(request.response.messages, request.response.current_user_id)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function chatMAShowMessages(messages=[], currentUserID, down=false){
    function getElement(message){
        const messageDiv = document.createElement("div")
        const messageBody = document.createElement("div")
        const messageBodyText = document.createElement("p")
        const messageBodyData = document.createElement("span")
        messageDiv.classList.add("d-flex")
        if (message.sender && (currentUserID === message.sender.id) || currentUserID === "sender"){
            messageDiv.classList.add("justify-content-end")
            messageBody.classList.add("chats-message-sender")
        } else {
            messageDiv.classList.add("justify-content-start")
            messageBody.classList.add("chats-message-receiver")
            if (selectedChatType === "Group"){
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
            messageBody.insertAdjacentElement("beforeend", chatShowMessagesGetAttachmentsElement(message.files, true))
        }
        messageBody.insertAdjacentElement("beforeend", messageBodyData)
        return messageDiv
    }

    let scrollTo = false
    messages.forEach(message => {
        const element = getElement(message)
        if (!scrollTo){
            scrollTo = element
        }
        chatMA.insertAdjacentElement(down ? "afterend" : "afterbegin", element)
    })
    scrollTo.scrollIntoView({alignToTop: true, behavior: "auto"})
}

function chatMAAttachmentsListeners(){
    chatMANewAttachmentButton.addEventListener("click", function (){
        switch (this.attributes.getNamedItem("data-att-action").value){
            case "open":
                chatMANewAttachmentInput.click()
                break
            case "delete":
                chatMANewAttachmentInput.value = ""
                chatMANewAttachmentButton.classList.add("btn-outline-secondary")
                chatMANewAttachmentButton.classList.remove("btn-danger")
                chatMANewAttachmentButton.setAttribute("data-att-action", "open")
                chatMANewAttachmentButton.innerHTML = 'Вложение'
                break
        }
    })
    chatMANewAttachmentInput.addEventListener("input", function (){
        const filesCount = chatMANewAttachmentInput.files.length
        chatMANewAttachmentButton.classList.remove("btn-outline-secondary")
        chatMANewAttachmentButton.classList.add("btn-danger")
        chatMANewAttachmentButton.setAttribute("data-att-action", "delete")
        chatMANewAttachmentButton.innerHTML = `Удалить (${filesCount})`

    })
}

function chatMAMessageValidation(){
    function resetValidation(){
        chatMANewText.classList.remove("is-invalid")
        chatMANewTextError.innerHTML = ""
    }

    function validateAttachments(){
        const filelist = chatMANewAttachmentInput.files
        for (const file of filelist){
            const filename = file.name.split(/([\\./])/g)
            const type = filename[filename.length-1]
            if (!chatMAAttachmentTypesArray.includes(type)){
                chatMANewText.classList.add("is-invalid")
                chatMANewTextError.innerHTML = "Формат файла не поддерживается"
                validationStatus = false
                return
            }
            attachmentsCount += 1
        }
    }

    function validateMessage(){
        if (chatMANewText.value.trim().length === 0 && attachmentsCount === 0){
            chatMANewText.classList.add("is-invalid")
            chatMANewTextError.innerHTML = "Сообщение не может быть пустым"
            validationStatus = false
        } else {
            const messageLength = chatMANewText.value.trim().length
            if (messageLength > 2000) {
                chatMANewText.classList.add("is-invalid")
                chatMANewTextError.innerHTML = `Длина сообщения не может превышать 2000 символов. У вас ${messageLength}`
                validationStatus = false
            }
        }
    }

    let validationStatus = true
    let attachmentsCount = 0

    resetValidation()
    validateAttachments()
    validateMessage()

    return validationStatus
}

function chatMASend(){
    function getFD(){
        const fd = new FormData()
        fd.set("message", chatMANewText.value.trim())
        fd.set("chat_type", selectedChatType)
        const files = chatMANewAttachmentInput.files
        for (const file of files){
            fd.append("attachments", file)
        }
        return fd
    }

    if (chatMAMessageValidation()){
        chatAPISendMessage(chatMAchatID, getFD()).then(request => {
            switch (request.status){
                case 201:
                    chatMAShowMessages([request.response], "sender", true)
                    chatMANewAttachmentInput.value = ""
                    chatMANewText.value = ""
                    chatMANewAttachmentButton.classList.add("btn-outline-secondary")
                    chatMANewAttachmentButton.classList.remove("btn-danger")
                    chatMANewAttachmentButton.setAttribute("data-att-action", "open")
                    chatMANewAttachmentButton.innerHTML = 'Вложение'
                    console.log(request.response)
                    break
                case 400:
                    tgAPI.showAlert("Произошла ошибка. Сообщение не доставлено")
                    break
                default:
                    tgAPI.showAlert("Произошла ошибка. Сообщение не доставлено")
                    break
            }
        })
    }
}

let selectedChatType = null
let chatMAFromUser = null
let chatMAAttachmentTypesArray = []

const chatMA = document.querySelector("#chatMA")
const chatMANew = document.querySelector("#chatMANew")
const chatMANewAttachmentButton = chatMANew.querySelector("#chatMANewAttachmentButton")
const chatMANewAttachmentInput = chatMANew.querySelector("#chatMANewAttachmentInput")
const chatMANewText = chatMANew.querySelector("#chatMANewText")
const chatMANewSend = chatMANew.querySelector("#chatMANewSend")
const chatMANewTextError = chatMANew.querySelector("#chatMANewTextError")

chatMAMain()