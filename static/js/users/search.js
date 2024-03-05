function filterSet(userObj, formData){
    const username = new RegExp(formData.get("username").toLowerCase())
    const name = new RegExp(formData.get("name").toLowerCase())
    const role = formData.get("role")
    let statusUsername
    let statusName
    let statusRole
    if (formData.get("username") !== ""){
        statusUsername = username.test(userObj.username.toLowerCase());
    } else {
        statusUsername = true
    }
    if (formData.get("name") !== "") {
        statusName = name.test(userObj.first_name.toLowerCase()) || name.test(userObj.last_name.toLowerCase());
    } else {
        statusName = true
    }
    if (role !== "none"){
        statusRole = userObj.groups[0].name.match(role)
    } else {
        statusRole = true
    }
    return statusUsername && statusName && statusRole
}

function search(){
    const formData = new FormData(usersSearchForm)
    if (formData.get("username") !== "" ||
        formData.get("name") !== "" ||
        formData.get("role") !== "none"){
        const result = userSet.filter(u => filterSet(u, formData))
        showUsers(result)
    } else {
        showUsers()
    }
}

//Forms
const usersSearchForm = document.querySelector("#UsersCollapseSearchForm")

//Fields
const usersSearchUsername = document.querySelector("#UsersCollapseSearchUsername")
const usersSearchName = document.querySelector("#UsersCollapseSearchName")
const usersSearchRole = document.querySelector("#UsersCollapseSearchRole")

userSearchFields = [usersSearchUsername, usersSearchName, usersSearchRole]

userSearchFields.forEach(field => {
    field.addEventListener('input', search)
})