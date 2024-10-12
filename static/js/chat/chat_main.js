function chatMain(){
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
    chatMessagesSelectedUserID = getHashValue("user")
    if (chatMessagesSelectedUserID){
        chatSelectUser(chatMessagesSelectedUserID)
    }
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

function chatSelectUser(userID, chatType="NewUser"){
    chatMessagesSelectedChatType = chatType
    chatUsersList.querySelectorAll("a").forEach(item => {
        item.classList.remove("active")
    })
    chatGetMessages(userID, chatType)
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
                user.id?user.id:user.tg_id,
                user.id?"NewUser":"Telegram"
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

function chatGetMessages(userID, chatType="NewUser"){
    chatAPIGetMessages(userID, chatType, chatMessagesFromUserID).then(request => {
        switch (request.status){
            case 200:
                chatShowMessages(request.response.messages, userID)
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

function chatShowMessagesGetAttachmentsElement(attachments = []){
    let images = []
    let audios = []
    let videos = []
    let files = []
    attachments.forEach(file => {
        switch (file.type){
            case "image_formats":
                const cardImg = document.createElement("div")
                const cardHeaderImg = document.createElement("div")
                const cardBodyImg = document.createElement("div")
                cardImg.classList.add("card", "col-5", "mb-3", "mx-1")
                cardHeaderImg.classList.add("card-header")
                cardHeaderImg.innerHTML = "Изображение"
                cardBodyImg.classList.add("card-body")
                const a = document.createElement("a")
                a.href = file.path
                a.target = "_blank"
                const img = document.createElement("img")
                img.src = file.path
                img.alt = "Вложение"
                img.style = "object-fit: contain; max"
                img.classList.add("img-fluid")
                a.insertAdjacentElement("beforeend", img)
                cardImg.insertAdjacentElement("beforeend", cardHeaderImg)
                cardImg.insertAdjacentElement("beforeend", cardBodyImg)
                cardBodyImg.insertAdjacentElement("beforeend", a)
                if (file.caption){
                    const cardBodyImgCaption = document.createElement("span")
                    cardBodyImgCaption.innerHTML = file.caption
                    cardBodyImg.insertAdjacentElement("beforeend", cardBodyImgCaption)
                }
                images.push(cardImg)
                break
            case "animation_formats":
                const cardAnim = document.createElement("div")
                const cardHeaderAnim = document.createElement("div")
                const cardBodyAnim = document.createElement("div")
                cardAnim.classList.add("card", "col-5", "mb-3", "mx-1")
                cardHeaderAnim.classList.add("card-header")
                cardHeaderAnim.innerHTML = "Анимация"
                cardBodyAnim.classList.add("card-body")
                const aAnim = document.createElement("a")
                aAnim.href = file.path
                aAnim.target = "_blank"
                const imgAnim = document.createElement("img")
                imgAnim.src = file.path
                imgAnim.alt = "Вложение"
                imgAnim.style = "object-fit: contain;"
                imgAnim.classList.add("img-fluid")
                cardAnim.insertAdjacentElement("beforeend", cardHeaderAnim)
                cardAnim.insertAdjacentElement("beforeend", cardBodyAnim)
                cardBodyAnim.insertAdjacentElement("beforeend", aAnim)
                aAnim.insertAdjacentElement("beforeend", imgAnim)
                if (file.caption){
                    const cardBodyAnimCaption = document.createElement("span")
                    cardBodyAnimCaption.innerHTML = file.caption
                    cardBodyAnim.insertAdjacentElement("beforeend", cardBodyAnimCaption)
                }
                images.push(cardAnim)
                break
            case "voice_formats" || "audio_formats":
                const cardAud = document.createElement("div")
                const cardHeaderAud = document.createElement("div")
                const cardBodyAud = document.createElement("div")
                cardAud.classList.add("card", "mb-3")
                cardHeaderAud.classList.add("card-header")
                cardHeaderAud.innerHTML = "Аудио"
                cardBodyAud.classList.add("card-body")
                const audio = document.createElement("audio")
                audio.controls = true
                audio.src = file.path
                cardAud.insertAdjacentElement("beforeend", cardHeaderAud)
                cardAud.insertAdjacentElement("beforeend", cardBodyAud)
                cardBodyAud.insertAdjacentElement("beforeend", audio)
                if (file.caption){
                    const cardBodyAudCaption = document.createElement("span")
                    cardBodyAudCaption.innerHTML = file.caption
                    cardBodyAud.insertAdjacentElement("beforeend", cardBodyAudCaption)
                }
                audios.push(cardAud)
                break
            case "video_formats":
                const cardVideo = document.createElement("div")
                const cardHeaderVideo = document.createElement("div")
                const cardBodyVideo = document.createElement("div")
                cardVideo.classList.add("card", "mb-3", "col-5", "mx-1")
                cardHeaderVideo.classList.add("card-header")
                cardHeaderVideo.innerHTML = "Видео"
                cardBodyVideo.classList.add("card-body")
                const video = document.createElement("video")
                video.controls = true
                video.src = file.path
                video.classList.add("img-fluid")
                cardVideo.insertAdjacentElement("beforeend", cardHeaderVideo)
                cardVideo.insertAdjacentElement("beforeend", cardBodyVideo)
                cardBodyVideo.insertAdjacentElement("beforeend", video)
                if (file.caption){
                    const cardBodyVideoCaption = document.createElement("span")
                    cardBodyVideoCaption.innerHTML = file.caption
                    cardBodyVideo.insertAdjacentElement("beforeend", cardBodyVideoCaption)
                }
                videos.push(cardVideo)
                break
            case "unsupported":
                break
            default:
                const card = document.createElement("div")
                card.classList.add("card", "mb-3")
                const cardHeader = document.createElement("div")
                const cardBody = document.createElement("div")
                cardHeader.classList.add("card-header")
                cardHeader.innerHTML = file.name
                cardBody.classList.add("card-body")
                const downloadButton = document.createElement("button")
                const downloadButtonA = document.createElement("a")
                downloadButtonA.href = file.path
                downloadButtonA.target = "_blank"
                downloadButton.type = "button"
                downloadButton.classList.add("btn", "btn-primary", "me-3")
                downloadButton.innerHTML = '<i class="bi bi-download"></i> Скачать'
                downloadButtonA.insertAdjacentElement("beforeend", downloadButton)
                cardBody.insertAdjacentElement("beforeend", downloadButtonA)
                card.insertAdjacentElement("beforeend", cardHeader)
                card.insertAdjacentElement("beforeend", cardBody)

                if (file.caption){
                    const cardBodyCaption = document.createElement("span")
                    cardBodyCaption.innerHTML = file.caption
                    cardBody.insertAdjacentElement("beforeend", cardBodyCaption)
                }

                files.push(card)
                break
        }
    })
    const attAll = document.createElement("div")
    const attImg = document.createElement("div")
    const attAud = document.createElement("div")
    attImg.classList.add("row")
    attAud.classList.add("row")
    attAll.classList.add("px-3")
    attAll.insertAdjacentElement("beforeend", attImg)
    attAll.insertAdjacentElement("beforeend", attAud)
    images.forEach(img => {
        attImg.insertAdjacentElement("beforeend", img)
    })
    videos.forEach(vid => {
        attImg.insertAdjacentElement("beforeend", vid)
    })
    audios.forEach(aud => {
        attAud.insertAdjacentElement("beforeend", aud)
    })
    files.forEach(file => {
        attAud.insertAdjacentElement("beforeend", file)
    })
    return attAll
}

function chatShowMessages(messages=[], userID, clear=true){
    function getElement(message){
        console.log(message)
        const messageDiv = document.createElement("div")
        messageDiv.classList.add("d-flex")
        const messageBody = document.createElement("div")
        switch (chatMessagesSelectedChatType){
            case "NewUser":
                messageDiv.classList.add(message.receiver.id === userID?"justify-content-end":"justify-content-start")
                messageBody.classList.add(message.receiver.id === userID?"chats-message-sender":"chats-message-receiver")
                break
            case "Telegram":
                messageDiv.classList.add(message.receiver_tg === userID?"justify-content-end":"justify-content-start")
                messageBody.classList.add(message.receiver_tg === userID?"chats-message-sender":"chats-message-receiver")
                break
        }
        messageDiv.insertAdjacentElement("beforeend", messageBody)
        const messageBodyText = document.createElement("p")
        messageBodyText.innerHTML = message.message
        const messageBodyData = document.createElement("span")
        messageBodyData.classList.add("chats-message-data")
        messageBodyData.innerHTML = chatGetDateTimeString(message.date)
        if (message.read){
            messageBodyData.innerHTML += ` | прочитано ${chatGetDateTimeString(message.read)}`
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
        fd.set("chat_type", chatMessagesSelectedChatType)
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
                    chatShowMessages([request.response], chatMessagesSelectedUserID, false)
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
let chatMessagesSelectedUserID = null
let chatMessagesSelectedChatType = null
let chatMessagesFromUserID = null
let chatMessagesAttachmentTypesArray = []

chatMain()