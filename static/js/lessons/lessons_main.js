function lessonsMain(){
    lessonsSetUpcoming()
    lessonsTabUpcoming.addEventListener("click", lessonsSetUpcoming)
    lessonsTabPassed.addEventListener("click", lessonsSetPassed)
}

function lessonsSetUpcoming(){
    lessonsTabUpcoming.classList.add("active")
    lessonsTabPassed.classList.remove("active")
    lessonsAPIGetAll(0).then(request => {
        switch (request.status){
            case 200:
                lessonsShow(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function lessonsSetPassed(){
    lessonsTabUpcoming.classList.remove("active")
    lessonsTabPassed.classList.add("active")
    lessonsAPIGetAll(1).then(request => {
        switch (request.status){
            case 200:
                lessonsShow(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function lessonsShow(list){
    lessonsTableBody.innerHTML = ""
    list.forEach(lesson => {
        let dt = ""

        if (lesson.start_time !== null){
            const st = new Date(Date.parse(`${lesson.date}T${lesson.start_time}`))
            const et = new Date(Date.parse(`${lesson.date}T${lesson.end_time}`))
            const dateDay = st.getDate().toString().padStart(2, "0")
            const dateMonth = (st.getMonth()+1).toString().padStart(2, "0")
            const stH = st.getHours().toString().padStart(2, "0")
            const stM = st.getMinutes().toString().padStart(2, "0")
            const etH = et.getHours().toString().padStart(2, "0")
            const etM = et.getMinutes().toString().padStart(2, "0")
            dt = `${dateDay}.${dateMonth} ${stH}:${stM}-${etH}:${etM}`
        } else if (lesson.date !== null){
            const date = new Date(lesson.date)
            const dateDay = date.getDate().toString().padStart(2, "0")
            const dateMonth = (date.getMonth()+1).toString().padStart(2, "0")
            dt = `${dateDay}.${dateMonth}`
        }

        lessonsTableBody.insertAdjacentHTML("beforeend", `
            <tr>
                <td>${lesson.name}</td>
                <td>${dt}</td>
                <td></td>
                <td></td>
                <td>
                    <a href="/lessons/${lesson.id}"><button type="button" class="btn btn-primary"><i class="bi bi-chevron-right"></i></button></a>
                </td>
            </tr>
        `)
    })
}

//Tabs
const lessonsTabUpcoming = document.querySelector("#LessonsTabUpcoming")
const lessonsTabPassed = document.querySelector("#LessonsTabPassed")

//Table
const lessonsTableBody = document.querySelector("#LessonsTableBody")


lessonsMain()