// Browser-compatible RtmTokenBuilder2.js

class RtmTokenBuilder {
    static async buildToken(appId, appCertificate, userId, expire) {
        let token = new AccessToken2(appId, appCertificate, null, expire)

        let serviceRtm = new ServiceRtm(userId)
        serviceRtm.add_privilege(ServiceRtm.kPrivilegeLogin, expire)
        token.add_service(serviceRtm)

        return await token.build()
    }
}

window.RtmTokenBuilder = RtmTokenBuilder
