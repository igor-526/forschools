function usersAdminMain(){
    usersAdminGetAll()
}


function usersAdminGetAll(){
    usersAPIGetAll(
        null, usersAdminFilteringID, usersAdminFilteringTG, usersAdminFilteringUsername,
        usersAdminFilteringFullName, usersAdminFilteringRole, usersAdminFilteringUsernameSort,
        usersAdminFilteringFullNameSort, usersAdminFilteringIDSort, true,
        usersAdminFilteringLastActivityDateStart, usersAdminFilteringLastActivityDateEnd,
        usersAdminFilteringLastActivityDateSort, usersAdminFilteringLastActivityType
    ).then(request => {
        switch (request.status){
            case 200:
                usersAdminShow(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function usersAdminShow(users = [], updateTD=null){
    function getUserElement(user){
        const usrUtils = new userUtils(user)
        return usrUtils.getAdminTableElement()
    }

    usersAdminTableBody.innerHTML = ""
    users.forEach(user => {
        usersAdminTableBody.insertAdjacentElement("beforeend", getUserElement(user))
    })
}

const usersAdminTableBody = document.querySelector('#UsersTableBody')

//Filtering
let usersAdminFilteringID = null
let usersAdminFilteringTG = null
let usersAdminFilteringUsername = null
let usersAdminFilteringFullName = null
const usersAdminFilteringRole = []
let usersAdminFilteringUsernameSort = null
let usersAdminFilteringFullNameSort = null
let usersAdminFilteringIDSort = null
let usersAdminFilteringLastActivityDateStart = null
let usersAdminFilteringLastActivityDateEnd = null
let usersAdminFilteringLastActivityType = null
let usersAdminFilteringLastActivityDateSort = null

usersAdminMain()