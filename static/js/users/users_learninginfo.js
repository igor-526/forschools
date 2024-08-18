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

function usersLearnInfoGetAddButton(action, role, userID){
    const btnA = document.createElement("a")
    const btn = document.createElement("button")
    btnA.insertAdjacentElement("beforeend", btn)
    btnA.target = "_blank"
    btn.type = "button"
    btn.classList.add("btn", "btn-primary")
    switch (action){
        case "plan":
            btn.innerHTML = "Новый план обучения"
            btnA.href = "/learning_plans/#new"
            break
        case "hw":
            btn.innerHTML = "Новое ДЗ"
            btnA.href = "/homeworks/#new"
            break
    }
    switch (role){
        case "teacher":
            btnA.href += `#teacher=${userID}`
            break
        case "listener":
            btnA.href += `#listener=${userID}`
            break
    }
    return btnA
}

function usersLearnInfoResetModal(){
    usersLearningInfoModalTabLessons.classList.remove("active")
    usersLearningInfoModalTabHomeworks.classList.remove("active")
    usersLearningInfoModalTabPlans.classList.remove("active")
    usersLearningInfoModalTableHead.innerHTML = ""
    usersLearningInfoModalTableBody.innerHTML = ""
}

function usersLearnInfoSetModal(userID){
    usersLearningInfoModalCurrentUser = userID
    usersLearnInfoResetModal()
    bsUsersLearningInfoModal.show()
    usersLearnInfoSetLessons()
}

function usersLearnInfoSetPlans(userID){
    usersLearningInfoModalTabPlans.classList.add("active")
    usersLearningInfoModalTableHead.innerHTML = `
        <tr>
            <th scope="col">Наименование</th>
            <th scope="col">Преподаватель</th>
            <th scope="col">Ученики</th>
        </tr>
    `
}

function usersLearnInfoSetLessons(){
    function getListenersHTML(listeners){
        const l = listeners.map(listener => {
            return `<a href="/profile/${listener.id}" target="_blank">${listener.first_name} ${listener.last_name}</a>`
        })
        return l.join("<br>")
    }

    function getElement(lesson){
        const tr = document.createElement("tr")
        const tdName = document.createElement("td")
        tdName.innerHTML = `<a href="/lessons/${lesson.id}" target="_blank">${lesson.name}</a>`
        const tdDateTime = document.createElement("td")
        const tdTeacher = document.createElement("td")
        tdTeacher.innerHTML = `<a href="/profile/${lesson.teacher.id}" target="_blank">${lesson.teacher.first_name} ${lesson.teacher.last_name}</a>`
        const tdListeners = document.createElement("td")
        tdListeners.innerHTML = getListenersHTML(lesson.listeners)
        tr.insertAdjacentElement("beforeend", tdName)
        tr.insertAdjacentElement("beforeend", tdDateTime)
        tr.insertAdjacentElement("beforeend", tdTeacher)
        tr.insertAdjacentElement("beforeend", tdListeners)
        return tr
    }

    usersLearningInfoModalTabLessons.classList.add("active")
    usersLearningInfoModalTableHead.innerHTML = `
        <tr>
            <th scope="col">Наименование</th>
            <th scope="col">Дата и время</th>
            <th scope="col">Преподаватель</th>
            <th scope="col">Ученики</th>
        </tr>
    `
    lessonsAPIGetAll(0, [], [], null, null, usersLearningInfoModalCurrentUser).then(request => {
        switch (request.status){
            case 200:
                console.log(request.response)
                usersLearningInfoModalTableBody.insertAdjacentElement("beforeend", usersLearnInfoGetAddButton("plan",
                    "listener", usersLearningInfoModalCurrentUser))
                request.response.forEach(lesson => {
                    usersLearningInfoModalTableBody.insertAdjacentElement("beforeend", getElement(lesson))
                })
                break
            default:
                break
        }
    })
}

function usersLearnInfoSetHomeworks(){
    usersLearningInfoModalTabHomeworks.classList.add("active")
    usersLearningInfoModalTableHead.innerHTML = `
        <tr>
            <th scope="col">Наименование</th>
            <th scope="col">Преподаватель</th>
            <th scope="col">Ученик</th>
            <th scope="col">Срок</th>
        </tr>
    `
}


let usersLearningInfoModalCurrentUser = 0
const usersLearningInfoModal = document.querySelector("#usersLearningInfoModal")
const bsUsersLearningInfoModal = new bootstrap.Modal(usersLearningInfoModal)
const usersLearningInfoModalTabPlans = usersLearningInfoModal.querySelector("#usersLearningInfoModalTabPlans")
const usersLearningInfoModalTabLessons = usersLearningInfoModal.querySelector("#usersLearningInfoModalTabLessons")
const usersLearningInfoModalTabHomeworks = usersLearningInfoModal.querySelector("#usersLearningInfoModalTabHomeworks")
const usersLearningInfoModalTableHead = usersLearningInfoModal.querySelector("#usersLearningInfoModalTableHead")
const usersLearningInfoModalTableBody = usersLearningInfoModal.querySelector("#usersLearningInfoModalTableBody")

usersLearnInfoMain()