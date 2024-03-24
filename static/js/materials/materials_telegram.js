function materialTelegramCheckUser(user){
    if (!user.classList.contains("active")){
        user.classList.add("active")
        telegramUserCheckedSet.push(user.attributes.getNamedItem("data-user-id").value)
    } else {
        user.classList.remove("active")
        telegramUserCheckedSet.splice(telegramUserCheckedSet.indexOf(user.attributes.getNamedItem("data-user-id").value))
    }
    materialsModalTelegramSendButton.innerHTML = `Отправить (${telegramUserCheckedSet.length})`
    materialsModalTelegramSendButton.disabled = telegramUserCheckedSet.length === 0
}

function resetMaterialTelegramModal(){
    telegramUsersSet = []
    telegramUserCheckedSet = []
    materialsModalTelegramSendButton.attributes.getNamedItem("data-confirmed").value = 'false'
    materialsModalTelegramSendButton.classList.add("btn-warning")
    materialsModalTelegramSendButton.classList.remove("btn-primary")
    materialsModalTelegramSendButton.innerHTML = "Отправить (0)"
}

async function sendMaterialTelegram(list = telegramUserCheckedSet){
    const response = await fetch("/api/v1/telegram/sendmaterial/", {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            users: list,
            mat_id: material_id
        })
    })
    if (response.status === 200){
        bsModalTelegram.hide()
        showToast("Отправка", "Материал успешно отправлен")
    } else {
        bsModalTelegram.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

async function materialsTelegramMain(){
    resetMaterialTelegramModal()
    telegramUsersSet = await getTelegramUsers()
    if (telegramUsersSet !== 'error'){
        bsModalTelegram.show()
        showMaterialsTelegramUsers()
    } else {
        showToast("На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

function showMaterialsTelegramUsers(list = telegramUsersSet){
    materialsModalTelegramList.innerHTML = ''
    list.map(function (user) {
        if (user.self_tg){
            materialsModalTelegramSelfSendButton.disabled = false
            materialsModalTelegramSelfSendButton.attributes
                .getNamedItem("data-user-id").value = user.id
        } else {
            if (telegramUserCheckedSet.includes(String(user.id))) {
                materialsModalTelegramList.insertAdjacentHTML('beforeend', `
                <a href="#" class="list-group-item list-group-item-action active" data-user-id="${user.id}">${user.first_name} ${user.last_name}</a>
                `)
            } else {
                materialsModalTelegramList.insertAdjacentHTML('beforeend', `
                <a href="#" class="list-group-item list-group-item-action" data-user-id="${user.id}">${user.first_name} ${user.last_name}</a>
                `)
            }

        }
    })
    materialsModalTelegramList.querySelectorAll(".list-group-item").forEach(user => {
        user.addEventListener("click", function () {
            materialTelegramCheckUser(user)
        })
    })
}

function filterMaterialsTelegramUsers(user){
    const query = new RegExp(materialsModalTelegramSearchField.value.toLowerCase())
    return query.test(`${user.first_name.toLowerCase()} ${user.last_name.toLowerCase()}`)
}

function searchMaterialsTelegramUsers(){
    if (materialsModalTelegramSearchField.value !== ""){
        let result = telegramUsersSet.filter(u => filterMaterialsTelegramUsers(u))
        showMaterialsTelegramUsers(result)
    } else {
        showMaterialsTelegramUsers()
    }
}

const materialModalTelegram = document.querySelector("#MaterialsModalTelegram")
const bsModalTelegram = new bootstrap.Modal(materialModalTelegram)

const materialsModalTelegramList = materialModalTelegram.querySelector("#MaterialsModalTelegramList")
const materialsModalTelegramSendButton = materialModalTelegram.querySelector("#MaterialsModalTelegramSendButton")
const materialsModalTelegramSelfSendButton = materialModalTelegram.querySelector("#MaterialsModalTelegramSelfSendButton")

const materialsModalTelegramSearchField = materialModalTelegram.querySelector("#MaterialsModalTelegramSearchField")
const materialsModalTelegramSearchClean = materialModalTelegram.querySelector("#MaterialsModalTelegramSearchClean")

let telegramUsersSet = []
let telegramUserCheckedSet = []

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
    showMaterialsTelegramUsers()
})

materialsModalTelegramSearchField.addEventListener("input", searchMaterialsTelegramUsers)