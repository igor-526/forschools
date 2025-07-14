function adminUsersFilterMain(){
    adminUsersFilterInitIDTG()
    adminUsersFilterInitUsername()
    adminUsersFilterInitFullName()
    adminUsersFilterInitRoles()
    adminUsersFilterInitLastActivity()
    adminUsersFilterSetEraseListeners()
}

function adminUsersFilterInitIDTG(){
    function searchListener(){
        usersAdminFilterIDField.addEventListener("input", () => {
            const query = usersAdminFilterIDField.value.trim().toLowerCase()
            usersAdminFilteringID = query.value ? query.value : null
            usersAdminGetAll()
        })
    }

    function eraseIDListener(){
        usersAdminFilterIDErase.addEventListener("click", () => {
            usersAdminFilterIDField.value = ""
            usersAdminFilteringID = null
            usersAdminGetAll()
        })
    }

    function tgListener(){
        usersAdminFilterTGAll.addEventListener("click", () =>{
            usersAdminFilteringTG = null
            usersAdminGetAll()
        })
        usersAdminFilterTGConnected.addEventListener("click", () =>{
            usersAdminFilteringTG = "connected"
            usersAdminGetAll()
        })
        usersAdminFilterTGDisconnected.addEventListener("click", () =>{
            usersAdminFilteringTG = "disconnected"
            usersAdminGetAll()
        })
    }

    function sortListener(){
        usersAdminFilterIDSort.addEventListener("click", () => {
            usersAdminFilteringIDSort = sortButtonListener(
                usersAdminFilterIDSort, usersAdminFilteringIDSort
            )
            usersAdminGetAll()
        })
    }

    searchListener()
    eraseIDListener()
    tgListener()
    sortListener()
}

function adminUsersFilterInitUsername(){
    function searchListener(){
        usersAdminFilterUsernameField.addEventListener("input", () => {
            const query = usersAdminFilterIDField.value.trim().toLowerCase()
            usersAdminFilteringUsername = query ? query : null
            usersAdminGetAll()
        })
    }

    function searchEraseListener(){
        usersAdminFilterUsernameErase.addEventListener("click", () => {
            usersAdminFilterUsernameField.value = ""
            usersAdminFilteringUsername = null
            usersAdminGetAll()
        })
    }

    function sortListener(){
        usersAdminFilterUsernameSort.addEventListener("click", () => {
            usersAdminFilteringUsernameSort = sortButtonListener(
                usersAdminFilterUsernameSort, usersAdminFilteringUsernameSort
            )
            usersAdminGetAll()
        })
    }

    searchListener()
    searchEraseListener()
    sortListener()
}

function adminUsersFilterInitFullName(){
    function searchListener(){
        usersAdminFilterNameField.addEventListener("input", () => {
            const query = usersAdminFilterNameField.value.trim().toLowerCase()
            usersAdminFilteringFullName = query ? query : null
            usersAdminGetAll()
        })
    }

    function searchEraseListener(){
        usersAdminFilterNameErase.addEventListener("click", () => {
            usersAdminFilterNameField.value = ""
            usersAdminFilteringFullName = null
            usersAdminGetAll()
        })
    }

    function sortListener(){
        usersAdminFilterNameSort.addEventListener("click", () => {
            usersAdminFilteringFullNameSort = sortButtonListener(
                usersAdminFilterNameSort, usersAdminFilteringFullNameSort
            )
            usersAdminGetAll()
        })
    }

    searchListener()
    searchEraseListener()
    sortListener()
}

function adminUsersFilterInitRoles(){
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
        a.addEventListener("click", () =>{
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

function adminUsersFilterInitLastActivity(){
    function validateDates(){
        usersAdminActivityFilterDateStart.classList.remove("is-invalid")
        usersAdminActivityFilterDateEnd.classList.remove("is-invalid")
        if (timeUtilsValidateDate(usersAdminActivityFilterDateStart.value,
            usersAdminActivityFilterDateEnd.value)){
            return true
        } else {
            usersAdminActivityFilterDateStart.classList.add("is-invalid")
            usersAdminActivityFilterDateEnd.classList.add("is-invalid")
            return false
        }
    }

    function typeListeners(){
        usersAdminActivityFilterTypeAll.addEventListener("click", () => {
            usersAdminFilteringLastActivityType = null
            usersAdminGetAll()
        })
        usersAdminActivityFilterTypeWeb.addEventListener("click", () => {
            usersAdminFilteringLastActivityType = "web"
            usersAdminGetAll()
        })
        usersAdminActivityFilterTypeTelegram.addEventListener("click", () => {
            usersAdminFilteringLastActivityType = "tg"
            usersAdminGetAll()
        })
        usersAdminActivityFilterTypeReg.addEventListener("click", () => {
            usersAdminFilteringLastActivityType = "reg"
            usersAdminGetAll()
        })
    }

    function dateListeners(){
        usersAdminActivityFilterDateStart.addEventListener("input", () => {
            if (validateDates()){
                usersAdminFilteringLastActivityDateStart = usersAdminActivityFilterDateStart.value
                usersAdminGetAll()
            }
        })
        usersAdminActivityFilterDateEnd.addEventListener("input", () => {
            if (validateDates()){
                usersAdminFilteringLastActivityDateEnd = usersAdminActivityFilterDateEnd.value
                usersAdminGetAll()
            }
        })
    }

    function dateEraseListeners(){
        usersAdminActivityFilterDateStartErase.addEventListener("click", () => {
            usersAdminActivityFilterDateStart.value = ""
            usersAdminFilteringLastActivityDateStart = null
            usersAdminGetAll()
        })
        usersAdminActivityFilterDateEndErase.addEventListener("click", () => {
            usersAdminActivityFilterDateEnd.value = ""
            usersAdminFilteringLastActivityDateEnd = null
            usersAdminGetAll()
        })
    }

    function sortListeners(){
        usersAdminActivityFilterSort.addEventListener("click", () => {
            usersAdminFilteringIDSort = sortButtonListener(
                usersAdminActivityFilterSort, usersAdminFilteringIDSort
            )
            usersAdminGetAll()
        })
    }

    typeListeners()
    dateListeners()
    dateEraseListeners()
    sortListeners()
}

function adminUsersFilterSetEraseListeners() {
    usersAdminFilterEraseAll.addEventListener("click", () => {
        usersAdminFilterIDField.value = ""
        usersAdminFilterIDSort.classList.remove("btn-primary")
        usersAdminFilterIDSort.classList.add("btn-outline-secondary")
        usersAdminFilterIDSort.innerHTML = '<i class="bi bi-chevron-bar-expand"></i>'
        usersAdminFilterTGAll.checked = true
        usersAdminFilterTGConnected.checked = false
        usersAdminFilterTGDisconnected.checked = false
        usersAdminFilterUsernameField.value = ""
        usersAdminFilterUsernameSort.classList.remove("btn-primary")
        usersAdminFilterUsernameSort.classList.add("btn-outline-secondary")
        usersAdminFilterUsernameSort.innerHTML = '<i class="bi bi-chevron-bar-expand"></i>'
        usersAdminFilterNameField.value = ""
        usersAdminFilterNameSort.classList.remove("btn-primary")
        usersAdminFilterNameSort.classList.add("btn-outline-secondary")
        usersAdminFilterNameSort.innerHTML = '<i class="bi bi-chevron-bar-expand"></i>'
        usersAdminFilterRoleList.querySelectorAll("a").forEach(role => {
            role.classList.remove("active")
        })
        usersAdminActivityFilterTypeAll.checked = true
        usersAdminActivityFilterTypeWeb.checked = false
        usersAdminActivityFilterTypeTelegram.checked = false
        usersAdminActivityFilterTypeReg.checked = false
        usersAdminActivityFilterDateStart.value = ""
        usersAdminActivityFilterDateEnd.value = ""
        usersAdminActivityFilterDateStart.classList.remove("is-invalid")
        usersAdminActivityFilterDateEnd.classList.remove("is-invalid")
        usersAdminActivityFilterSort.classList.remove("btn-primary")
        usersAdminActivityFilterSort.classList.add("btn-outline-secondary")
        usersAdminActivityFilterSort.innerHTML = '<i class="bi bi-chevron-bar-expand"></i>'
        usersAdminFilteringID = null
        usersAdminFilteringIDSort = null
        usersAdminFilteringTG = null
        usersAdminFilteringUsername = null
        usersAdminFilteringUsernameSort = null
        usersAdminFilteringFullName = null
        usersAdminFilteringFullNameSort = null
        usersAdminFilteringRole.length = 0
        usersAdminFilteringLastActivityType = null
        usersAdminFilteringLastActivityDateStart = null
        usersAdminFilteringLastActivityDateEnd = null
        usersAdminFilteringLastActivityDateSort = null

        usersAdminGetAll()
    })
}

//ID | TG
const usersAdminFilterIDField = document.querySelector("#usersAdminFilterIDField")
const usersAdminFilterTGAll = document.querySelector("#usersAdminFilterTGAll")
const usersAdminFilterTGConnected = document.querySelector("#usersAdminFilterTGConnected")
const usersAdminFilterTGDisconnected = document.querySelector("#usersAdminFilterTGDisconnected")
const usersAdminFilterIDErase = document.querySelector("#usersAdminFilterIDErase")
const usersAdminFilterIDSort = document.querySelector("#usersAdminFilterIDSort")

//Username | Login
const usersAdminFilterUsernameField = document.querySelector("#usersAdminFilterUsernameField")
const usersAdminFilterUsernameErase = document.querySelector("#usersAdminFilterUsernameErase")
const usersAdminFilterUsernameSort = document.querySelector("#usersAdminFilterUsernameSort")

//Fullname
const usersAdminFilterNameField = document.querySelector("#usersAdminFilterNameField")
const usersAdminFilterNameErase = document.querySelector("#usersAdminFilterNameErase")
const usersAdminFilterNameSort = document.querySelector("#usersAdminFilterNameSort")

//Role
const usersAdminFilterRoleList = document.querySelector("#usersAdminFilterRoleList")

//Last Activity
const usersAdminActivityFilterSort = document.querySelector("#usersAdminActivityFilterSort")
const usersAdminActivityFilterTypeAll = document.querySelector("#usersAdminActivityFilterTypeAll")
const usersAdminActivityFilterTypeWeb = document.querySelector("#usersAdminActivityFilterTypeWeb")
const usersAdminActivityFilterTypeTelegram = document.querySelector("#usersAdminActivityFilterTypeTelegram")
const usersAdminActivityFilterTypeReg = document.querySelector("#usersAdminActivityFilterTypeReg")
const usersAdminActivityFilterDateStart = document.querySelector("#usersAdminActivityFilterDateStart")
const usersAdminActivityFilterDateStartErase = document.querySelector("#usersAdminActivityFilterDateStartErase")
const usersAdminActivityFilterDateEnd = document.querySelector("#usersAdminActivityFilterDateEnd")
const usersAdminActivityFilterDateEndErase = document.querySelector("#usersAdminActivityFilterDateEndErase")

//Erase
const usersAdminFilterEraseAll = document.querySelector("#usersAdminFilterEraseAll")

adminUsersFilterMain()