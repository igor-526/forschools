async function plans_add_set_listeners(){
    await fetch("/api/v1/users?group=listeners")
        .then(async resp => await resp.json())
        .then(result => plans_add_listeners = result)
    planNewListenersSelect.innerHTML = ''
    plans_add_listeners.map(listener => planNewListenersSelect.insertAdjacentHTML('beforeend', `
        <option value="${listener.id}">${listener.first_name} ${listener.last_name}</option>
    `))


}

async function plans_add_set_teachers(){
    if ((plansAddCanSetTeacher)){
        await fetch("/api/v1/users?group=teachers")
            .then(async resp => await resp.json())
            .then(result => plans_add_teachers = result)
        planNewTeacherField.innerHTML = '<option value="">Выберите преподавателя</option>'
        planNewHWTeacherField.innerHTML = '<option value="">Совпадает с преподавателем</option>'
        plans_add_teachers.map(teacher => {
            planNewTeacherField.insertAdjacentHTML("beforeend", `
        <option value="${teacher.id}">${teacher.first_name} ${teacher.last_name}</option>
        `)
            planNewHWTeacherField.insertAdjacentHTML("beforeend", `
        <option value="${teacher.id}">${teacher.first_name} ${teacher.last_name}</option>
        `)
        })
        dselect(planNewTeacherField)
        dselect(planNewHWTeacherField)
    } else {
        planNewTeacherField.innerHTML = `<option value="${plansAddTeacher.id}" selected>${plansAddTeacher.name}</option>`
        planNewHWTeacherField.innerHTML = `<option value="${plansAddTeacher.id}" selected>${plansAddTeacher.name}</option>`
    }

}