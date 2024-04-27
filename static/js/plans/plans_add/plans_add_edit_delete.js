async function plansAddMain(){
    await plansAddSetTeachers()
    await plansAddSetListeners()
    plansAddButton.addEventListener('click', function () {
        plansAddSetupOffcanvas(0)
    })
    planNewSubmitButton.addEventListener('click', plansAddCreate)
    planNewSubmitAndGoButton.addEventListener('click', function () {
        plansAddCreate(true)
    })
    planNewListenersSearchField.addEventListener('input', plansAddListenerSearch)
    plansModalDeleteButton.addEventListener('click', async function () {
        await plansAddDestroy(this.attributes.getNamedItem('data-plan-id').value)
    })
    plansTableBody.querySelectorAll(".plans-table-button-delete")
        .forEach(button => {
            button.addEventListener('click', function () {
                plansModalDeleteButton.attributes.getNamedItem('data-plan-id').value =
                    button.attributes.getNamedItem('data-plan-id').value
            })
        })
    plansTableBody.querySelectorAll(".plans-table-button-edit")
        .forEach(button => {
            button.addEventListener('click', async function () {
                await plansAddSetupOffcanvas(button.attributes.getNamedItem('data-plan-id').value)
            })
        })
}

async function plansAddSetupOffcanvas(planID=0){
    planNewSubmitButton.attributes.getNamedItem('data-plan-id').value = planID
    planNewSubmitAndGoButton.attributes.getNamedItem('data-plan-id').value = planID
    if (planID === 0){
        formNewPlan.reset()
        const autoName = await getAutoFieldLearningPlanName(userID)
        if (autoName.status === 200){
            planNewNameField.value = autoName.response.name
        }
    } else {
        const plan = learningPlansArray.find(plan => plan.id === Number(planID))
        planNewNameField.value = plan.name
        planNewTeacherField.value = plan.teacher.id
        planNewHWTeacherField.value = plan.default_hw_teacher.id
        planNewPurposeField.value = plan.purpose
        planNewDeadlineField.value = plan.deadline
        planNewShLessonsField.value = plan.show_lessons
        planNewShMaterialsField.value = plan.show_materials
        plan.listeners.map(listener => {
            planNewListenersSelect.querySelector(`[value="${listener.id}"]`)
                .selected = true
        })
    }
    dselect(planNewTeacherField)
    dselect(planNewHWTeacherField)
}

async function plansAddCreate(go = false){
    if (plansAddClientValidation()) {
        const formData = new FormData(formNewPlan)
        const planID = planNewSubmitButton.attributes.getNamedItem("data-plan-id").value
        if (planID === "0"){
            const request = await plansCreate(formData)
            if (request.status === 201){
                bsOffcanvasNewPlan.hide()
                await learningPlansMain()
                showToast("Успешно", "План обучения успешно добавлен")
                if (go === true){
                    window.open(`/learning_plans/${request.response.id}`, '_blank')
                }
            } else if (request.status === 400){
                plansAddServerValidation(request.response)
            } else {
                bsOffcanvasNewPlan.hide()
                showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
            }
        } else {
            const request = await plansUpdate(formData, planID)
            if (request.status === 200){
                bsOffcanvasNewPlan.hide()
                await learningPlansMain()
                showToast("Успешно", "План обучения успешно изменён")
                if (go === true){
                    window.open(`/learning_plans/${request.response.id}`, '_blank')
                }
            } else if (request.status === 400){
                plansAddServerValidation(request.response)
            } else {
                bsOffcanvasNewPlan.hide()
                showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
            }
        }
    }
}

async function plansAddDestroy(planID){
    const request = await plansDestroy(planID)
    bsPlansModalDelete.hide()
    if (request.status === 204){
        showToast("Успешно", "План обучения удалён")
        await learningPlansMain()
    } else {
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

function plansAddListenerSearch(){
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
let plansAddTeachers = []
let plansAddListeners = []

//Bootstrap Elements
const offcanvasNewPlan = document.querySelector("#offcanvasNewPlan")
const bsOffcanvasNewPlan = new bootstrap.Offcanvas(offcanvasNewPlan)
const plansModalDelete = document.querySelector("#LearningPlanDeleteModal")
const bsPlansModalDelete = new bootstrap.Modal(plansModalDelete)

//Forms
const formNewPlan = offcanvasNewPlan.querySelector("#formNewPlan")

//Fields/Errors
const planNewNameField = formNewPlan.querySelector("#PlanNewNameField")
const planNewNameError = formNewPlan.querySelector("#PlanNewNameError")
const planNewTeacherField = formNewPlan.querySelector("#PlanNewTeacherField")
const planNewTeacherError = formNewPlan.querySelector("#PlanNewTeacherError")
const planNewPurposeField = formNewPlan.querySelector("#PlanNewPurposeField")
const planNewHWTeacherField = formNewPlan.querySelector("#PlanNewHWTeacherField")
const planNewHWTeacherError = formNewPlan.querySelector("#PlanNewHWTeacherError")
const planNewShLessonsField = formNewPlan.querySelector("#PlanNewShLessonsField")
const planNewShMaterialsField = formNewPlan.querySelector("#PlanNewShMaterialsField")

const planNewDeadlineField = formNewPlan.querySelector("#PlanNewDeadlineField")
const planNewDeadlineError = formNewPlan.querySelector("#PlanNewDeadlineError")
const planNewListenersSearchField = formNewPlan.querySelector("#PlanNewListenersSearchField")
const planNewListenersSelect = formNewPlan.querySelector("#PlanNewListenersSelect")
const planNewListenersError = formNewPlan.querySelector("#PlanNewListenersError")

//Buttons
const plansAddButton = document.querySelector("#PlansAddButton")
const planNewSubmitAndGoButton = formNewPlan.querySelector("#PlanNewSubmitAndGoButton")
const planNewSubmitButton = formNewPlan.querySelector("#PlanNewSubmitButton")
const plansModalDeleteButton = plansModalDelete.querySelector("#LearningPlanDeleteModalButton")

plansAddMain()
