function chatsFromUserMain(){
    chatsFromUserSearchListeners()
    usersAPIGetAll().then(request => {
        switch (request.status){
            case 200:
                chatsFromUserSetUsers(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
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
            chatsFromUserSelectListener(user.id)
        })
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
    chatAPIGetChats(userID).then(request => {
        switch (request.status) {
            case 200:
                fromUserID = userID
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

chatsFromUserMain()