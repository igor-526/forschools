async function plans_main(){
    const request = await plansGet()
    if (request.status === 200){
        plansArray = request.response
    }
    plans_show()
}

function plans_show(list = plansArray){
    plansTableBody.innerHTML = ''
    plansArray.map(plan => {
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

let plansArray = []
const plansTableBody = document.querySelector("#PlansTableBody")

plans_main()