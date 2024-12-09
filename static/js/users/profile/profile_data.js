async function profileDataMain(){
    profileDataTabLessons.addEventListener('click', async function(){
        await profileDataShowLessons()
    })
    profileDataTabHW.addEventListener('click', async function(){
        await profileDataShowHW()
    })
    await profileDataShowLessons()
}

function profileDataShowLessonsGetHTML(lessons){
    let tableHTML = ""
    lessons.map(lesson => {
        tableHTML += `
        <tr>
            <td><a href="/lessons/${lesson.id}">${lesson.name}</a></td>
            <td> - </td>
            <td>${lesson.date}</td>
        </tr>
        `
    })
    return tableHTML
}

async function profileDataShowLessons(){
    profileDataTabLessons.classList.add("active")
    profileDataTabHW.classList.remove("active")
    await usersAPIGetLessons(userID).then(request => {
        if (request.status === 200){

            profileDataTableHead.innerHTML = "<tr>" +
                "<th>Наименование</th>" +
                "<th>Преподаватель</th>" +
                "<th>Дата</th>" +
                "</tr>"
            profileDataTableBody.innerHTML = profileDataShowLessonsGetHTML(request.response)
        }
    })
}

function profileDataShowHWGetHTML(hwlist){
    let tableHTML = ''
    hwlist.map(hw => {
        tableHTML += `
        <tr>
            <td><a href="/homeworks/${hw.id}">${hw.name}</a></td>
            <td><a href="/profile/${hw.teacher.id}">${hw.teacher.first_name} ${hw.teacher.last_name}</a></td>
            <td>${hw.deadline}</td>
        </tr>
        `
    })
    return tableHTML
}

async function profileDataShowHW(){
    profileDataTabLessons.classList.remove("active")
    profileDataTabHW.classList.add("active")
    await usersAPIGetHW(userID).then(request => {
        if (request.status === 200){
            profileDataTableHead.innerHTML = "<tr>" +
                "<th>Наименование</th>" +
                "<th>Преподаватель</th>" +
                "<th>Срок</th>" +
                "</tr>"
            profileDataTableBody.innerHTML = profileDataShowHWGetHTML(request.response)
        }
    })
}

const profileDataTabLessons = document.querySelector("#ProfileDataTabLessons")
const profileDataTabHW = document.querySelector("#ProfileDataTabHW")
const profileDataTableHead = document.querySelector("#ProfileDataTableHead")
const profileDataTableBody = document.querySelector("#ProfileDataTableBody")

profileDataMain()