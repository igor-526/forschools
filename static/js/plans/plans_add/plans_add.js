async function plans_add_main(){
    await plans_add_set_teachers()
    await plans_add_set_listeners()
    planNewSubmitButton.addEventListener('click', plans_add_post)
    planNewSubmitAndGoButton.addEventListener('click', function () {
        plans_add_post(go=true)
    })
    planNewListenersSearchField.addEventListener('input', plans_add_listener_serach)
}

async function plans_add_post(go = false){
    if (plans_add_client_validation()) {
        const formData = new FormData(formNewPlan)
        const response = await fetch('/api/v1/learning_plans/', {
            method: "post",
            credentials: 'same-origin',
            headers:{
                "X-CSRFToken": csrftoken,
            },
            body: formData
        })
        if (response.status === 201){
            bsOffcanvasNewPlan.hide()
            await plans_get()
            plans_show()
            showToast("Успешно", "План обучения успешно добавлен")
            if (go === true){
                await response.json().then(resp => window.open(`/learning_plans/${resp.id}`, '_blank'))
            }
        } else if (response.status === 400){
            plans_add_server_validation(await response.json())
        } else {
            bsOffcanvasNewPlan.hide()
            showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
        }

    }
}

function plans_add_listener_serach(){
    const query = new RegExp(planNewListenersSearchField.value.toLowerCase())
    const options = planNewListenersSelect.querySelectorAll("option")
    options.forEach(function (opt) {
        if(query.test(opt.innerHTML.toLowerCase())){
            opt.classList.remove("d-none")
        } else {
            opt.classList.add("d-none")
        }
    })
}

//Sets
let plans_add_teachers = []
let plans_add_listeners = []

//Bootstrap Elements
const offcanvasNewPlan = document.querySelector("#offcanvasNewPlan")
const bsOffcanvasNewPlan = new bootstrap.Offcanvas(offcanvasNewPlan)

//Forms
const formNewPlan = offcanvasNewPlan.querySelector("#formNewPlan")

//Fields/Errors
const planNewNameField = formNewPlan.querySelector("#PlanNewNameField")
const planNewNameError = formNewPlan.querySelector("#PlanNewNameError")
const planNewTeacherField = formNewPlan.querySelector("#PlanNewTeacherField")
const planNewTeacherFieldOptions = formNewPlan.querySelector("#PlanNewTeacherFieldOptions")
const planNewTeacherError = formNewPlan.querySelector("#PlanNewTeacherError")
const planNewDeadlineField = formNewPlan.querySelector("#PlanNewDeadlineField")
const planNewDeadlineError = formNewPlan.querySelector("#PlanNewDeadlineError")
const planNewListenersSearchField = formNewPlan.querySelector("#PlanNewListenersSearchField")
const planNewListenersSelect = formNewPlan.querySelector("#PlanNewListenersSelect")
const planNewListenersError = formNewPlan.querySelector("#PlanNewListenersError")

//Buttons
const plansAddButton = document.querySelector("#PlansAddButton")
const planNewSubmitAndGoButton = formNewPlan.querySelector("#PlanNewSubmitAndGoButton")
const planNewSubmitButton = formNewPlan.querySelector("#PlanNewSubmitButton")

plans_add_main()
