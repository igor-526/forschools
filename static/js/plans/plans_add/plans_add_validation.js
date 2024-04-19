function plans_add_client_validation(){
    planNewNameField.classList.remove("is-invalid")
    planNewTeacherField.classList.remove("is-invalid")
    planNewDeadlineField.classList.remove("is-invalid")
    planNewListenersSelect.classList.remove("is-invalid")
    planNewNameError.innerHTML = ''
    planNewTeacherError.innerHTML = ''
    planNewDeadlineError.innerHTML = ''
    planNewListenersError.innerHTML = ''
    let validationStatus = true

    if (planNewNameField.value === ""){
        planNewNameField.classList.add("is-invalid")
        planNewNameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    if (planNewTeacherField.value === ""){
        planNewTeacherField.classList.add("is-invalid")
        planNewTeacherError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    if (planNewDeadlineField.value !== ''){
        const deadline = new Date(planNewDeadlineField.value)
        if (deadline <= new Date()){
            planNewDeadlineField.classList.add("is-invalid")
            planNewDeadlineError.innerHTML = "Срок плана не может быть раньше сегодняшнего дня"
            validationStatus = false
        }
    }

    if (planNewListenersSelect.value === ''){
        planNewListenersSelect.classList.add("is-invalid")
        planNewListenersError.innerHTML = "Необходимо выбрать хотя бы одного ученика"
        validationStatus = false
    }


    return validationStatus
}

function plans_add_server_validation(errors){
    console.log(errors)
    if (errors.hasOwnProperty("name")){
        planNewNameField.classList.add("is-invalid")
        planNewNameError.innerHTML = errors.name
    }
    if (errors.hasOwnProperty("teacher")){
        planNewTeacherField.classList.add("is-invalid")
        planNewTeacherError.innerHTML = errors.teacher
    }
    if (errors.hasOwnProperty("deadline")){
        planNewDeadlineField.classList.add("is-invalid")
        planNewDeadlineError.innerHTML = errors.deadline
    }
    if (errors.hasOwnProperty("listeners")){
        planNewListenersSelect.classList.add("is-invalid")
        planNewListenersError.innerHTML = errors.listeners
    }
}