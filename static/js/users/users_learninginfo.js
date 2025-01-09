function usersLearnInfoMain(){
    usersLearningInfoModalTabPlans.addEventListener("click", function () {
        usersLearnInfoResetModal()
        usersLearnInfoSetPlans()
    })
    usersLearningInfoModalTabLessons.addEventListener("click", function () {
        usersLearnInfoResetModal()
        usersLearnInfoSetLessons()
    })
    usersLearningInfoModalTabHomeworks.addEventListener("click", function () {
        usersLearnInfoResetModal()
        usersLearnInfoSetHomeworks()
    })
}

function usersLearnInfoResetModal(){
    usersLearningInfoModalTabLessons.classList.remove("active")
    usersLearningInfoModalTabHomeworks.classList.remove("active")
    usersLearningInfoModalTabPlans.classList.remove("active")
    usersLearningInfoModalTableHead.innerHTML = ""
    usersLearningInfoModalTableBody.innerHTML = ""
}

function usersLearnInfoSetModal(userID, role){
    usersLearningInfoModalCurrentUserID = userID
    usersLearningInfoModalCurrentUserRole = role
    usersLearnInfoResetModal()
    bsUsersLearningInfoModal.show()
    usersLearnInfoSetLessons()
}

function getUsersHTML(users = []){
    let usersHTML = []
    users.forEach(user => {
        usersHTML.push(`<a target="_blank" href="/profile/${user.id}">${user.first_name} ${user.last_name}</a>`)
    })
    return usersHTML.join("<br>")
}

function usersLearnInfoSetPlans(){
    function changeElements(){
        usersLearningInfoModalTabPlans.classList.add("active")
        usersLearningInfoModalAddButton.innerHTML = '<i class="bi bi-plus-lg"></i>  план обучения'
        switch (usersLearningInfoModalCurrentUserRole){
            case "Teacher":
                usersLearningInfoModalAddA.href = `/learning_plans/#teacher=${usersLearningInfoModalCurrentUserID}&new=true`
                usersLearningInfoModalFilterA.href = `/learning_plans/#teacher=${usersLearningInfoModalCurrentUserID}`
                break
            case "Listener":
                usersLearningInfoModalAddA.href = `/learning_plans/#listener=${usersLearningInfoModalCurrentUserID}&new=true`
                usersLearningInfoModalFilterA.href = `/learning_plans/#listener=${usersLearningInfoModalCurrentUserID}`
                break
        }
        usersLearningInfoModalTableHead.innerHTML = `
            <tr>
                <th scope="col">Наименование</th>
                <th scope="col">Преподаватель</th>
                <th scope="col">Ученики</th>
            </tr>`
        usersLearningInfoModalTableBody.innerHTML = ""
    }

    function getElement(plan){
        const tr = document.createElement("tr")
        const tdName = document.createElement("td")
        const tdTeacher = document.createElement("td")
        const tdListeners = document.createElement("td")
        tdName.innerHTML = `<a target="_blank" href="/learning_plans/${plan.id}">${plan.name}</a>`
        tdTeacher.innerHTML = getUsersHTML([plan.teacher])
        tdListeners.innerHTML = getUsersHTML(plan.listeners)
        tr.insertAdjacentElement("beforeend", tdName)
        tr.insertAdjacentElement("beforeend", tdTeacher)
        tr.insertAdjacentElement("beforeend", tdListeners)
        return tr
    }

    function show(plans){
        plans.forEach(plan => {
            usersLearningInfoModalTableBody.insertAdjacentElement("beforeend", getElement(plan))
        })
    }

    changeElements()
    switch (usersLearningInfoModalCurrentUserRole){
        case "Teacher":
            plansAPIGet(null, null, null, [usersLearningInfoModalCurrentUserID], []).then(request => {
                switch (request.status){
                    case 200:
                        show(request.response)
                        break
                    default:
                        break
                }
            })
            break
        case "Listener":
            plansAPIGet(null, null, null, [], [usersLearningInfoModalCurrentUserID]).then(request => {
                switch (request.status){
                    case 200:
                        show(request.response)
                        break
                    default:
                        break
                }
            })
            break
    }
}

function usersLearnInfoSetLessons(){
    function changeElements(){
        usersLearningInfoModalTabLessons.classList.add("active")
        usersLearningInfoModalAddButton.innerHTML = '<i class="bi bi-plus-lg"></i>  план обучения'
        switch (usersLearningInfoModalCurrentUserRole){
            case "Teacher":
                usersLearningInfoModalAddA.href = `/learning_plans/#teacher=${usersLearningInfoModalCurrentUserID}&new=true`
                usersLearningInfoModalFilterA.href = `/lessons/#teacher=${usersLearningInfoModalCurrentUserID}`
                break
            case "Listener":
                usersLearningInfoModalAddA.href = `/learning_plans/#listener=${usersLearningInfoModalCurrentUserID}&new=true`
                usersLearningInfoModalFilterA.href = `/lessons/#listener=${usersLearningInfoModalCurrentUserID}`
                break
        }
        usersLearningInfoModalTableHead.innerHTML = `
            <tr>
                <th scope="col">Наименование</th>
                <th scope="col">Дата и время</th>
                <th scope="col">Преподаватель</th>
                <th scope="col">Ученики</th>
            </tr>`
        usersLearningInfoModalTableBody.innerHTML = ""
    }

    function getElement(lesson){
        const tr = document.createElement("tr")
        switch (lesson.status){
            case 1:
                tr.classList.add("table-success")
                break
            case 2:
                tr.classList.add("table-danger")
                break
        }
        const tdName = document.createElement("td")
        tdName.innerHTML = `<a href="/lessons/${lesson.id}" target="_blank">${lesson.name}</a>`
        const tdDateTime = document.createElement("td")
        tdDateTime.innerHTML = getLessonDateTimeRangeString(lesson)
        const tdTeacher = document.createElement("td")
        tdTeacher.innerHTML = getUsersHTML([lesson.teacher])
        const tdListeners = document.createElement("td")
        tdListeners.innerHTML = getUsersHTML(lesson.listeners)
        tr.insertAdjacentElement("beforeend", tdName)
        tr.insertAdjacentElement("beforeend", tdDateTime)
        tr.insertAdjacentElement("beforeend", tdTeacher)
        tr.insertAdjacentElement("beforeend", tdListeners)
        return tr
    }

    function show(lessons){
        lessons.forEach(lesson => {
            usersLearningInfoModalTableBody.insertAdjacentElement("beforeend", getElement(lesson))
        })
    }

    changeElements()
    switch (usersLearningInfoModalCurrentUserRole){
        case "Teacher":
            lessonsAPIGetAll(0, 0, [usersLearningInfoModalCurrentUserID], [], null, null).then(request => {
                switch (request.status){
                    case 200:
                        show(request.response)
                        break
                    default:
                        break
                }
            })
            break
        case "Listener":
            lessonsAPIGetAll(0, 0, [], [usersLearningInfoModalCurrentUserID], null, null).then(request => {
                switch (request.status){
                    case 200:
                        show(request.response)
                        break
                    default:
                        break
                }
            })
            break
    }
}

function usersLearnInfoSetHomeworks(){
    function changeElements(){
        usersLearningInfoModalTabHomeworks.classList.add("active")
        usersLearningInfoModalAddButton.innerHTML = '<i class="bi bi-plus-lg"></i> домашнее задание'
        switch (usersLearningInfoModalCurrentUserRole){
            case "Teacher":
                usersLearningInfoModalAddA.href = `/homeworks/#teacher=${usersLearningInfoModalCurrentUserID}&new=true`
                usersLearningInfoModalFilterA.href = `/homeworks/#teacher=${usersLearningInfoModalCurrentUserID}`
                break
            case "Listener":
                usersLearningInfoModalAddA.href = `/homeworks/#listener=${usersLearningInfoModalCurrentUserID}&new=true`
                usersLearningInfoModalFilterA.href = `/homeworks/#listener=${usersLearningInfoModalCurrentUserID}`
                break
        }
        usersLearningInfoModalTableHead.innerHTML = `
            <tr>
                <th scope="col">Наименование</th>
                <th scope="col">Преподаватель</th>
                <th scope="col">Ученик</th>
                <th scope="col">Посл. изменение</th>
            </tr>`
        usersLearningInfoModalTableBody.innerHTML = ""
    }

    function getElement(hw){
        const tr = document.createElement("tr")
        const tdName = document.createElement("td")
        tdName.innerHTML = `<a href="/homeworks/${hw.id}" target="_blank">${hw.name}</a>`
        const tdTeacher = document.createElement("td")
        tdTeacher.innerHTML = getUsersHTML([hw.teacher])
        const tdListener = document.createElement("td")
        tdListener.innerHTML = getUsersHTML([hw.listener])
        const tdLastChanged = document.createElement("td")
        tdLastChanged.innerHTML = new Date(hw.status.dt).toLocaleDateString()
        tr.insertAdjacentElement("beforeend", tdName)
        tr.insertAdjacentElement("beforeend", tdTeacher)
        tr.insertAdjacentElement("beforeend", tdListener)
        tr.insertAdjacentElement("beforeend", tdLastChanged)
        return tr
    }

    function show(homeworks){
        homeworks.forEach(homework => {
            usersLearningInfoModalTableBody.insertAdjacentElement("beforeend", getElement(homework))
        })
    }

    changeElements()
    switch (usersLearningInfoModalCurrentUserRole){
        case "Teacher":
            homeworkAPIGet(null, null, null, [usersLearningInfoModalCurrentUserID],
                [], null, null).then(request => {
                switch (request.status){
                    case 200:
                        show(request.response)
                        break
                    default:
                        break
                }
            })
            break
        case "Listener":
            homeworkAPIGet(null, null, null, [], [usersLearningInfoModalCurrentUserID],
                null, null).then(request => {
                switch (request.status){
                    case 200:
                        show(request.response)
                        break
                    default:
                        break
                }
            })
            break
    }

}


let usersLearningInfoModalCurrentUserID = null
let usersLearningInfoModalCurrentUserRole = null
const usersLearningInfoModal = document.querySelector("#usersLearningInfoModal")
const bsUsersLearningInfoModal = new bootstrap.Modal(usersLearningInfoModal)
const usersLearningInfoModalTabPlans = usersLearningInfoModal.querySelector("#usersLearningInfoModalTabPlans")
const usersLearningInfoModalTabLessons = usersLearningInfoModal.querySelector("#usersLearningInfoModalTabLessons")
const usersLearningInfoModalTabHomeworks = usersLearningInfoModal.querySelector("#usersLearningInfoModalTabHomeworks")
const usersLearningInfoModalAddButton = usersLearningInfoModal.querySelector("#usersLearningInfoModalAddButton")
const usersLearningInfoModalAddA = usersLearningInfoModal.querySelector("#usersLearningInfoModalAddA")
const usersLearningInfoModalFilterA = usersLearningInfoModal.querySelector("#usersLearningInfoModalFilterA")
const usersLearningInfoModalTableHead = usersLearningInfoModal.querySelector("#usersLearningInfoModalTableHead")
const usersLearningInfoModalTableBody = usersLearningInfoModal.querySelector("#usersLearningInfoModalTableBody")

usersLearnInfoMain()