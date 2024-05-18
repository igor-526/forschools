function materialsTelegramMain(){
    telegramAPIGetUsers().then(request => {
        switch (request.status){
            case 200:
                materialsTelegramUsersShow(request.response)
                break
            default:
                showErrorToast()
        }
    })
    materialsModalTelegramSendButton.addEventListener("click", function () {
        const status = this.attributes.getNamedItem("data-confirmed").value
        if (status === "false"){
            this.attributes.getNamedItem("data-confirmed").value = 'true'
            this.classList.remove("btn-warning")
            this.classList.add("btn-primary")
        } else if (status === "true"){
            sendMaterialTelegram()
        }
    })
    materialsModalTelegramSelfSendButton.addEventListener("click", function () {
        sendMaterialTelegram([user_id])
    })
    materialsModalTelegramSearchClean.addEventListener("click", function () {
        materialsModalTelegramSearchField.value = ""
        materialsTelegramUsersShow()
    })
    materialsModalTelegramSearchField.addEventListener("input", materialsTelegramSearchUsers)
}

function materialsTelegramUsersShow(list){
    materialsModalTelegramList.innerHTML = ''
    list.forEach(function (user) {
        if (user.self_tg){
            materialsModalTelegramSelfSendButton.disabled = false
            materialsModalTelegramSelfSendButton.attributes
                .getNamedItem("data-user-id").value = user.id
        } else {
            const usr = document.createElement("a")
            usr.classList.add("list-group-item", "list-group-item-action")
            usr.innerHTML = `${user.first_name} ${user.last_name}`
            usr.setAttribute("data-user-id", user.id)
            if (materialTelegramSelectedUsersArray.includes(user.id)){
                usr.classList.add("active")
            }
            usr.addEventListener("click", materialsTelegramSelectUser)
            materialsModalTelegramList.insertAdjacentElement("beforeend", usr)
        }
    })
}

function materialsTelegramSet(matID = []) {
    materialsTelegramMatArray = matID
    bsMaterialModalTelegram.show()
    materialsTelegramResetModal()
}

function materialsTelegramResetModal(){
    telegramUsersSet = []
    materialTelegramSelectedUsersArray = []
    materialsModalTelegramSendButton.attributes.getNamedItem("data-confirmed").value = 'false'
    materialsModalTelegramSendButton.classList.add("btn-warning")
    materialsModalTelegramSendButton.classList.remove("btn-primary")
    materialsModalTelegramSendButton.innerHTML = "Отправить (0)"
}

function materialsTelegramSelectUser(){
    const userID = Number(this.attributes.getNamedItem("data-user-id").value)
    const index = materialTelegramSelectedUsersArray.indexOf(userID)
    switch (index){
        case -1:
            materialTelegramSelectedUsersArray.push(userID)
            this.classList.add("active")
            break
        default:
            materialTelegramSelectedUsersArray.splice(index, 1)
            this.classList.remove("active")
            break
    }
    materialsModalTelegramSendButton.innerHTML = `Отправить (${materialTelegramSelectedUsersArray.length})`
    materialsModalTelegramSendButton.disabled = materialTelegramSelectedUsersArray.length === 0
}

function materialsTelegramSearchUsers(){
    const query = new RegExp(materialsModalTelegramSearchField.value.trim().toLowerCase())
    materialsModalTelegramList.querySelectorAll("a").forEach(element => {
        query.test(element.innerHTML.toLowerCase())? element.classList.remove("d-none") : element.classList.add("d-none")
    })
}

function sendMaterialTelegram(){
    telegramAPISendMaterials(materialTelegramSelectedUsersArray, materialsTelegramMatArray).then(request => {
        switch (request.status) {
            case 200:
                showSuccessToast("Материал успешно отправлен")
                break
            default:
                showErrorToast()
        }
        bsMaterialModalTelegram.hide()
    })
}

const materialModalTelegram = document.querySelector("#MaterialsModalTelegram")
const bsMaterialModalTelegram = new bootstrap.Modal(materialModalTelegram)

const materialsModalTelegramList = materialModalTelegram.querySelector("#MaterialsModalTelegramList")
const materialsModalTelegramSendButton = materialModalTelegram.querySelector("#MaterialsModalTelegramSendButton")
const materialsModalTelegramSelfSendButton = materialModalTelegram.querySelector("#MaterialsModalTelegramSelfSendButton")

const materialsModalTelegramSearchField = materialModalTelegram.querySelector("#MaterialsModalTelegramSearchField")
const materialsModalTelegramSearchClean = materialModalTelegram.querySelector("#MaterialsModalTelegramSearchClean")

let materialTelegramSelectedUsersArray = []
let materialsTelegramMatArray = []