@Component({
    selector: "security",
    provider: []
})
class {

    constructor(
        AUTH,
        ACCESS_CONTROL
    ) {
        this.firewall = this.firewall.bind({ACCESS_CONTROL: ACCESS_CONTROL})
        this.auth = this.auth.bind({AUTH: AUTH})
    }

    firewall(req, res, next: Function) {
        try {
            var path = req.path;
            for (var i in this.ACCESS_CONTROL) {

                var access = this.ACCESS_CONTROL[i];
                var m = new RegExp('^' + access.path + '$', 'gi');
                /*match*/
                if (path.match(m)) {
                    var sess = req.session;
                    var ipsess = sess.ip;
                    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress.split(":").pop();
                    if (ipsess) {
                        if (ipsess !== ip) {
                            throw "THIS IS NOT YOUR IP"
                        }
                    } else {
                        sess.ip = ip;
                    }
                    //TO DO DDOS

                    if (access.hasOwnProperty("whiteip")) {
                        var inlist = false;
                        for (var j in access.whiteip) {
                            if (access.whiteip[j] === ip) {
                                inlist = true;
                                break;
                            }
                        }
                        if (!inlist) {
                            throw "not allow your are not in white list"
                        }
                        ;
                    }

                    next({roles: access.roles, auth: access.auth});
                    return true;
                }
            }

            next();
        } catch (err) {
            res.status(401).send(err);
            return false;
        }

    }

    auth(options, req, res, next) {
        try {
            switch (options.roles) {
                default:
                    var authName = options.auth;
                    if (authName) {
                        if (this.AUTH.hasOwnProperty(authName)) {
                            throw "auth name " + authName + " don't exist no luck";
                        } else {
                            var auth = this.AUTH.authName];
                            if (auth.stateless) {
                                throw "you can try to login in session  ";
                            } else {
                                throw "you can try to login out of session  ";
                            }
                        }
                    }
                    throw "you need to be identified " + options.roles;
                    break;
                case "IS_AUTHENTICATED_ANONYMOUSLY":
                    next();
                    return false;
                    break;
                case "DENY_ALL":
                    throw "not allow";
                    break;
            }
        } catch (err) {
            res.status(401).send(err);
            return false;
        }
    }

}
