function chatAdminMAMain(){
    chatAdminMA.style = `height: ${window.innerHeight - 120}px;`
    chatAdminMANew.classList.remove("d-none")
    chatAdminMAAttachmentTypesArray = chatAdminMAAttachmentTypesArray
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
    chatAdminMANewSend.addEventListener("click", chatAdminMASend)
    chatAdminMAGetMessages()
}

function chatAdminMAGetMessages(){
    chatAPIGetMessages(chatAdminMAchatID, "Admin").then(request => {
        switch (request.status){
            case 200:
                chatMAAdminShowMessages(request.response.messages)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function chatMAAdminShowMessages(messages=[], down=false){
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
        chatAdminMA.insertAdjacentElement(down ? "afterend" : "afterbegin", element)
    })
    scrollTo.scrollIntoView({alignToTop: true, behavior: "auto"})
}

function chatMAAttachmentsListeners(){
    chatAdminMANewAttachmentButton.addEventListener("click", function (){
        switch (this.attributes.getNamedItem("data-att-action").value){
            case "open":
                chatAdminMANewAttachmentInput.click()
                break
            case "delete":
                chatAdminMANewAttachmentInput.value = ""
                chatAdminMANewAttachmentButton.classList.add("btn-outline-secondary")
                chatAdminMANewAttachmentButton.classList.remove("btn-danger")
                chatAdminMANewAttachmentButton.setAttribute("data-att-action", "open")
                chatAdminMANewAttachmentButton.innerHTML = 'Вложение'
                break
        }
    })
    chatAdminMANewAttachmentInput.addEventListener("input", function (){
        const filesCount = chatAdminMANewAttachmentInput.files.length
        chatAdminMANewAttachmentButton.classList.remove("btn-outline-secondary")
        chatAdminMANewAttachmentButton.classList.add("btn-danger")
        chatAdminMANewAttachmentButton.setAttribute("data-att-action", "delete")
        chatAdminMANewAttachmentButton.innerHTML = `Удалить (${filesCount})`

    })
}

function chatAdminMAMessageValidation(){
    function resetValidation(){
        chatAdminMANewText.classList.remove("is-invalid")
        chatAdminMANewTextError.innerHTML = ""
    }

    function validateAttachments(){
        const filelist = chatAdminMANewAttachmentInput.files
        for (const file of filelist){
            const filename = file.name.split(/([\\./])/g)
            const type = filename[filename.length-1]
            if (!chatAdminMAAttachmentTypesArray.includes(type)){
                chatAdminMANewText.classList.add("is-invalid")
                chatAdminMANewTextError.innerHTML = "Формат файла не поддерживается"
                validationStatus = false
                return
            }
            attachmentsCount += 1
        }
    }

    function validateMessage(){
        if (chatAdminMANewText.value.trim().length === 0 && attachmentsCount === 0){
            chatAdminMANewText.classList.add("is-invalid")
            chatAdminMANewTextError.innerHTML = "Сообщение не может быть пустым"
            validationStatus = false
        } else {
            const messageLength = chatAdminMANewText.value.trim().length
            if (messageLength > 2000) {
                chatAdminMANewText.classList.add("is-invalid")
                chatAdminMANewTextError.innerHTML = `Длина сообщения не может превышать 2000 символов. У вас ${messageLength}`
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

function chatAdminMASend(){
    function getFD(){
        const fd = new FormData()
        fd.set("message", chatAdminMANewText.value.trim())
        fd.set("chat_type", "Admin")
        const files = chatAdminMANewAttachmentInput.files
        for (const file of files){
            fd.append("attachments", file)
        }
        return fd
    }

    if (chatAdminMAMessageValidation()){
        chatAPISendMessage(chatAdminMAchatID, getFD()).then(request => {
            switch (request.status){
                case 201:
                    chatMAAdminShowMessages([request.response], true)
                    chatAdminMANewAttachmentInput.value = ""
                    chatAdminMANewText.value = ""
                    chatAdminMANewAttachmentButton.classList.add("btn-outline-secondary")
                    chatAdminMANewAttachmentButton.classList.remove("btn-danger")
                    chatAdminMANewAttachmentButton.setAttribute("data-att-action", "open")
                    chatAdminMANewAttachmentButton.innerHTML = 'Вложение'
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

let chatAdminMAAttachmentTypesArray = []

const chatAdminMA = document.querySelector("#chatAdminMA")
const chatAdminMANew = document.querySelector("#chatAdminMANew")
const chatAdminMANewAttachmentButton = chatAdminMANew.querySelector("#chatAdminMANewAttachmentButton")
const chatAdminMANewAttachmentInput = chatAdminMANew.querySelector("#chatAdminMANewAttachmentInput")
const chatAdminMANewText = chatAdminMANew.querySelector("#chatAdminMANewText")
const chatAdminMANewSend = chatAdminMANew.querySelector("#chatAdminMANewSend")
const chatAdminMANewTextError = chatAdminMANew.querySelector("#chatAdminMANewTextError")

chatAdminMAMain()