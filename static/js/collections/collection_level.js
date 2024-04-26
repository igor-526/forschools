async function getLevels(){
    await fetch('/api/v1/collections/levels/')
        .then(async response => await response.json())
        .then(set => levelsSet = set)
}

function setLevels(){
    tableHead.innerHTML = `<tr>
                        <th scope="col">Уровень</th>
                        <th scope="col">Действие</th></tr>`
    tableBody.innerHTML = '<td>Добавить уровень</td><td><button type="button" class="btn btn-primary" id="TableButtonLevelAdd" data-col-id="0"><i class="bi bi-plus-lg"></i></button></td>'
    levelsSet.map(function (item) {
        tableBody.insertAdjacentHTML("beforeend", `
                                <td>${item.name}</td>
                                <td>
                                <button type="button" class="btn btn-danger" id="TableButtonLevelDelete" data-col-id="${item.id}">
                                <i class="bi bi-trash3"></i></button>
                                <button type="button" class="btn btn-primary" id="TableButtonLevelEdit" data-col-id="${item.id}">
                                <i class="bi bi-pencil"></i></button>
                                </td>
        `)
    })
    tableBody.querySelectorAll("#TableButtonLevelDelete").forEach(function (button) {
        button.addEventListener("click", deleteLevelModal)
    })

    tableBody.querySelectorAll("#TableButtonLevelEdit").forEach(function (button) {
        button.addEventListener("click", editLevelModal)
    })
    tableBody.querySelector("#TableButtonLevelAdd").addEventListener("click", addLevelModal)
}

function editLevelModal(){
    modalEditNameLabel.innerHTML = "Уровень"
    modalEditNameNameHelp.innerHTML = "Наименование уровня для ученика/преподавателя. Должно быть уникальным"
    const colID = this.attributes.getNamedItem("data-col-id").value
    const colObj = levelsSet.find(i => i.id === Number(colID))
    modalEditNameNameField.value = colObj.name
    bsModalEditName.show()
    modalEditNameSaveButton.attributes.getNamedItem("data-col-id").value = this
        .attributes.getNamedItem("data-col-id").value
    modalEditNameSaveButton.attributes.getNamedItem("data-col-name").value = "level"
}

function deleteLevelModal(){
    const colID = this.attributes.getNamedItem("data-col-id").value
    const colObj = levelsSet.find(i => i.id === Number(colID))
    modalDeleteBody.innerHTML = `
    Внимание! Вы собираетесь удалить уровень "${colObj.name}"<br>
    У преподавателей и учеников вместо текущего уровня будет отсутствие данных<br>
    Это действие необратимо. Вы уверены?
    `
    bsModalDelete.show()
    modalDeleteButton.attributes.getNamedItem("data-col-id").value = this
        .attributes.getNamedItem("data-col-id").value
    modalDeleteButton.attributes.getNamedItem("data-col-name").value = "level"
}

function addLevelModal(){
    modalEditNameLabel.innerHTML = "Уровень"
    modalEditNameNameHelp.innerHTML = "Наименование уровня для ученика/преподавателя. Должно быть уникальным"
    modalEditNameNameField.value = ""
    bsModalEditName.show()
    modalEditNameSaveButton.attributes.getNamedItem("data-col-id").value = "0"
    modalEditNameSaveButton.attributes.getNamedItem("data-col-name").value = "level"
}

async function addLevel(){
    const response = await fetch(`/api/v1/collections/levels/`, {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: new FormData(modalEditNameForm)
    })
    if (response.status === 201){
        bsModalEditName.hide()
        showToast("Уровень", "Уровень успешно добавлен")
        await getLevels()
        setLevels()
    } else {
        bsModalEditName.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

async function editLevel(colID){
    const response = await fetch(`/api/v1/collections/levels/${colID}`, {
        method: 'patch',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: new FormData(modalEditNameForm)
    })
    if (response.status === 200){
        bsModalEditName.hide()
        showToast("Уровень", "Уровень успешно изменён")
        await getLevels()
        setLevels()
    } else {
        bsModalEditName.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

async function deleteLevel(colID){
    const response = await fetch(`/api/v1/collections/levels/${colID}`, {
        method: 'delete',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
    })
    if (response.status === 204){
        bsModalDelete.hide()
        showToast("Уровень", "Уровень успешно удалён")
        await getLevels()
        setLevels()
    } else {
        bsModalDelete.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}
