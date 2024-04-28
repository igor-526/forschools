async function HWAddMain(){
    await HWAddSetTeachersListeners()
}

async function HWAddSetTeachersListeners(){

}

function HWAddReset(){

}

function HWAddClientValidation(){

}

function HWAddServerValidation(errors){

}

function HWAddSearchListeners(){

}

function HWAddSave(go=false){

}




//Bootstrap elements
const homeworksAddOffcanvas = document.querySelector("#HomeworksAddOffcanvas")
const bsHomeworksAddOffcanvas = new bootstrap.Offcanvas(homeworksAddOffcanvas)

//Form
const HWAddForm = homeworksAddOffcanvas.querySelector("#HomeworksAddOffcanvasForm")
const HWAddNameField = HWAddForm.querySelector("#HomeworksAddOffcanvasNameField")
const HWAddNameError = HWAddForm.querySelector("#HomeworksAddOffcanvasNameError")
const HWAddDescriptionField = HWAddForm.querySelector("#HomeworksAddOffcanvasDescriptionField")
const HWAddDescriptionError = HWAddForm.querySelector("#HomeworksAddOffcanvasDescriptionError")
const HWAddDeadlineField = HWAddForm.querySelector("#HomeworksAddOffcanvasDeadlineField")
const HWAddDeadlineError = HWAddForm.querySelector("#HomeworksAddOffcanvasDeadlineError")
const HWAddTeacherField = HWAddForm.querySelector("#HomeworksAddOffcanvasTeacherField")
const HWAddTeacherError = HWAddForm.querySelector("#HomeworksAddOffcanvasTeacherError")
const HWAddListenersSearchField = HWAddForm.querySelector("#HomeworksAddOffcanvasListenersSearchField")
const HWAddListenersSelect = HWAddForm.querySelector("#HomeworksAddOffcanvasListenersSelect")
const HWAddListenersError = HWAddForm.querySelector("#HomeworksAddOffcanvasListenersError")
const HWAddMaterialsList = HWAddForm.querySelector("#HomeworksAddOffcanvasMaterialsList")
const HWAddMaterialsAddButton = HWAddForm.querySelector("#HomeworksAddOffcanvasMaterialsAddButton")
const HWAddSaveAndGoButton = HWAddForm.querySelector("#HomeworksAddOffcanvasSaveAndGoButton")
const HWAddSaveButton = HWAddForm.querySelector("#HomeworksAddOffcanvasSaveButton")

HWAddMain()
