function adminUsersFilterMain(){
    adminUsersFilterSetRoles()
    adminUsersFilterSetFilterListeners()
    adminUsersFilterSetSortListeners()
    adminUsersFilterSetEraseListeners()
}

function adminUsersFilterSetRoles(){
    function getListener(element, q_name){
        const index = usersAdminFilteringRole.indexOf(q_name)
        switch (index){
            case -1:
                usersAdminFilteringRole.push(q_name)
                element.classList.add("active")
                break
            default:
                usersAdminFilteringRole.splice(index, 1)
                element.classList.remove("active")
                break
        }
        usersAdminGetAll()
    }

    function getElement(q_name, name){
        const a = document.createElement("a")
        a.href = "#"
        a.innerHTML = name
        a.classList.add("dropdown-item")
        a.addEventListener("click", function (){
            getListener(a, q_name)
        })
        return a
    }

    usersAdminFilterRoleList.insertAdjacentElement("beforeend", getElement("Admin", "Администратор"))
    usersAdminFilterRoleList.insertAdjacentElement("beforeend", getElement("Metodist", "Методист"))
    usersAdminFilterRoleList.insertAdjacentElement("beforeend", getElement("Teacher", "Преподаватель"))
    usersAdminFilterRoleList.insertAdjacentElement("beforeend", getElement("Curator", "Куратор"))
    usersAdminFilterRoleList.insertAdjacentElement("beforeend", getElement("Listener", "Ученик"))
}

function adminUsersFilterSetFilterListeners(){
    usersAdminFilterIDField.addEventListener("input", function () {
        usersAdminFilteringID = usersAdminFilterIDField.value
        usersAdminGetAll()
    })
    usersAdminFilterUsernameField.addEventListener("input", function () {
        usersAdminFilteringUsername = usersAdminFilterUsernameField.value.trim().toLowerCase()
        usersAdminGetAll()
    })
    usersAdminFilterNameField.addEventListener("input", function () {
        usersAdminFilteringFullName = usersAdminFilterNameField.value.trim().toLowerCase()
        usersAdminGetAll()
    })
    usersAdminFilterTGAll.addEventListener("click", function (){
        usersAdminFilteringTG = null
        usersAdminGetAll()
    })
    usersAdminFilterTGConnected.addEventListener("click", function (){
        usersAdminFilteringTG = "connected"
        usersAdminGetAll()
    })
    usersAdminFilterTGDisconnected.addEventListener("click", function (){
        usersAdminFilteringTG = "disconnected"
        usersAdminGetAll()
    })

}

function adminUsersFilterSetSortListeners(){
    usersAdminFilterUsernameSort.addEventListener("click", function () {
        switch (usersAdminFilteringUsernameSort) {
            case null:
                usersAdminFilterUsernameSort.classList.remove("btn-outline-secondary", "btn-warning")
                usersAdminFilterUsernameSort.classList.add("btn-success")
                usersAdminFilteringUsernameSort = "asc"
                break
            case "asc":
                usersAdminFilterUsernameSort.classList.remove("btn-outline-secondary", "btn-success")
                usersAdminFilterUsernameSort.classList.add("btn-warning")
                usersAdminFilteringUsernameSort = "desc"
                break
            case "desc":
                usersAdminFilterUsernameSort.classList.remove("btn-outline-secondary", "btn-warning")
                usersAdminFilterUsernameSort.classList.add("btn-success")
                usersAdminFilteringUsernameSort = "asc"
                break
        }
        usersAdminGetAll()
    })
    usersAdminFilterNameSort.addEventListener("click", function () {
        switch (usersAdminFilteringFullNameSort) {
            case null:
                usersAdminFilterNameSort.classList.remove("btn-outline-secondary", "btn-warning")
                usersAdminFilterNameSort.classList.add("btn-success")
                usersAdminFilteringFullNameSort = "asc"
                break
            case "asc":
                usersAdminFilterNameSort.classList.remove("btn-outline-secondary", "btn-success")
                usersAdminFilterNameSort.classList.add("btn-warning")
                usersAdminFilteringFullNameSort = "desc"
                break
            case "desc":
                usersAdminFilterNameSort.classList.remove("btn-outline-secondary", "btn-warning")
                usersAdminFilterNameSort.classList.add("btn-success")
                usersAdminFilteringFullNameSort = "asc"
                break
        }
        usersAdminGetAll()
    })
    usersAdminFilterIDSort.addEventListener("click", function () {
        switch (usersAdminFilteringIDSort) {
            case null:
                usersAdminFilterIDSort.classList.remove("btn-outline-secondary", "btn-warning")
                usersAdminFilterIDSort.classList.add("btn-success")
                usersAdminFilteringIDSort = "asc"
                break
            case "asc":
                usersAdminFilterIDSort.classList.remove("btn-outline-secondary", "btn-success")
                usersAdminFilterIDSort.classList.add("btn-warning")
                usersAdminFilteringIDSort = "desc"
                break
            case "desc":
                usersAdminFilterIDSort.classList.remove("btn-outline-secondary", "btn-warning")
                usersAdminFilterIDSort.classList.add("btn-success")
                usersAdminFilteringIDSort = "asc"
                break
        }
        usersAdminGetAll()
    })
}

function adminUsersFilterSetEraseListeners() {
    function eraseIDField() {
        usersAdminFilterIDField.value = ""
        usersAdminFilteringID = null
    }

    function eraseIDSort() {
        usersAdminFilterIDSort.classList.add("btn-outline-secondary")
        usersAdminFilterIDSort.classList.remove("btn-warning", "btn-success")
        usersAdminFilteringIDSort = null
    }

    function eraseTGField() {
        usersAdminFilterTGAll.checked = true
        usersAdminFilterTGConnected.checked = false
        usersAdminFilterTGDisconnected.checked = false
        usersAdminFilteringTG = null
    }

    function eraseUsernameField() {
        usersAdminFilterUsernameField.value = ""
        usersAdminFilteringUsername = null
    }

    function eraseUsernameSort() {
        usersAdminFilterUsernameSort.classList.add("btn-outline-secondary")
        usersAdminFilterUsernameSort.classList.remove("btn-warning", "btn-success")
        usersAdminFilteringUsernameSort = null
    }

    function eraseFullNameField() {
        usersAdminFilterNameField.value = ""
        usersAdminFilteringFullName = null
    }

    function eraseFullNameSort() {
        usersAdminFilterNameSort.classList.add("btn-outline-secondary")
        usersAdminFilterNameSort.classList.remove("btn-warning", "btn-success")
        usersAdminFilteringFullNameSort = null
    }

    function eraseRoles() {
        usersAdminFilterRoleList.querySelectorAll("a").forEach(role => {
            role.classList.remove("active")
        })
    }

    usersAdminFilterEraseAll.addEventListener("click", function () {
        eraseIDField()
        eraseIDSort()
        eraseTGField()
        eraseUsernameField()
        eraseUsernameSort()
        eraseFullNameField()
        eraseFullNameSort()
        eraseRoles()
        usersAdminGetAll()
    })
    usersAdminFilterIDErase.addEventListener("click", function () {
        eraseIDField()
        usersAdminGetAll()
    })
    usersAdminFilterUsernameErase.addEventListener("click", function () {
        eraseUsernameField()
        usersAdminGetAll()
    })
    usersAdminFilterNameErase.addEventListener("click", function () {
        eraseFullNameField()
        usersAdminGetAll()
    })
}

//Fields
const usersAdminFilterIDField = document.querySelector("#usersAdminFilterIDField")
const usersAdminFilterTGAll = document.querySelector("#usersAdminFilterTGAll")
const usersAdminFilterTGConnected = document.querySelector("#usersAdminFilterTGConnected")
const usersAdminFilterTGDisconnected = document.querySelector("#usersAdminFilterTGDisconnected")
const usersAdminFilterUsernameField = document.querySelector("#usersAdminFilterUsernameField")
const usersAdminFilterNameField = document.querySelector("#usersAdminFilterNameField")
const usersAdminFilterRoleList = document.querySelector("#usersAdminFilterRoleList")

//Erase
const usersAdminFilterEraseAll = document.querySelector("#usersAdminFilterEraseAll")
const usersAdminFilterIDErase = document.querySelector("#usersAdminFilterIDErase")
const usersAdminFilterUsernameErase = document.querySelector("#usersAdminFilterUsernameErase")
const usersAdminFilterNameErase = document.querySelector("#usersAdminFilterNameErase")

//Sort
const usersAdminFilterUsernameSort = document.querySelector("#usersAdminFilterUsernameSort")
const usersAdminFilterNameSort = document.querySelector("#usersAdminFilterNameSort")
const usersAdminFilterIDSort = document.querySelector("#usersAdminFilterIDSort")


adminUsersFilterMain()