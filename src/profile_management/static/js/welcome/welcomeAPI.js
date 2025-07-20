class WelcomeAPI extends BaseAPI{
    constructor(welcomeUrlCode = null) {
        super("welcome", welcomeUrlCode);
    }

    async setupWelcome(formData){
        this.objMethod = "set"
        this.formData = formData
        return await this.patch()
    }
}