function chatFromUserMain(){
    chatUsersMAAllUsers.addEventListener("click", chatFromUserSetOffcanvas)
    chatUsersMAFromUserOffcanvasCancel.addEventListener("click", function () {
        bsChatUsersMAFromUserOffcanvas.hide()
        chatUsersMAFromUser = null
        chatUsersMASearchField.placeholder = "Поиск:"
        chatUsersMAGet()
    })
}

function chatFromUserSetOffcanvas(){
    if (!chatFromUserDownloadedUsers){
        usersAPIGetAll("messagesadmin").then(request => {
            switch (request.status){
                case 200:
                    chatFromUserShowUsers(request.response)
                    chatFromUserDownloadedUsers = true
                    break
                default:
                    break
            }
        })
    }
    if (chatUsersMAFromUser){
        chatUsersMAFromUserOffcanvasCancel.classList.remove("d-none")
    } else {
        chatUsersMAFromUserOffcanvasCancel.classList.add("d-none")
    }
    bsChatUsersMAFromUserOffcanvas.show()
}

function chatFromUserShowUsers(users){
    const usersListWithDate = users.filter(function (user) {
        return user.last_message_date !== null
    })
    const usersList = usersListWithDate.sort((a, b) => {
        return new Date(b.last_message_date) - new Date(a.last_message_date)
    })

    usersList.forEach(user => {
        const a = document.createElement("a")
        a.href = "#"
        a.classList.add("list-group-item", "list-group-item-action")
        a.innerHTML = `${user.first_name} ${user.last_name}${user.last_message_date ? (" (" + timeUtilsDateTimeToStr(new Date(user.last_message_date)) + ")") : ""}`
        a.addEventListener("click", function () {
            bsChatUsersMAFromUserOffcanvas.hide()
            chatUsersMAFromUser = user.id
            chatUsersMASearchField.placeholder = `От ${user.first_name} ${user.last_name}`
            chatUsersMAGet()
        })
        chatUsersMAFromUserOffcanvasList.insertAdjacentElement("beforeend", a)
    })
}

let chatFromUserDownloadedUsers = false

const chatUsersMAFromUserOffcanvas = document.querySelector("#chatUsersMAFromUserOffcanvas")
const bsChatUsersMAFromUserOffcanvas = new bootstrap.Offcanvas(chatUsersMAFromUserOffcanvas)
const chatUsersMAFromUserOffcanvasCancel = chatUsersMAFromUserOffcanvas.querySelector("#chatUsersMAFromUserOffcanvasCancel")
const chatUsersMAFromUserOffcanvasList = chatUsersMAFromUserOffcanvas.querySelector("#chatUsersMAFromUserOffcanvasList")
const chatUsersMAAllUsers = document.querySelector("#chatUsersMAAllUsers")
chatFromUserMain()