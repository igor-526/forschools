async function generatedAPIGetAll(types=[], initiators=[],
                                  dateFrom=null, dateTo=null,
                                  complete=null){
    let url = "/api/v1/generated/"
    const queryParams = []
    types.forEach(type => {
        queryParams.push(`type=${type}`)
    })
    initiators.forEach(initiator => {
        queryParams.push(`initiator=${initiator}`)
    })
    if (dateFrom){
        queryParams.push(`date_from=${dateFrom}`)
    }
    if (dateTo){
        queryParams.push(`date_to=${dateTo}`)
    }
    if (complete){
        queryParams.push(`complete=${complete}`)
    }
    if (queryParams.length > 0){
        url += "?" + queryParams.join("&")
    }
    const request = await fetch(url)
    return APIGetToObject(request)
}