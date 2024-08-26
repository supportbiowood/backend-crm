import db from "../utils/database";
import EmployeeModel from "../models/employee.model";

const Importer = {};

const ImporterEnum = {
    employee: {
        model: EmployeeModel,
        map: {
            "name": "employee_firstname",
            "email": "employee_email",
            "sex": "employee_lastname"
        }
    }
};
/**
 * 
 * @param {DataObject} data - data object eg name, email, sex
 * @param {String} tableName - name of specify table
 * @param {user} user - usually req.user 
 * @returns either return true // imported
 *                    or  error // not imported
 */
Importer.import = async (data, tableName, user) => {
    const importer = ImporterEnum[tableName];
    try {
        if (importer) {
            for (let datum of data) {
                let modelData = {};
                let map = importer.map;
                Object.keys(map).forEach((key) => {
                    modelData[map[key]] = datum[key];
                });
                let model = new importer.model(modelData);
                await importer.model.create(model, user);
            }
            return true;
        }
        throw new Error("Importer Not Found");
    } catch (e) {
        console.trace(e);
        throw (e);
    }
};

module.exports = Importer;