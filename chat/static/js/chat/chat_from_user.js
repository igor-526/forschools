function chatsFromUserMain(){
    chatsFromUserSearchListeners()
    usersAPIGetAll("messagesadmin").then(request => {
        switch (request.status){
            case 200:
                const usersListWithDate = request.response.filter(function (user) {
                    return user.last_message_date !== null
                })
                const usersList = usersListWithDate.sort((a, b) => {
                    return new Date(b.last_message_date) - new Date(a.last_message_date)
                })
                chatsFromUserSetUsers(usersList)
                break
            default:
                showErrorToast()
                break
        }
    })
    chatsFromUserCancelButton.addEventListener("click", chatsFromUserResetListener)
}

function chatsFromUserSetUsers(usersList){
    function getElement(user){
        const li = document.createElement("li")
        const a = document.createElement("a")
        li.insertAdjacentElement("beforeend", a)
        a.href = "#"
        a.classList.add("dropdown-item")
        a.innerHTML = `${user.first_name} ${user.last_name}`
        li.addEventListener("click", function () {
            chatsFromUserListButton.innerHTML = `${user.first_name} ${user.last_name}`
            chatsFromUserSelectListener(user.id)
        })
        if (user.last_message_date){
            a.innerHTML += ` (${timeUtilsDateTimeToStr(user.last_message_date)})`
        }
        return li
    }

    usersList.forEach(usr => {
        chatsFromUserList.insertAdjacentElement("beforeend", getElement(usr))
    })
}

function chatsFromUserSearchListeners(){
    chatsFromUserSearchFieldErase.addEventListener("click", function (){
        chatsFromUserSearchField.value = ""
        chatsFromUserList.querySelectorAll("li").forEach(elem => {
            elem.classList.remove("d-none")
        })
    })
    chatsFromUserSearchField.addEventListener("input", function () {
        const query = new RegExp(chatsFromUserSearchField.value.trim().toLowerCase())
        chatsFromUserList.querySelectorAll("a").forEach(elem => {
            query.test(elem.innerHTML.trim().toLowerCase())?elem.parentElement.classList.remove("d-none"):elem.parentElement.classList.add("d-none")
        })
    })
}

function chatsFromUserSelectListener(userID){
    chatAPIGetChats(userID, chatUsersSearch).then(request => {
        switch (request.status) {
            case 200:
                chatMessagesFromUserID = userID
                chatsFromUserCancelButton.disabled = false
                chatShowUsers(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function chatsFromUserResetListener(){
    chatAPIGetChats().then(request => {
        switch (request.status) {
            case 200:
                chatMessagesFromUserID = null
                chatsFromUserCancelButton.disabled = true
                chatsFromUserListButton.innerHTML = "Выбрать пользователя"
                chatShowUsers(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
}

const chatsFromUserList = document.querySelector("#chatsFromUserList")
const chatsFromUserSearchField = document.querySelector("#chatsFromUserSearchField")
const chatsFromUserSearchFieldErase = document.querySelector("#chatsFromUserSearchFieldErase")
const chatsFromUserCancelButton = document.querySelector("#chatsFromUserCancelButton")
const chatsFromUserListButton = document.querySelector("#chatsFromUserListButton")

chatsFromUserMain()