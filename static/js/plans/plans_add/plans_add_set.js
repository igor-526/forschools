async function plansAddSetListeners(){
    await fetch("/api/v1/users?group=listeners")
        .then(async resp => await resp.json())
        .then(result => plansAddListeners = result)
    planNewListenersSelect.innerHTML = ''
    plansAddListeners.map(listener => planNewListenersSelect.insertAdjacentHTML('beforeend', `
        <option value="${listener.id}">${listener.first_name} ${listener.last_name}</option>
    `))


}

async function plansAddSetTeachers(){
    if ((plansAddCanSetTeacher)){
        await fetch("/api/v1/users?group=teachers")
            .then(async resp => await resp.json())
            .then(result => plansAddTeachers = result)
        planNewTeacherField.innerHTML = '<option value="">Выберите преподавателя</option>'
        planNewHWTeacherField.innerHTML = '<option value="">Совпадает с преподавателем</option>'
        plansAddTeachers.map(teacher => {
            planNewTeacherField.insertAdjacentHTML("beforeend", `
        <option value="${teacher.id}">${teacher.first_name} ${teacher.last_name}</option>
        `)
            planNewHWTeacherField.insertAdjacentHTML("beforeend", `
        <option value="${teacher.id}">${teacher.first_name} ${teacher.last_name}</option>
        `)
        })
    } else {
        planNewTeacherField.innerHTML = `<option value="${plansAddTeacher.id}" selected>${plansAddTeacher.name}</option>`
        planNewHWTeacherField.innerHTML = `<option value="${plansAddTeacher.id}" selected>${plansAddTeacher.name}</option>`
    }

}