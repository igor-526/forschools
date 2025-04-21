function plansAddMain(){
    plansAddSetTeacherListeners()
    plansAddButton.addEventListener('click', function () {
        plansAddSetOffcanvas(null)
    })
    planNewSubmitButton.addEventListener('click', function () {
        plansAddEditCreate()
    })
    planNewSubmitAndGoButton.addEventListener('click', function () {
        plansAddEditCreate(true)
    })
    planNewListenersSearchField.addEventListener('input', plansAddListenerSearch)
    plansModalDeleteButton.addEventListener('click', async function () {
        await plansAddDestroy(this.attributes.getNamedItem('data-plan-id').value)
    })
    planNewCuratorsSearchField.addEventListener('input', plansAddCuratorSearch)
}

function plansAddSetTeacherListeners(){
    function getElement(user, selectedID=null) {
        const option = document.createElement("option")
        option.value = user.id
        option.innerHTML = `${user.first_name} ${user.last_name}`
        if (user.id === selectedID){
            option.selected = true
        }
        return option
    }

    const selectedListener = getHashValue("listener")?Number(getHashValue("listener")):null
    const selectedTeacher = getHashValue("teacher")?Number(getHashValue("teacher")):null
    const selectedMetodist = getHashValue("teacher")?Number(getHashValue("metodist")):null
    const selectedCurator = getHashValue("curator")?Number(getHashValue("curator")):null
    if (plansAddCanSetTeacher){
        usersAPIGetTeachers().then(request => {
            switch (request.status) {
                case 200:
                    planNewTeacherField.innerHTML = '<option value="">Выберите преподавателя</option>'
                    planNewHWTeacherField.innerHTML = '<option value="">Совпадает с преподавателем</option>'
                    request.response.forEach(teacher => {
                        planNewTeacherField.insertAdjacentElement("beforeend", getElement(teacher, selectedTeacher))
                        planNewHWTeacherField.insertAdjacentElement("beforeend", getElement(teacher))
                    })
                    break
                default:
                    showErrorToast("Не удалось загрузить список преподавателей")
                    break
            }
        })
    } else {
        planNewTeacherField.innerHTML = `<option value="${plansAddTeacher.id}" selected>${plansAddTeacher.name}</option>`
        planNewHWTeacherField.innerHTML = `<option value="${plansAddTeacher.id}" selected>${plansAddTeacher.name}</option>`
    }

    usersAPIGetListeners().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(listener => {
                    planNewListenersSelect.insertAdjacentElement("beforeend", getElement(listener, selectedListener))
                })
                break
            default:
                showErrorToast("Не удалось загрузить список учеников")
                break
        }
    })

    usersAPIGetCurators().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(curator => {
                    planNewCuratorsSelect.insertAdjacentElement("beforeend", getElement(curator, selectedCurator))
                })
                break
            default:
                showErrorToast("Не удалось загрузить список кураторов")
                break
        }
    })

    usersAPIGetMethodists().then(request => {
        switch (request.status) {
            case 200:
                PlanNewHWMetodistField.innerHTML = '<option value="">Выберите методиста</option>'
                request.response.forEach(metodist => {
                    PlanNewHWMetodistField.insertAdjacentElement("beforeend", getElement(metodist, selectedMetodist))
                })
                break
            default:
                showErrorToast("Не удалось загрузить список методистов")
                break
        }
    })
}

function plansAddSetOffcanvas(planID=null){
    planEditSelectedID = planID
    formNewPlan.reset()
    if (!planID){
        getAutoFieldLearningPlanName(userID).then(request => {
            if (request.status === 200){
                planNewNameField.value = request.response.name
            }
        })
    } else {
        plansAPIGetItem(planID).then(request => {
            switch (request.status){
                case 200:
                    planNewNameField.value = request.response.name
                    planNewTeacherField.value = request.response.teacher.id
                    planNewHWTeacherField.value = request.response.default_hw_teacher.id
                    if (request.response.metodist)
                        PlanNewHWMetodistField.value = request.response.metodist.id
                    planNewPurposeField.value = request.response.purpose
                    planNewDeadlineField.value = request.response.deadline
                    planNewShLessonsField.value = request.response.show_lessons
                    planNewShMaterialsField.value = request.response.show_materials
                    request.response.listeners.forEach(listener => {
                        planNewListenersSelect.querySelector(`[value="${listener.id}"]`)
                            .selected = true
                    })
                    request.response.curators.forEach(curator => {
                        planNewCuratorsSelect.querySelector(`[value="${curator.id}"]`)
                            .selected = true
                    })
                    break
                default:
                    showErrorToast()
                    break
            }
        })
    }
    bsOffcanvasNewPlan.show()
}

function plansAddEditCreate(go = false){
    if (plansAddClientValidation()) {
        const formData = new FormData(formNewPlan)

        if (planEditSelectedID){
            plansAPIUpdate(formData, planEditSelectedID).then(request => {
                switch (request.status){
                    case 200:
                        bsOffcanvasNewPlan.hide()
                        learningPlansMain()
                        showSuccessToast("Успешно", "План обучения успешно изменён")
                        if (go === true){
                            window.open(`/learning_plans/${request.response.id}/`)
                        }
                        break
                    case 400:
                        plansAddServerValidation(request.response)
                        break
                    default:
                        bsOffcanvasNewPlan.hide()
                        showErrorToast()
                        break
                }
            })
        } else {
            plansAPICreate(formData).then(request => {
                switch (request.status){
                    case 201:
                        bsOffcanvasNewPlan.hide()
                        learningPlansMain()
                        showSuccessToast("Успешно", "План обучения успешно добавлен")
                        if (go === true){
                            window.open(`/learning_plans/${request.response.id}/`)
                        }
                        break
                    case 400:
                        plansAddServerValidation(request.response)
                        break
                    default:
                        bsOffcanvasNewPlan.hide()
                        showErrorToast()
                        break
                }
            })
        }
    }
}

function plansAddDestroy(){
    plansAPIDestroy(planEditSelectedID).then(request => {
        bsPlansModalDelete.hide()
        switch (request.status){
            case 204:
                showSuccessToast("План обучения удалён")
                break
            default:
                showErrorToast()
        }
    })
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

function plansAddCuratorSearch(){
    const query = new RegExp(planNewCuratorsSearchField.value.toLowerCase())
    const options = planNewCuratorsSelect.querySelectorAll("option")
    options.forEach(function (opt) {
        if(query.test(opt.innerHTML.toLowerCase())){
            opt.classList.remove("d-none")
        } else {
            opt.classList.add("d-none")
        }
    })
}

function plansAddDestroySetModal(planID){
    planEditSelectedID = planID
    bsPlansModalDelete.show()
}

//vars
let planEditSelectedID = null

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

const PlanNewHWMetodistField = formNewPlan.querySelector("#PlanNewHWMetodistField")
const PlanNewHWMetodistError = formNewPlan.querySelector("#PlanNewHWMetodistError")

const planNewDeadlineField = formNewPlan.querySelector("#PlanNewDeadlineField")
const planNewDeadlineError = formNewPlan.querySelector("#PlanNewDeadlineError")
const planNewListenersSearchField = formNewPlan.querySelector("#PlanNewListenersSearchField")
const planNewListenersSelect = formNewPlan.querySelector("#PlanNewListenersSelect")
const planNewListenersError = formNewPlan.querySelector("#PlanNewListenersError")
const planNewCuratorsSearchField = formNewPlan.querySelector("#PlanNewCuratorsSearchField")
const planNewCuratorsSelect = formNewPlan.querySelector("#PlanNewCuratorsSelect")
const planNewCuratorsError = formNewPlan.querySelector("#PlanNewCuratorsError")

//Buttons
const plansAddButton = document.querySelector("#PlansAddButton")
const planNewSubmitAndGoButton = formNewPlan.querySelector("#PlanNewSubmitAndGoButton")
const planNewSubmitButton = formNewPlan.querySelector("#PlanNewSubmitButton")
const plansModalDeleteButton = plansModalDelete.querySelector("#LearningPlanDeleteModalButton")

plansAddMain()
