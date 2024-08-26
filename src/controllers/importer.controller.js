import ImporterModel from "../models/importer.model";

exports.import = async (req, res) => {
    try {
        let data = req.body.data;
        let tableName = req.body.table_name;
        
        const result = await ImporterModel.import(data, tableName, req.user);

        return res.send({
            status: "success",
            data: result,
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: `${error}`,
        });
    }
};
