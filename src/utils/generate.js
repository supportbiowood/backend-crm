const moment = require("moment");

const runningDocumentIdModel = require("../models/runningDocumentId.model");

const Generate = {
    genDocumentId: async (document_prefix, document_type) => {
        function generatePrefixId(length) {
            let prefixId = "";
            for (let i = 0; i < length; i++) {
                prefixId = prefixId + "0";
            }
            return prefixId;
        }
      
        let result = {};
        // const result = await quotationModel.getQuotationDocumentId();
        let last_document_id_data = await runningDocumentIdModel.getByType(
            document_type
        );
      
        let this_year = moment().format("YY");
      
        let this_month = moment().format("MM");
      
        if (last_document_id_data !== undefined) {
            let last_document_id = last_document_id_data.last_document_id;
      
            let old_year = last_document_id_data.document_year;
      
            let old_month = last_document_id_data.document_month;
      
            if (old_year == this_year) {
                if (old_month == this_month) {
                    let id =
                parseInt(
                    last_document_id.substring(
                        last_document_id.length - 5,
                        last_document_id.length
                    )
                ) + 1;
                    let id_leng = id.toString().length;
                    let prefixId = generatePrefixId(5 - id_leng);
                    let document_id =
                document_prefix + this_year + this_month + prefixId + id;
                    let document_data = {
                        last_document_id: document_id,
                        document_year: this_year,
                        document_month: this_month,
                    };
                    await runningDocumentIdModel.update(document_type, document_data);
                    result.document_id = document_id;
                    return result;
                } else {
                    let id = 1;
                    let id_leng = id.toString.length;
                    let prefixId = generatePrefixId(5 - id_leng);
                    let document_id =
                document_prefix + this_year + this_month + prefixId + id;
                    let document_data = {
                        last_document_id: document_id,
                        document_year: this_year,
                        document_month: this_month,
                    };
                    await runningDocumentIdModel.update(document_type, document_data);
                    result.document_id = document_id;
                    return result;
                }
            } else {
                let id = 1;
                let id_leng = id.toString.length;
                let prefixId = generatePrefixId(5 - id_leng);
                let document_id =
              document_prefix + this_year + this_month + prefixId + id;
                let document_data = {
                    last_document_id: document_id,
                    document_year: this_year,
                    document_month: this_month,
                };
                await runningDocumentIdModel.update(document_type, document_data);
                result.document_id = document_id;
                return result;
            }
        } else {
            let prefixId = generatePrefixId(4);
            let document_data = {
                document_type: document_type,
                last_document_id: document_prefix + this_year + this_month + prefixId + 1,
                document_year: this_year,
                document_month: this_month,
            };
            const newLastDocumentIdData = new runningDocumentIdModel(document_data);
            await runningDocumentIdModel.create(newLastDocumentIdData);
            result.document_id = document_data.last_document_id;
            return result;
        }
    }
};

module.exports = Generate;