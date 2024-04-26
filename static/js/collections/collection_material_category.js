async function getMaterialCategories(){
    await fetch('/api/v1/collections/mat_cats')
        .then(async response => await response.json())
        .then(set => materialCategoriesSet = set)
}

function setMaterialCategories(){
    tableHead.innerHTML = `<tr>
                        <th scope="col">Категория</th>
                        <th scope="col">Действие</th></tr>`
    tableBody.innerHTML = '<td>Добавить категорию материалов</td><td><button type="button" class="btn btn-primary" id="TableButtonMatCatAdd" data-col-id="0"><i class="bi bi-plus-lg"></i></button></td>'
    materialCategoriesSet.map(function (item) {
        tableBody.insertAdjacentHTML("beforeend", `
                                <td>${item.name}</td>
                                <td>
                                <button type="button" class="btn btn-danger" id="TableButtonMatCatDelete" data-col-id="${item.id}">
                                <i class="bi bi-trash3"></i></button>
                                <button type="button" class="btn btn-primary" id="TableButtonMatCatEdit" data-col-id="${item.id}">
                                <i class="bi bi-pencil"></i></button>
                                </td>
        `)
    })
    tableBody.querySelectorAll("#TableButtonMatCatDelete").forEach(function (button) {
        button.addEventListener("click", deleteMatCatModal)
    })

    tableBody.querySelectorAll("#TableButtonMatCatEdit").forEach(function (button) {
        button.addEventListener("click", editMatCatModal)
    })
    tableBody.querySelector("#TableButtonMatCatAdd").addEventListener("click", addMatCatModal)
}

function editMatCatModal(){
    modalEditNameLabel.innerHTML = "Категория материалов"
    modalEditNameNameHelp.innerHTML = "Наименование для категории материалов. Должно быть уникальным"
    const colID = this.attributes.getNamedItem("data-col-id").value
    const colObj = materialCategoriesSet.find(i => i.id === Number(colID))
    modalEditNameNameField.value = colObj.name
    bsModalEditName.show()
    modalEditNameSaveButton.attributes.getNamedItem("data-col-id").value = this
        .attributes.getNamedItem("data-col-id").value
    modalEditNameSaveButton.attributes.getNamedItem("data-col-name").value = "matCat"
}

function deleteMatCatModal(){
    const colID = this.attributes.getNamedItem("data-col-id").value
    const colObj = materialCategoriesSet.find(i => i.id === Number(colID))
    modalDeleteBody.innerHTML = `
    Внимание! Вы собираетесь удалить категорию материалов "${colObj.name}"<br>
    Материалы с данной категорией останутся<br>
    Это действие необратимо. Вы уверены?
    `
    bsModalDelete.show()
    modalDeleteButton.attributes.getNamedItem("data-col-id").value = this
        .attributes.getNamedItem("data-col-id").value
    modalDeleteButton.attributes.getNamedItem("data-col-name").value = "matCat"
}

function addMatCatModal(){
    modalEditNameLabel.innerHTML = "Категория материалов"
    modalEditNameNameHelp.innerHTML = "Наименование для категории материалов. Должно быть уникальным"
    modalEditNameNameField.value = ""
    bsModalEditName.show()
    modalEditNameSaveButton.attributes.getNamedItem("data-col-id").value = "0"
    modalEditNameSaveButton.attributes.getNamedItem("data-col-name").value = "matCat"
}

async function addMatCat(){
    const response = await fetch(`/api/v1/collections/mat_cats/`, {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: new FormData(modalEditNameForm)
    })
    if (response.status === 201){
        bsModalEditName.hide()
        showToast("Категория материалов", "Категория материалов успешно добавлена")
        await getMaterialCategories()
        setMaterialCategories()
    } else {
        bsModalEditName.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

async function editMatCat(colID){
    const response = await fetch(`/api/v1/collections/mat_cats/${colID}`, {
        method: 'patch',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: new FormData(modalEditNameForm)
    })
    if (response.status === 200){
        bsModalEditName.hide()
        showToast("Категория материалов", "Категория материалов успешно изменена")
        await getMaterialCategories()
        setMaterialCategories()
    } else {
        bsModalEditName.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

async function deleteMatCat(colID){
    const response = await fetch(`/api/v1/collections/mat_cats/${colID}`, {
        method: 'delete',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
    })
    if (response.status === 204){
        bsModalDelete.hide()
        showToast("Категория материалов", "Категория материалов успешно удалена")
        await getMaterialCategories()
        setMaterialCategories()
    } else {
        bsModalDelete.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}