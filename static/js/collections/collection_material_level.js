async function getMaterialLevels(){
    await fetch('/api/v1/collections/mat_levels/')
        .then(async response => await response.json())
        .then(set => materialLevelsSet = set)
}

function setMaterialLevels(){
    tableHead.innerHTML = `<tr>
                        <th scope="col">Категория</th>
                        <th scope="col">Действие</th></tr>`
    tableBody.innerHTML = '<td>Добавить уровень материалов</td><td><button type="button" class="btn btn-primary" id="TableButtonMatLevelAdd" data-col-id="0"><i class="fa-solid fa-plus"></i></button></td>'
    materialLevelsSet.map(function (item) {
        tableBody.insertAdjacentHTML("beforeend", `
                                <td>${item.name}</td>
                                <td>
                                <button type="button" class="btn btn-danger" id="TableButtonMatLevelDelete" data-col-id="${item.id}">
                                <i class="fa-regular fa-trash-can"></i></button>
                                <button type="button" class="btn btn-primary" id="TableButtonMatLevelEdit" data-col-id="${item.id}">
                                <i class="fa-regular fa-pen-to-square"></i></button>
                                </td>
        `)
    })
    tableBody.querySelectorAll("#TableButtonMatLevelDelete").forEach(function (button) {
        button.addEventListener("click", deleteMatLevelModal)
    })

    tableBody.querySelectorAll("#TableButtonMatLevelEdit").forEach(function (button) {
        button.addEventListener("click", editMatLevelModal)
    })
    tableBody.querySelector("#TableButtonMatLevelAdd").addEventListener("click", addMatLevelModal)
}

function editMatLevelModal(){
    modalEditNameLabel.innerHTML = "Уровень материалов"
    modalEditNameNameHelp.innerHTML = "Наименование для уровня материалов. Должно быть уникальным"
    const colID = this.attributes.getNamedItem("data-col-id").value
    const colObj = materialLevelsSet.find(i => i.id === Number(colID))
    modalEditNameNameField.value = colObj.name
    bsModalEditName.show()
    modalEditNameSaveButton.attributes.getNamedItem("data-col-id").value = this
        .attributes.getNamedItem("data-col-id").value
    modalEditNameSaveButton.attributes.getNamedItem("data-col-name").value = "matLevel"
}

function deleteMatLevelModal(){
    const colID = this.attributes.getNamedItem("data-col-id").value
    const colObj = materialLevelsSet.find(i => i.id === Number(colID))
    modalDeleteBody.innerHTML = `
    Внимание! Вы собираетесь удалить уровень материалов "${colObj.name}"<br>
    Материалы с данным уровнем останутся<br>
    Это действие необратимо. Вы уверены?
    `
    bsModalDelete.show()
    modalDeleteButton.attributes.getNamedItem("data-col-id").value = this
        .attributes.getNamedItem("data-col-id").value
    modalDeleteButton.attributes.getNamedItem("data-col-name").value = "matLevel"
}

function addMatLevelModal(){
    modalEditNameLabel.innerHTML = "Уровень материалов"
    modalEditNameNameHelp.innerHTML = "Наименование для уровня материалов. Должно быть уникальным"
    modalEditNameNameField.value = ""
    bsModalEditName.show()
    modalEditNameSaveButton.attributes.getNamedItem("data-col-id").value = "0"
    modalEditNameSaveButton.attributes.getNamedItem("data-col-name").value = "matLevel"
}

async function addMatLevel(){
    const response = await fetch(`/api/v1/collections/mat_levels/`, {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: new FormData(modalEditNameForm)
    })
    if (response.status === 201){
        bsModalEditName.hide()
        showToast("Уровень материалов", "Уровень материалов успешно добавлен")
        await getMaterialLevels()
        setMaterialLevels()
    } else {
        bsModalEditName.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

async function editMatLevel(colID){
    const response = await fetch(`/api/v1/collections/mat_levels/${colID}`, {
        method: 'patch',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: new FormData(modalEditNameForm)
    })
    if (response.status === 200){
        bsModalEditName.hide()
        showToast("Уровень материалов", "Уровень материалов успешно изменена")
        await getMaterialLevels()
        setMaterialLevels()
    } else {
        bsModalEditName.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

async function deleteMatLevel(colID){
    const response = await fetch(`/api/v1/collections/mat_levels/${colID}`, {
        method: 'delete',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
    })
    if (response.status === 204){
        bsModalDelete.hide()
        showToast("Уровень материалов", "Уровень материалов успешно удалена")
        await getMaterialLevels()
        setMaterialLevels()
    } else {
        bsModalDelete.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}