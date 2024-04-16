async function lessonsMain(){
    await lessonsSetUpcoming()
    lessonsTabUpcoming.addEventListener("click", lessonsSetUpcoming)
    lessonsTabPassed.addEventListener("click", lessonsSetPassed)
}

async function lessonsSetUpcoming(){
    lessonsTabUpcoming.classList.add("active")
    lessonsTabPassed.classList.remove("active")
    lessonsSet = await lessonsGet(0)
    lessonsShow()
}

async function lessonsSetPassed(){
    lessonsTabUpcoming.classList.remove("active")
    lessonsTabPassed.classList.add("active")
    lessonsSet = await lessonsGet(1)
    lessonsShow()
}

async function lessonsGet(status){
    let url = ""
    if (status === 0){
        url = "/api/v1/lessons?status=0"
    } else if (status === 1){
        url = "/api/v1/lessons?status=1"
    }
    return await fetch(url)
        .then(async response => await response.json())
}

function lessonsShow(list = lessonsSet){
    console.log(list)
    lessonsTableBody.innerHTML = ""
    list.map(lesson => {
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
                    <a href="/lessons/${lesson.id}"><button type="button" class="btn btn-primary"><i class="fa-solid fa-chevron-right"></i></button></a>
                </td>
            </tr>
        `)
    })
}

//Sets
let lessonsSet = []

//Tabs
const lessonsTabUpcoming = document.querySelector("#LessonsTabUpcoming")
const lessonsTabPassed = document.querySelector("#LessonsTabPassed")

//Table
const lessonsTableBody = document.querySelector("#LessonsTableBody")


lessonsMain()