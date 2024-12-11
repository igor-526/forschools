function maScheduleSelectMain(){
    maScheduleSelectGetUsers()
    maScheduleSelectFilterListeners()
}

function maScheduleSelectGetUsers(){
    usersAPIGetForSchedule(maScheduleSelectFilterName, maScheduleSelectFilterRole).then(request => {
        switch (request.status){
            case 200:
                maScheduleSelectShowUsers(request.response)
                break
            default:
                break
        }
    })
}

function maScheduleSelectShowUsers(users){
    function getListElement(user){
        const a = document.createElement("a")
        a.classList.add("list-group-item", "list-group-item-action")
        if (user === "me"){
            a.href = "/ma/lessons/schedule/0/"
            a.innerHTML = `Моё расписание`
        } else {
            a.href = `/ma/lessons/schedule/${user.id}/`
            a.innerHTML = `${user.first_name} ${user.last_name}`
        }
        return a
    }

    scheduleUsersList.innerHTML = ""
    if (maScheduleMe){
        scheduleUsersList.insertAdjacentElement("beforeend", getListElement("me"))
    }
    users.forEach(user => {
        scheduleUsersList.insertAdjacentElement("beforeend", getListElement(user))
    })
}

function maScheduleSelectFilterListeners(){
    scheduleFilterName.addEventListener("input", function () {
        if (scheduleFilterName.value.trim() !== ""){
            maScheduleSelectFilterName = scheduleFilterName.value.trim()
        } else {
            maScheduleSelectFilterName = null
        }
        maScheduleSelectGetUsers()

    })
    scheduleFilterRole.addEventListener("change", function () {
        maScheduleSelectFilterRole = scheduleFilterRole.value
        maScheduleSelectGetUsers()
    })
}

let maScheduleSelectFilterName = null
let maScheduleSelectFilterRole = null

const scheduleFilterName = document.querySelector("#maScheduleFilterName")
const scheduleFilterRole = document.querySelector("#maScheduleFilterRole")
const scheduleUsersList = document.querySelector("#maScheduleUsersList")


maScheduleSelectMain()