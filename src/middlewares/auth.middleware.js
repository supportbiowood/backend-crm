/**
 * Check if has permission
 * @param {*} requirePermission can be either Array of string or string
 * @returns return middleware function
 */
exports.hasPermission = (requirePermission) => {
    return async (req, res, next) => {
        let requiredPermissionList = typeof requirePermission === 'string' ? [requirePermission] : [...requirePermission];

        // if every required permission is included in user permission
        if (req.user.permission && Object.keys(req.user.permission).length > 0
            && requiredPermissionList.every(
                (permission) => Object.prototype.hasOwnProperty.call(req.user.permission, permission))) {
            next();
        } else {
            return res.status(401).send({
                status: "error",
                message: `unauthorized`,
            });
        }
    };
};

/**
 * Check if has role
 * @param {*} requireRole can be either Array of string or string
 * @returns return middleware function
 */
exports.hasRole = (requireRole) => {
    return async (req, res, next) => {
        let userRole = req.user.role.map(role => role.role_name);
        let requiredRoleList = typeof requireRole === 'string' ? [requireRole] : [...requireRole];
        // if every required role is included in user's role
        if (userRole.length > 0
            && requiredRoleList.every(
                (role) => userRole.indexOf(role) >= 0)) {
            next();
        } else {
            return res.status(401).send({
                status: "error",
                message: `unauthorized`,
            });
        }
    };
};