async function usersGetTeachers(){
    const request = await fetch("/api/v1/users?group=teachers")
    return await APIGetToObject(request)
}