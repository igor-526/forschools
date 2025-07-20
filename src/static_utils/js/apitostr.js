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

    async APIPostPatchToObject(request){
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

    async post(){
        const init = {
            method: 'POST',
            credentials: 'same-origin',
            headers:{
                "X-CSRFToken": csrftoken,
            },
        }
        if (this.formData){
            init["body"] = this.formData
        }
        const request = await fetch(this._getFullUrl(), init)
        return APIPostPatchToObject(request)
    }

    async patch(){
        const init = {
            method: 'PATCH',
            credentials: 'same-origin',
            headers:{
                "X-CSRFToken": csrftoken,
            },
        }
        if (this.formData){
            init["body"] = this.formData
        }
        const request = await fetch(this._getFullUrl(), init)
        return APIPostPatchToObject(request)
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