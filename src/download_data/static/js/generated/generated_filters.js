generatedTypes = [
    {name: "Все планы обучения", code: 1}
]

function generatedFiltersMain(){
    generatedFiltersSetLists()
    generatedFiltersSetCompleteListeners()
    generatedFiltersSetDateListeners()
    generatedFiltersSetSearchListeners()
    generatedFiltersSetEraseListeners()
}

function generatedFiltersSetLists(){
    function getListener(array=[], element, id){
        const index = array.indexOf(id)
        switch (index){
            case -1:
                array.push(id)
                element.classList.add("active")
                break
            default:
                array.splice(index, 1)
                element.classList.remove("active")
                break
        }
        generatedGet()
    }

    function getElement(inner, id, array){
        const a = document.createElement("a")
        a.innerHTML = inner
        a.classList.add("dropdown-item")
        a.href = "#"
        a.addEventListener("click", function () {
            getListener(array, a, id)
        })
        return a
    }

    generatedTypes.forEach(type => {
        generatedTableFilterTypeList.insertAdjacentElement("beforeend",
            getElement(type.name, type.code, generatedFiltersType))
    })

    usersAPIGetAdmins().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(user => {
                    generatedTableFilterInitiatorList.insertAdjacentElement("beforeend",
                        getElement(`${user.first_name} ${user.last_name}`, user.id, generatedFiltersInitiator))
                })
                break
            default:
                showErrorToast("Не удалось загрузить список инициаторов для фильтрации")
                break
        }
    })
}

function generatedFiltersSetCompleteListeners(){
    generatedTableFilterCompleteAll.addEventListener("click", function () {
        generatedFiltersComplete = null
        generatedGet()
    })
    generatedTableFilterCompleteTrue.addEventListener("click", function () {
        generatedFiltersComplete = "true"
        generatedGet()
    })
    generatedTableFilterCompleteFalse.addEventListener("click", function () {
        generatedFiltersComplete = "false"
        generatedGet()
    })
}

function generatedFiltersSetDateListeners(){
    function validateDates(){
        generatedTableFilterDateStartField.classList.remove("is-invalid")
        generatedTableFilterDateEndField.classList.remove("is-invalid")
        let validationStatus = true
        const today = new Date().setHours(0, 0, 0 ,0)
        let start = null
        let end = null
        if (generatedTableFilterDateStartField.value !== ""){
            start = new Date(generatedTableFilterDateStartField.value).setHours(0, 0, 0 ,0)
            if (start > today){
                generatedTableFilterDateStartField.classList.add("is-invalid")
                validationStatus = false
            }
        }
        if (generatedTableFilterDateEndField.value !== ""){
            end = new Date(generatedTableFilterDateEndField.value).setHours(0, 0, 0 ,0)
            if (end > today){
                generatedTableFilterDateEndField.classList.add("is-invalid")
                validationStatus = false
            }
        }
        if (start && end){
            if (start > end){
                generatedTableFilterDateStartField.classList.add("is-invalid")
                generatedTableFilterDateEndField.classList.add("is-invalid")
                validationStatus = false
            }
        }
        return validationStatus
    }

    generatedTableFilterDateStartField.addEventListener("input", function () {
        if (validateDates()){
            generatedFiltersDateFrom = generatedTableFilterDateStartField.value === "" ? null : generatedTableFilterDateStartField.value
            generatedGet()
        }
    })
    generatedTableFilterDateEndField.addEventListener("input", function () {
        if (validateDates()){
            generatedFiltersDateTo = generatedTableFilterDateEndField.value === "" ? null : generatedTableFilterDateEndField.value
            generatedGet()
        }
    })
}

function generatedFiltersSetSearchListeners(){
    generatedTableFilterInitiatorSearchField.addEventListener("input", function () {
        const query = generatedTableFilterInitiatorSearchField.value.trim()
        if (query === ""){
            generatedTableFilterInitiatorList.querySelectorAll("a").forEach(elem => {
                elem.classList.remove("d-none")
            })
        } else {
            const queryRegExp = new RegExp(query.toLowerCase())
            generatedTableFilterInitiatorList.querySelectorAll("a").forEach(elem => {
                queryRegExp.test(elem.innerHTML.toLocaleLowerCase()) ? elem.classList.remove("d-none") : elem.classList.add("d-none")
            })
        }
    })
}

function generatedFiltersSetEraseListeners(){
    function eraseType(){
        generatedTableFilterTypeList.querySelectorAll("a").forEach(elem => {
            elem.classList.remove("active")
        })
        generatedFiltersType.length = 0
    }

    function eraseInitiator(reset = false){
        generatedTableFilterInitiatorSearchField.value = ""
        generatedTableFilterInitiatorList.querySelectorAll("a").forEach(elem => {
            elem.classList.remove("d-none")
            if (reset){
                elem.classList.remove("active")
            }
        })
        if (reset){
            generatedFiltersInitiator.length = 0
        }
    }

    function eraseDateStart(){
        generatedTableFilterDateStartField.value = ""
        generatedFiltersDateFrom = null
    }

    function eraseDateEnd(){
        generatedTableFilterDateEndField.value = ""
        generatedFiltersDateTo = null
    }

    function eraseComplete(){
        generatedTableFilterCompleteAll.checked = true
        generatedTableFilterCompleteTrue.checked = false
        generatedTableFilterCompleteFalse.checked = false
        generatedFiltersComplete = null
    }

    generatedTableFilterInitiatorSearchFieldReset.addEventListener("click", function () {
        eraseInitiator(true)
        generatedGet()
    })
    generatedTableFilterInitiatorSearchFieldErase.addEventListener("click", function () {
        eraseInitiator()
        generatedGet()
    })
    generatedTableFilterDateStartFieldErase.addEventListener("click", function () {
        eraseDateStart()
        generatedGet()
    })
    generatedTableFilterDateEndFieldErase.addEventListener("click", function () {
        eraseDateEnd()
        generatedGet()
    })
    generatedTableFilterResetAll.addEventListener("click", function () {
        eraseType()
        eraseInitiator(true)
        eraseDateStart()
        eraseDateEnd()
        eraseComplete()
        generatedGet()
    })
}

const generatedTableFilterResetAll = document.querySelector("#generatedTableFilterResetAll")
const generatedTableFilterTypeList = document.querySelector("#generatedTableFilterTypeList")
const generatedTableFilterInitiatorList = document.querySelector("#generatedTableFilterInitiatorList")
const generatedTableFilterInitiatorSearchFieldReset = document.querySelector("#generatedTableFilterInitiatorSearchFieldReset")
const generatedTableFilterInitiatorSearchField = document.querySelector("#generatedTableFilterInitiatorSearchField")
const generatedTableFilterInitiatorSearchFieldErase = document.querySelector("#generatedTableFilterInitiatorSearchFieldErase")
const generatedTableFilterDateStartField = document.querySelector("#generatedTableFilterDateStartField")
const generatedTableFilterDateStartFieldErase = document.querySelector("#generatedTableFilterDateStartFieldErase")
const generatedTableFilterDateEndField = document.querySelector("#generatedTableFilterDateEndField")
const generatedTableFilterDateEndFieldErase = document.querySelector("#generatedTableFilterDateEndFieldErase")
const generatedTableFilterCompleteAll = document.querySelector("#generatedTableFilterCompleteAll")
const generatedTableFilterCompleteTrue = document.querySelector("#generatedTableFilterCompleteTrue")
const generatedTableFilterCompleteFalse = document.querySelector("#generatedTableFilterCompleteFalse")



generatedFiltersMain()