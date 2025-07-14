function chatAdminUsersMAMain(){
    chatAdminUsersMAGet()
    chatUsersMASearchListeners()
}

function chatAdminUsersMAGet(){
    chatAPIGetAdminChats(chatAdminUsersFilterSearch).then(request => {
        switch (request.status){
            case 200:
                chatAdminUsersMAShow(request.response)
                break
            default:
                break
        }
    })
}

function chatUsersMASearchListeners(){
    chatAdminUsersMASearchErase.addEventListener("click", function () {
        chatAdminUsersMASearchField.value = ""
        chatAdminUsersFilterSearch = null
        chatAdminUsersMAGet()
    })
    chatAdminUsersMASearchField.addEventListener("input", function () {
        const query = chatAdminUsersMASearchField.value.trim().toLowerCase()
        if (query !== ""){
            chatAdminUsersFilterSearch = query
        } else {
            chatAdminUsersFilterSearch = null
        }
        chatAdminUsersMAGet()
    })
}

function chatAdminUsersMAShow(userlist = []) {
    function getBadge(number) {
        const badge = document.createElement("span")
        badge.classList.add("badge", "bg-primary", "rounded-pill", "ms-1", "mb-1")
        badge.innerHTML = number
        return badge
    }

    function getElement(user) {
        const a = document.createElement("a")
        a.classList.add("list-group-item", "d-flex")
        a.href = `/ma/messages/admin_messages/${user.id}/`
        const avatar = document.createElement("img")
        avatar.classList.add("chats-profile_photo", "me-2")
        avatar.alt = ""
        avatar.src = user.photo
        avatar.style = 'width: 40px; height: 40px; border-radius: 20px;'
        const elem = document.createElement("div")
        elem.classList.add("w-100")
        const elemDiv = document.createElement("div")
        elemDiv.classList.add("d-flex", "w-100", "justify-content-between")
        const elemInfo = document.createElement("div")
        elemInfo.classList.add("d-flex")
        const elemInfoName = document.createElement("h6")
        elemInfoName.classList.add("mb-1")
        elemInfoName.innerHTML = user.note ? `${user.name} [${user.note}]` : user.name
        if (user.unread !== 0) {
            elemInfo.insertAdjacentElement("beforeend", getBadge(user.unread))
        }
        const elemDivDate = document.createElement("small")
        elemDivDate.innerHTML = user.last_message_date ? timeUtilsDateTimeToStr(new Date(user.last_message_date)) :
            "Нет сообщений"
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

    chatAdminUsersMAList.innerHTML = ""
    userlist.forEach(chat => {
        chatAdminUsersMAList.insertAdjacentElement("beforeend", getElement(chat))
    })
}

let chatAdminUsersFilterSearch = null
const chatAdminUsersMASearchField = document.querySelector("#chatAdminUsersMASearchField")
const chatAdminUsersMASearchErase = document.querySelector("#chatAdminUsersMASearchErase")
const chatAdminUsersMAList = document.querySelector("#chatAdminUsersMAList")

chatAdminUsersMAMain()