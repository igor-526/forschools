function maScheduleMain(){
    maScheduleGet()
    maScheduleButtonsListeners()
}

function maScheduleGet(){
    lessonsAPIGetSchedule(maScheduleSelectedUser, maScheduleCurrentOffset).then(request => {
        switch (request.status){
            case 200:
                maScheduleCurrent.innerHTML = request.response.week_text
                if (request.response.count === 0){
                    maScheduleAccordion.classList.add("d-none")
                    maScheduleAlert.classList.remove("d-none")
                } else {
                    maScheduleAccordion.classList.remove("d-none")
                    maScheduleAlert.classList.add("d-none")
                    maScheduleCurrent.innerHTML += ` (${request.response.count})`
                    maScheduleSetSchedule(request.response.schedule)
                }
                break
            default:
                break
        }
    })
}

function maScheduleResetSchedule(){
    maScheduleMonday.classList.add("d-none")
    maScheduleTuesday.classList.add("d-none")
    maScheduleWednesday.classList.add("d-none")
    maScheduleThursday.classList.add("d-none")
    maScheduleFriday.classList.add("d-none")
    maScheduleSaturday.classList.add("d-none")
    maScheduleSunday.classList.add("d-none")
    maScheduleMondayList.innerHTML = ""
    maScheduleTuesdayList.innerHTML = ""
    maScheduleWednesdayList.innerHTML = ""
    maScheduleThursdayList.innerHTML = ""
    maScheduleFridayList.innerHTML = ""
    maScheduleSaturdayList.innerHTML = ""
    maScheduleSundayList.innerHTML = ""
}

function maScheduleSetSchedule(schedule){
    function getListElement(lesson){
        const li = document.createElement("li")
        li.href = `/ma/lessons/${lesson.id}/`
        li.classList.add("list-group-item", "list-group-item-action")
        li.innerHTML = `<b>${lesson.time}:</b> ${lesson.participants.join(", ")}`
        li.addEventListener("click", () => {
            lessonsAPIGetItem(lesson.id).then(request => {
                switch (request.status){
                    case 200:
                        const lsn_utils = new lessonUtils(request.response)
                        lsn_utils.showOffcanvas(false)
                        break
                    default:
                        const toast = new toastEngine()
                        toast.setError("Не удалось открыть занятие")
                        toast.show()
                        break
                }
            })
        })
        return li
    }

    maScheduleResetSchedule()
    if (schedule.monday.length > 0){
        maScheduleMonday.classList.remove("d-none")
        schedule.monday.forEach(lesson => {
            maScheduleMondayList.insertAdjacentElement("beforeend", getListElement(lesson))
        })
    }
    if (schedule.tuesday.length > 0){
        maScheduleTuesday.classList.remove("d-none")
        schedule.tuesday.forEach(lesson => {
            maScheduleTuesdayList.insertAdjacentElement("beforeend", getListElement(lesson))
        })
    }
    if (schedule.wednesday.length > 0){
        maScheduleWednesday.classList.remove("d-none")
        schedule.wednesday.forEach(lesson => {
            maScheduleWednesdayList.insertAdjacentElement("beforeend", getListElement(lesson))
        })
    }
    if (schedule.thursday.length > 0){
        maScheduleThursday.classList.remove("d-none")
        schedule.thursday.forEach(lesson => {
            maScheduleThursdayList.insertAdjacentElement("beforeend", getListElement(lesson))
        })
    }
    if (schedule.friday.length > 0){
        maScheduleFriday.classList.remove("d-none")
        schedule.friday.forEach(lesson => {
            maScheduleFridayList.insertAdjacentElement("beforeend", getListElement(lesson))
        })
    }
    if (schedule.saturday.length > 0){
        maScheduleSaturday.classList.remove("d-none")
        schedule.saturday.forEach(lesson => {
            maScheduleSaturdayList.insertAdjacentElement("beforeend", getListElement(lesson))
        })
    }
    if (schedule.sunday.length > 0){
        maScheduleSunday.classList.remove("d-none")
        schedule.sunday.forEach(lesson => {
            maScheduleSundayList.insertAdjacentElement("beforeend", getListElement(lesson))
        })
    }

}

function maScheduleButtonsListeners(){
    maSchedulePrevButton.addEventListener("click", function (){
        maScheduleCurrentOffset -= 1
        maScheduleGet()
    })
    maScheduleNextButton.addEventListener("click", function (){
        maScheduleCurrentOffset += 1
        maScheduleGet()
    })
}

let maScheduleCurrentOffset = 0

const maSchedulePrevButton = document.querySelector("#maSchedulePrevButton")
const maScheduleCurrent = document.querySelector("#maScheduleCurrent")
const maScheduleNextButton = document.querySelector("#maScheduleNextButton")
const maScheduleAccordion = document.querySelector("#maScheduleAccordion")
const maScheduleAlert = document.querySelector("#maScheduleAlert")
const maScheduleMonday = document.querySelector("#maScheduleMonday")
const maScheduleMondayList = document.querySelector("#maScheduleMondayList")
const maScheduleTuesday = document.querySelector("#maScheduleTuesday")
const maScheduleTuesdayList = document.querySelector("#maScheduleTuesdayList")
const maScheduleWednesday = document.querySelector("#maScheduleWednesday")
const maScheduleWednesdayList = document.querySelector("#maScheduleWednesdayList")
const maScheduleThursday = document.querySelector("#maScheduleThursday")
const maScheduleThursdayList = document.querySelector("#maScheduleThursdayList")
const maScheduleFriday = document.querySelector("#maScheduleFriday")
const maScheduleFridayList = document.querySelector("#maScheduleFridayList")
const maScheduleSaturday = document.querySelector("#maScheduleSaturday")
const maScheduleSaturdayList = document.querySelector("#maScheduleSaturdayList")
const maScheduleSunday = document.querySelector("#maScheduleSunday")
const maScheduleSundayList = document.querySelector("#maScheduleSundayList")

maScheduleMain()