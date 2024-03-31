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
    await fetch("/api/v1/users?group=teachers")
        .then(async resp => await resp.json())
        .then(result => result.map(teacher => plans_add_teachers.push(`${teacher.first_name} ${teacher.last_name}`)))
    planNewTeacherFieldOptions.innerHTML = ''
    plans_add_teachers.map(teacher => planNewTeacherFieldOptions.insertAdjacentHTML('beforeend', `
    <option value="${teacher}">
    `))
}