async function eventsJournalAPIGetAll(offset=0, events=[], users=[], initiators=[],
                                      ds= null, de= null){
    let url = '/api/v1/users/events_journal/'
    const searchParams=[]
    if (offset){
        searchParams.push(`offset=${offset}`)
    }
    events.forEach(event => {
        searchParams.push(`event=${event}`)
    })
    users.forEach(user => {
        searchParams.push(`user=${user}`)
    })
    initiators.forEach(initiator => {
        searchParams.push(`initiator=${initiator}`)
    })
    if (ds){
        searchParams.push(`date_start=${ds}`)
    }
    if (de){
        searchParams.push(`date_end=${de}`)
    }
    if (searchParams.length > 0){
        url += "?"+searchParams.join("&")
    }
    const request = await fetch(url)
    return await APIGetToObject(request)
}