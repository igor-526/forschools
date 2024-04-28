async function homeworksMain(){
    if (isTeacher){
        await homeworksGetShow("checking")
    } else {
        await homeworksGetShow("doing")
    }
    homeworksTabDoing.addEventListener("click", function () {
        homeworksGetShow("doing")
    })
    homeworksTabChecking.addEventListener("click", function () {
        homeworksGetShow("checking")
    })
    homeworksTabClosed.addEventListener("click", function () {
        homeworksGetShow("closed")
    })
}

async function homeworksGetShow(tab){
    switch (tab) {
        case "doing":
            homeworksTabDoing.classList.add("active")
            homeworksTabChecking.classList.remove("active")
            homeworksTabClosed.classList.remove("active")
            await homeworkAPIGet(1).then(request => {
                if (request.status === 200) {
                    homeworksSet = request.response
                    homeworksShow(homeworksSet)
                }
            })
            break
        case "checking":
            homeworksTabDoing.classList.remove("active")
            homeworksTabChecking.classList.add("active")
            homeworksTabClosed.classList.remove("active")
            await homeworkAPIGet(3)
                .then(request => {
                    if (request.status === 200) {
                        homeworksSet = request.response
                        homeworksShow(homeworksSet)
                    }
                })
            break
        case "closed":
            homeworksTabDoing.classList.remove("active")
            homeworksTabChecking.classList.remove("active")
            homeworksTabClosed.classList.add("active")
            await homeworkAPIGet(4)
                .then(request => {
                    if (request.status === 200) {
                        homeworksSet = request.response
                        homeworksShow(homeworksSet)
                    }
                })
            break
    }
}

function homeworksShow(list = homeworksSet){
    homeworksTableBody.innerHTML = ''
    list.forEach(hw => {
        const deadline = new Date(hw.deadline).toLocaleDateString()
        homeworksTableBody.insertAdjacentHTML("beforeend", `
        <tr>
            <td><a href="/homeworks/${hw.id}">${hw.name}</a></td>
            <td><a href="/profile/${hw.teacher.id}">${hw.teacher.first_name} ${hw.teacher.last_name}</a></td>
            <td><a href="/profile/${hw.listener.id}">${hw.listener.first_name} ${hw.listener.last_name}</a></td>
            <td>${deadline}</td>
        </tr>
        `)
    })
}

//Sets
let homeworksSet = []

//Search
const homeworksCollapseSearchButton = document.querySelector("#HomeworksCollapseSearchButton")
const homeworksCollapseSearch = document.querySelector("#HomeworksCollapseSearch")
const homeworksCollapseSearchForm = homeworksCollapseSearch.querySelector("#HomeworksCollapseSearchForm")

//Tabs
const homeworksTabDoing = document.querySelector("#HomeworksTabDoing")
const homeworksTabChecking = document.querySelector("#HomeworksTabChecking")
const homeworksTabClosed = document.querySelector("#HomeworksTabClosed")

//Table
const homeworksTableBody = document.querySelector("#HomeworksTableBody")

homeworksMain()