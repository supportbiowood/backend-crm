const engineerPermission = require('./permission/engineer.json');
const salePermission = require("./permission/sale.json");
const adminPermission = require("./permission/setting.json");
const allPermission = { ...adminPermission, ...salePermission, ...engineerPermission };
/**
 * union all role's permission
 * @param {array of object} rolesList list of role object
 * @returns {array of string} return list of permission name
 */
const mergePermission = (rolesList) => {
    let permissionList = [];
    rolesList.map((role) => {
        permissionList.push(...role.permission_list);
    });
    permissionList = new Set(permissionList);
    permissionList = [...permissionList];
    return permissionList;
};
/**
 * return all permission object available
 * @returns {object} allPermission
 */

// const allPermission = () => {
//     let allPermission = [...salePermission, ...engineerPermission];
//     return allPermission;
// };

/**
 * Matching permission list with permission object and return matched permission object as a list
 * @param {array of string} permissionList list of string of permission
 * @returns {array of permission object} matched permission object list
 */
const matchPermissionObject = (permissionList) => {
    let permissionSet = new Set([...permissionList]);
    let matchedPermissionObject = {};
    for (const [key, value] of Object.entries(allPermission)) {
        if(permissionSet.has(key)) {
            matchedPermissionObject[key] = value;
        }
    }
    return matchedPermissionObject;
};

/**
 * Matching permission list with permission keys AKA. permission name and return matched permission key as a list
 * @param {array of string} permissionList list of string of permission
 * @returns {array of permission string} matched permission key list
 */
const matchPermissionName = (permissionList) => {
    let permissionSet = new Set([...permissionList]);
    let matchedPermissionKeys =
        Object.keys(allPermission)
            .filter(
                permissionName =>
                    permissionSet.has(permissionName)
            );
    return [...matchedPermissionKeys];
};

module.exports = {
    mergePermission, allPermission, matchPermissionObject, matchPermissionName
};