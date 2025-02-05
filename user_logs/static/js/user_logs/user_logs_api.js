async function userLogsAPIGetActions(offset=null, planID=null, date_from=null, date_to=null,
                                     homeworks=true, tgJournal=true, messages=true,
                                     lessons=true, plans=true){
    let url = "/api/v1/user_logs/"
    if (planID){
        url += `plan${planID}/`
    }
    const queryParams = []
    if (offset){
        queryParams.push(`offset=${offset}`)
    }
    if (date_from){
        queryParams.push(`date_from=${date_from.toISOString()}`)
    }
    if (date_from){
        queryParams.push(`date_to=${date_to.toISOString()}`)
    }
    if (homeworks){
        queryParams.push('homeworks=true')
    }
    if (tgJournal){
        queryParams.push('tg_journal=true')
    }
    if (messages){
        queryParams.push('messages=true')
    }
    if (lessons){
        queryParams.push('lessons=true')
    }
    if (plans){
        queryParams.push('plans=true')
    }
    if (queryParams.length > 0){
        url += "?" + queryParams.join("&")
    }
    const request = await fetch(url)
    return APIGetToObject(request)
}

async function userLogsAPIGetMessagesUsers(planID=null, selectedFirstUser=null){
    let url = `/api/v1/user_logs/plan${planID}/messages/`
    const queryParams = []
    if (selectedFirstUser){
        queryParams.push(`selected_first_user=${selectedFirstUser}`)
    }
    if (queryParams.length > 0){
        url += "?" + queryParams.join("&")
    }
    const request = await fetch(url)
    return APIGetToObject(request)
}

async function userLogsAPIGetMessages(selectedFirstUser=null, selectedSecondUser=null){
    let url = `/api/v1/user_logs/messages/`
    const queryParams = []
    if (selectedFirstUser){
        queryParams.push(`selected_first_user=${selectedFirstUser}`)
    }
    if (selectedSecondUser){
        queryParams.push(`selected_second_user=${selectedSecondUser}`)
    }
    if (queryParams.length > 0){
        url += "?" + queryParams.join("&")
    }
    const request = await fetch(url)
    return APIGetToObject(request)
}