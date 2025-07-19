class BaseAPI{
    base_url = "/api/v1/"
    obj = null
    objID = null
    objMethod = null
    formData = null


    constructor(obj = null, objID = null) {
        this.obj = obj
        this.objID = objID
    }

    set formData(formData){
        this.formData = formData
    }

    _getFullUrl(){
        let url = this.base_url
        if (this.obj !== null){
            url += `${this.obj}/`
        }
        if (this.objID !== null){
            url += `${this.objID}/`
        }
        if (this.objMethod !== null){
            url += `${this.objMethod}/`
        }
        return url
    }

    async _APIGetToObject(request){
        if (request.status !== 500){
            return {
                status: request.status,
                response: await request.json()
            }
        } else {
            return {status: 500}
        }
    }

    async get(){
        const request = await fetch(this._getFullUrl())
        return await this._APIGetToObject(request)
    }
}

async function APIGetToObject(request){
    if (request.status !== 500){
        return {
            status: request.status,
            response: await request.json()
        }
    } else {
        return {status: 500}
    }

}

async function APIPostPatchToObject(request){
    if (request.status !== 500){
        return {
            status: request.status,
            response: await request.json()
        }
    } else {
        return {status: 500}
    }
}

async function APIDeleteToObject(request){
    return {status: request.status}
}