const db = require("../utils/database");

const { genDocumentId } = require("../utils/generate");

const runMigrate = async() => {
    const results = await db.query(
        "SELECT * FROM employee ORDER BY employee_id",
        []
    );

    if (results[0].length > 0) {
        for (let result of results[0]) {
            
            const genDocumentIdResult = await genDocumentId("EP", "employee");

            console.log('res', result.employee_id, genDocumentIdResult.document_id);

            let sql = "UPDATE employee SET employee.employee_document_id = ? where employee.employee_id = ?";
            await db.query(sql, [genDocumentIdResult.document_id, result.employee_id]);
        }
    }
};

runMigrate().then(() => {
    console.log('completed');
    process.exit(0);
});
