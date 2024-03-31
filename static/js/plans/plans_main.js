async function plans_main(){
    await plans_get()
    plans_show()
}

async function plans_get(){
    await fetch("/api/v1/learning_plans/")
        .then(async response => await response.json())
        .then(plans => plans_array = plans)
}

function plans_show(list = plans_array){
    plansTableBody.innerHTML = ''
    plans_array.map(plan => {
            let listenersHTML = ''
        plan.listeners.map(listener => {
            listenersHTML += `<a href="/profile/${listener.id}">${listener.first_name} ${listener.last_name}<br></a>`
        })
        plansTableBody.insertAdjacentHTML("beforeend", `
        <tr data-plan-id="${plan.id}">
            <td style="max-width: 300px;">${plan.name}</td>
            <td><a href="/profile/${plan.teacher.id}">${plan.teacher.first_name} ${plan.teacher.last_name}</a></td>
            <td>${listenersHTML}</td>
            <td>
                <a href="${plan.id}"><button type="button" class="btn btn-primary" id="PlansTableButtonGo">
                    <i class="fa-solid fa-chevron-right"></i></button></a>
            </td>
        </tr>`)
    })
}

let plans_array = []
const plansTableBody = document.querySelector("#PlansTableBody")

plans_main()