function homeworkListFilterMAMain(){
    homeworkListMAFiltersButton.addEventListener("click", function () {
        bsHomeworkListMAFiltersOffcanvas.show()
    })
    homeworkListFilterMAFieldsListener()
    homeworkListFilterMAMainEraseListener()
    homeworkListFilterMASetTeachersAndListeners()
}

function homeworkListFilterMASetTeachersAndListeners(){
    function getListener(element, filterList, userID){
        const index = filterList.indexOf(userID)
        switch (index){
            case -1:
                element.classList.add("active")
                filterList.push(userID)
                break
            default:
                element.classList.remove("active")
                filterList.splice(index, 1)
                break
        }
    }

    function getElement(user, filterList){
        const a = document.createElement("a")
        a.classList.add("dropdown-item")
        a.href = "#"
        a.innerHTML = `${user.first_name} ${user.last_name}`
        a.addEventListener("click", function () {
            getListener(a, filterList, user.id)
        })
        return a
    }

    if (homeworkListMASettingTeacher){
        usersAPIGetTeachers().then(request => {
            switch (request.status){
                case 200:
                    request.response.forEach(user => {
                        homeworkListMAFiltersOffcanvasTeacherList.insertAdjacentElement("beforeend",
                            getElement(user, homeworkListMAFiltersTeachers))
                    })
                    break
                default:
                    alert("Не удалось загрузить список преподавателей для фильтрации")
                    break
            }
        })
    }
    if (homeworkListMASettingListener){
        usersAPIGetListeners().then(request => {
            switch (request.status){
                case 200:
                    request.response.forEach(user => {
                        homeworkListMAFiltersOffcanvasListenerList.insertAdjacentElement("beforeend",
                            getElement(user, homeworkListMAFiltersListeners))
                    })
                    break
                default:
                    alert("Не удалось загрузить список учеников для фильтрации")
                    break
            }
        })
    }
}

function homeworkListFilterMASetSearchListeners(){
    homeworkListMAFiltersOffcanvasListenerSearchField.addEventListener("input", function () {

    })
    homeworkListMAFiltersOffcanvasTeacherSearchField.addEventListener("input", function () {

    })
}

function homeworkListFilterMAFieldsListener(){
    homeworkListMAFilterName.addEventListener("change", function (){
        if (homeworkListMAFilterName.value.trim() !== ""){
            homeworkListMAFiltersName = homeworkListMAFilterName.value.trim()
        } else {
            homeworkListMAFiltersName = null
        }
        homeworkListMAGet()
    })
}

function homeworkListFilterMAMainEraseListener(){
    function eraseName(){
        homeworkListMAFilterName.value = ""
        homeworkListMAFiltersName = null
    }

    homeworkListMAFilterNameErase.addEventListener("click", function () {
        eraseName()
        homeworkListMAGet()
    })
}

const homeworkListMAFiltersButton = homeworkListMATabs.querySelector("#homeworkListMAFiltersButton")
const homeworkListMAFilterName = document.querySelector("#homeworkListMAFilterName")
const homeworkListMAFilterNameErase = document.querySelector("#homeworkListMAFilterNameErase")

const homeworkListMAFiltersOffcanvas = document.querySelector("#homeworkListMAFiltersOffcanvas")
const bsHomeworkListMAFiltersOffcanvas = new bootstrap.Offcanvas(homeworkListMAFiltersOffcanvas)
const homeworkListMAFiltersOffcanvasResetAllButton = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasResetAllButton")
const homeworkListMAFiltersOffcanvasAcceptButton = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasAcceptButton")

const homeworkListMAFiltersOffcanvasListenerList = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasListenerList")
const homeworkListMAFiltersOffcanvasTeacherList = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasTeacherList")

const homeworkListMAFiltersOffcanvasAssignedFromField = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasAssignedFromField")
const homeworkListMAFiltersOffcanvasAssignedToField = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasAssignedToField")
const homeworkListMAFiltersOffcanvasChangedFromField = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasChangedFromField")
const homeworkListMAFiltersOffcanvasChangedToField = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasChangedToField")
const homeworkListMAFiltersOffcanvasListenerSearchField = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasListenerSearchField")
const homeworkListMAFiltersOffcanvasListenerSearchFieldErase = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasListenerSearchFieldErase")
const homeworkListMAFiltersOffcanvasTeacherSearchField = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasTeacherSearchField")
const homeworkListMAFiltersOffcanvasTeacherSearchFieldErase = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasTeacherSearchFieldErase")

homeworkListFilterMAMain()