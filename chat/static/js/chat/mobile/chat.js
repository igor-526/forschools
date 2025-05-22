function chatMobileMain(){
    chatMobileGetUsers()
    chatMobileFilesListeners()
    chatsMessagesSendBlockTextArea.addEventListener("input", chatMobileUpdateSendBlockSizes)
    chatsMessagesSendBlockSendButton.addEventListener("click", chatMobileSendMessage)
    chatsMobileUsersSelectOffcanvasSearchField.addEventListener("input", function () {
        const query = chatsMobileUsersSelectOffcanvasSearchField.value.trim().toLowerCase()
        chatMobileGetUsers(query === "" ? null : query)
    })
    chatsMobileUsersSelectOffcanvasSearchErase.addEventListener("click", function () {
        chatsMobileUsersSelectOffcanvasSearchField.value = ""
        chatMobileGetUsers(null)
    })
    if (!chatMobileSelectedUserID){
        bsChatsMobileUsersSelectOffcanvas.show()
    }
    if (isAdmin){
        chatsMobileUsersSelectOffcanvasSelectFromUser.addEventListener("click", chatMobileFromUserListener)
    }
}

function chatMobileFromUserListener(){
    function select(userID = []){
        if (userID[0] === chatMobileFromUser){
            return null
        }
        chatMobileFromUser = userID[0]
        if (userID[0] === null){
            chatsMobileUsersSelectOffcanvasSelectFromUser.innerHTML = '<i class="bi bi-people me-2"></i>Выбрать пользователя'
        } else {
            chatsMobileUsersSelectOffcanvasSelectFromUser.innerHTML = `
            <i class="bi bi-people me-2"></i>${users.find(user => user.id === chatMobileFromUser).name}`
        }
        chatsMobileUsersSelectOffcanvasSearchField.value = ""
        chatMobileGetUsers()
    }

    let users = [{
        id: null,
        more_data: null,
        name: "Текущий пользователь"
    }]
    usersAPIGetAll("messagesadmin").then(request => {
        switch (request.status){
            case 200:
                users = users.concat(request.response.map(user => {
                    return {
                        name: `${user.first_name} ${user.last_name}`,
                        more_data: user.last_message_date ? timeUtilsDateTimeToStr(user.last_message_date) : null,
                        id: user.id
                    }
                }))
                universalInfoSelectionModal(
                    "Выберите пользователя", users, false,
                    chatMobileFromUser ? [chatMobileFromUser] : [],
                    true, select
                )
                break
            default:
                showErrorToast("Не удалось загрузить список пользователей")
                break
        }
    })

}

function chatMobileFilesListeners(){
    function setDeleteModal(matID){
        const p = document.createElement("p")
        p.innerHTML = "Действие необратимо"
        const deleteButton = document.createElement("button")
        deleteButton.type = "button"
        deleteButton.classList.add("mx-1", "my-1", "btn", "btn-danger")
        deleteButton.innerHTML = '<i class="bi bi-trash me-1"></i> Удалить'
        const deleteFileModal = mobileInfoModalSet("Удалить файл?",
            [p], [deleteButton])
        deleteButton.addEventListener("click", () => {
            const index = chatMobileFilesArray.indexOf(chatMobileFilesArray.find(mat => mat.id === matID))
            if (index !== -1){
                chatMobileFilesArray.splice(index, 1)
                updateFilesBlock()
            }

            deleteFileModal.close()
        })
    }

    function updateFilesBlock(file, type){
        if (file && type){
            let reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = () => {
                chatMobileFilesArray.push({
                    type: type,
                    file: reader.result,
                    fileForm: file,
                })
                for (let i = 0; i < chatMobileFilesArray.length; i++) {
                    chatMobileFilesArray[i].id = i + 1
                }
                chatsMessagesSendBlockFilesPreview.innerHTML = ""
                chatsMessagesSendBlockFilesPreview.insertAdjacentElement("beforeend", mobileInfoMaterialsGetBlock(chatMobileFilesArray, setDeleteModal))
                chatMobileUpdateSendBlockSizes()
            }
        } else {
            chatsMessagesSendBlockFilesPreview.innerHTML = ""
            chatsMessagesSendBlockFilesPreview.insertAdjacentElement("beforeend", mobileInfoMaterialsGetBlock(chatMobileFilesArray, setDeleteModal))
            chatMobileUpdateSendBlockSizes()
        }
    }

    chatsMessagesSendBlockAttachmentButton.addEventListener("click", function () {
        chatsMessagesSendBlockAttachmentInput.click()
    })
    chatsMessagesSendBlockAttachmentInput.addEventListener("input", function () {
        Array.from(chatsMessagesSendBlockAttachmentInput.files).forEach((file) => {
            const fileType = universalFileValidator(file)
            if (!fileType){
                showErrorToast("Такой тип файла не поддерживается")
                return null
            }
            updateFilesBlock(file, fileType)
        })
    })
}

function chatMobileUpdateSendBlockSizes(){
    chatsMessagesSendBlockTextArea.style.height = "31px"
    const scrollHeight = chatsMessagesSendBlockTextArea.scrollHeight
    const filesPreviewScrollHeight = chatsMessagesSendBlockFilesPreview.scrollHeight
    chatsMessagesSendPlaceHolder.style.height = `${scrollHeight + filesPreviewScrollHeight + 15}px`
    chatsMessagesSendBlockTextArea.style.height = `${scrollHeight}px`
    if (chatMobileSendBlockLastSize !== scrollHeight + filesPreviewScrollHeight){
        if ((scrollHeight + filesPreviewScrollHeight) > chatMobileSendBlockLastSize){
            window.scrollTo(0, document.body.scrollHeight)
        }
        chatMobileSendBlockLastSize = scrollHeight + filesPreviewScrollHeight
    }
}

function chatMobileGetUsers(query=null){
    chatAPIGetChats(chatMobileFromUser, query).then(request => {
        switch (request.status){
            case 200:
                chatUsersShowUsers(request.response)
                break
            default:
                showErrorToast("Не удалось загрузить список пользователей")
                break
        }
    })
}

function chatUsersShowUsers(users = []){
    function getElement(user){
        const a = document.createElement("a")
        a.href = "#"
        a.classList.add("list-group-item", "my-1")
        a.addEventListener("click", function (){
            chatMobileSelectUser(
                user.id, user.usertype
            )
        })

        const infoDiv = document.createElement("div")
        infoDiv.classList.add("d-flex", "pb-1")
        a.insertAdjacentElement("beforeend", infoDiv)

        const infoDivPhoto = document.createElement("img")
        infoDivPhoto.classList.add("chats-mobile-user-profile-photo", "me-2")
        infoDivPhoto.alt = "Фото профиля"
        infoDivPhoto.src = user.photo
        infoDiv.insertAdjacentElement("beforeend", infoDivPhoto)

        const infoDivDataDiv = document.createElement("div")
        infoDivDataDiv.classList.add("w-100")
        infoDiv.insertAdjacentElement("beforeend", infoDivDataDiv)

        const infoDivData = document.createElement("div")
        infoDivData.classList.add("d-flex", "justify-content-between",
            "align-items-center", "mb-1")
        infoDivDataDiv.insertAdjacentElement("beforeend", infoDivData)

        const infoDivDataName = document.createElement("div")
        infoDivDataName.classList.add("chats-mobile-user-name")
        infoDivDataName.innerHTML = user.name
        infoDivData.insertAdjacentElement("beforeend", infoDivDataName)

        const infoDivDataDate = document.createElement("small")
        infoDivDataDate.classList.add("chats-mobile-user-data")
        infoDivDataDate.innerHTML = user.last_message_date ? timeUtilsDateTimeToStr(user.last_message_date) : ""
        infoDivData.insertAdjacentElement("beforeend", infoDivDataDate)

        const infoDivLastMessageText = document.createElement("p")
        infoDivLastMessageText.classList.add("m-0")
        infoDivLastMessageText.innerHTML = user.last_message_text ? user.last_message_text : "Сообщений нет"
        a.insertAdjacentElement("beforeend", infoDivLastMessageText)

        return a
    }

    chatsMobileUsersSelectOffcanvasList.innerHTML = ""
    users.forEach(user => {
        chatsMobileUsersSelectOffcanvasList.insertAdjacentElement(
            "beforeend", getElement(user)
        )
    })
}

function chatMobileSelectUser(userID, userType=0){
    chatMobileSelectedUserID = userID
    chatMobileSelectedUserType = userType
    bsChatsMobileUsersSelectOffcanvas.hide()
    chatAPIGetMessages(chatMobileSelectedUserID, chatMobileSelectedUserType,
        chatMobileFromUser).then(request => {
        switch (request.status){
            case 200:
                chatsMobileCurrentUser.innerHTML = request.response.username
                if (chatMobileFromUser){
                    chatsMessagesSendPlaceHolder.classList.add("d-none")
                    chatsMessagesSendBlock.classList.add("d-none")
                } else {
                    chatsMessagesSendPlaceHolder.classList.remove("d-none")
                    chatsMessagesSendBlock.classList.remove("d-none")
                }
                chatMobileShowMessages(request.response.messages)
                break
            default:
                showErrorToast("Не удалось загрузить сообщения")
                break
        }
    })
}

function chatMobileShowMessages(messages = [], newMessage=false){
    function getMessageElement(message){
        const messageMainBlock = document.createElement("div")
        messageMainBlock.classList.add("mb-1")

        const messageBlock = document.createElement("div")
        messageBlock.classList.add("m-0")
        messageMainBlock.insertAdjacentElement("beforeend", messageBlock)

        const messageText = document.createElement("p")
        messageText.innerHTML = chatUtilsPrepareMessage(message.message)
        messageBlock.insertAdjacentElement("beforeend", messageText)

        if (message.files.length > 0){
            messageBlock.insertAdjacentElement("beforeend", mobileInfoMaterialsGetBlock(
                message.files.map(file => {
                    return {
                        type: file.type,
                        file: file.path
                    }
                }))
            )
        }

        const messageDataDiv = document.createElement("div")
        messageDataDiv.classList.add("d-flex", "justify-content-end", "align-items-center")
        messageBlock.insertAdjacentElement("beforeend", messageDataDiv)

        switch (message.role){
            case "s":
                messageMainBlock.classList.add("chats-mobile-message-block-sender")
                messageBlock.classList.add("chats-mobile-message-sender")
                const messageReadStatus = document.createElement("i")
                messageReadStatus.classList.add("chats-mobile-message-data", "fw-bold", "me-1")
                if (message.read){
                    messageReadStatus.classList.add("bi", "bi-check2-all")
                    messageReadStatus.style.color = "blue"
                } else {
                    messageReadStatus.classList.add("bi", "bi-check2")
                }
                messageDataDiv.insertAdjacentElement("beforeend", messageReadStatus)
                break
            case "r":
                if (chatMobileSelectedUserType === 2){
                    const userDiv = document.createElement("div")
                    userDiv.innerHTML = `${message.sender.first_name} ${message.sender.last_name}`
                    userDiv.classList.add("chats-mobile-message-block-username")
                    messageBlock.insertAdjacentElement("afterbegin", userDiv)
                }
                messageMainBlock.classList.add("chats-mobile-message-block-receiver")
                messageBlock.classList.add("chats-mobile-message-receiver")
                break
        }

        const messageSendDate = document.createElement("span")
        messageSendDate.classList.add("chats-mobile-message-data")
        messageSendDate.innerHTML = timeUtilsDateTimeToStr(message.date)
        messageDataDiv.insertAdjacentElement("beforeend", messageSendDate)

        return messageMainBlock
    }

    if (!newMessage){
        chatsMobileMessagesBlock.innerHTML = ""
    }
    messages.forEach(message => {
        chatsMobileMessagesBlock.insertAdjacentElement(
            newMessage ? "beforeend" : "afterbegin",
            getMessageElement(message)
        )
    })
    chatMobileUpdateSendBlockSizes()
    window.scrollTo(0, document.body.scrollHeight)
}

function chatMobileSendMessage(){
    function validateAndGetFormData(){
        const fd = new FormData()
        let fullLength = 0
        let validationStatus = true

        chatsMessagesSendBlockTextArea.classList.remove("is-invalid")
        chatsMessagesSendBlockError.innerHTML = ""
        let value = chatsMessagesSendBlockTextArea.value.trim()
        value = value.replace("\n", "<br>")
        if (value.length > 2000){
            chatsMessagesSendBlockTextArea.classList.add("is-invalid")
            chatsMessagesSendBlockError.innerHTML = "Длина поля не может превышать 3800 символов"
            validationStatus = false
        }
        if (value !== ""){
            fd.append("message", value)
            fullLength++
        }
        chatMobileFilesArray.forEach(file => {
            fd.append("attachments", file.fileForm, file.fileForm.name)
            fullLength++
        })
        if (!fullLength){
            chatsMessagesSendBlockTextArea.classList.add("is-invalid")
            chatsMessagesSendBlockError.innerHTML = "Необходимо написать сообщение или добавить материал"
            validationStatus = false
        }
        fd.append("usertype", chatMobileSelectedUserType)
        return validationStatus ? fd : null
    }

    const formData = validateAndGetFormData()
    if (!formData){
        return null
    }
    chatAPISendMessage(chatMobileSelectedUserID, formData).then(request => {
        switch (request.status){
            case 201:
                console.log(request.response)
                chatMobileFilesArray.length = 0
                chatsMessagesSendBlockTextArea.value = ""
                chatsMessagesSendBlockAttachmentInput.value = ""
                chatsMessagesSendBlockFilesPreview.innerHTML = ""
                chatMobileShowMessages([request.response], true)
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

//Variables
let chatMobileFromUser = null
let chatMobileSelectedUserID = null
let chatMobileSelectedUserType = null
let chatMobileSendBlockLastSize = 36
const chatMobileFilesArray = []

//UserSelectOffcanvas
const chatsMobileUsersSelectOffcanvas = document.querySelector("#chatsMobileUsersSelectOffcanvas")
const bsChatsMobileUsersSelectOffcanvas = new bootstrap.Offcanvas(chatsMobileUsersSelectOffcanvas)
const chatsMobileUsersSelectOffcanvasSearchField = chatsMobileUsersSelectOffcanvas.querySelector("#chatsMobileUsersSelectOffcanvasSearchField")
const chatsMobileUsersSelectOffcanvasSearchErase = chatsMobileUsersSelectOffcanvas.querySelector("#chatsMobileUsersSelectOffcanvasSearchErase")
const chatsMobileUsersSelectOffcanvasList = chatsMobileUsersSelectOffcanvas.querySelector("#chatsMobileUsersSelectOffcanvasList")
const chatsMobileUsersSelectOffcanvasSelectFromUser = isAdmin ? document.querySelector("#chatsMobileUsersSelectOffcanvasSelectFromUser") : null

const chatsMessagesSendPlaceHolder = document.querySelector("#chatsMessagesSendPlaceHolder")
const chatsMobileCurrentUser = document.querySelector("#chatsMobileCurrentUser")
const chatsMobileMessagesBlock = document.querySelector("#chatsMobileMessagesBlock")
const chatsMessagesSendBlock = document.querySelector("#chatsMessagesSendBlock")
const chatsMessagesSendBlockAttachmentButton = chatsMessagesSendBlock.querySelector("#chatsMessagesSendBlockAttachmentButton")
const chatsMessagesSendBlockTextArea = chatsMessagesSendBlock.querySelector("#chatsMessagesSendBlockTextArea")
const chatsMessagesSendBlockSendButton = chatsMessagesSendBlock.querySelector("#chatsMessagesSendBlockSendButton")
const chatsMessagesSendBlockAttachmentInput = chatsMessagesSendBlock.querySelector("#chatsMessagesSendBlockAttachmentInput")
const chatsMessagesSendBlockError = chatsMessagesSendBlock.querySelector("#chatsMessagesSendBlockError")
const chatsMessagesSendBlockFilesPreview = chatsMessagesSendBlock.querySelector("#chatsMessagesSendBlockFilesPreview")
chatMobileMain()