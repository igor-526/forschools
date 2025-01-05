async function userLogsAPIGetActions(planID=null, date_from=null, date_to=null,
                                     homeworks=true, tgJournal=true, messages=true,
                                     lessons=true, plans=true){
    let url = "/api/v1/user_logs/"
    if (planID){
        url += `plan${planID}/`
    }
    const queryParams = []
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