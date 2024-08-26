const item = {
    validateItemSale: (salesData) => {
        let totalItemCount = 0;
        salesData.map(group => group.category_list.map(categoryObj => {
            totalItemCount = totalItemCount + categoryObj.item_data.length;
        }));
        if (totalItemCount > 0) {
            totalItemCount;
        } else {
            throw new Error("กรุณาระบุรายการสินค้า");
        }
    },
    validateItemPurchase: (purchasesData) => {
        purchasesData.map(item => {
            if (!item.item_id || item.item_id.length <= 0) {
                throw new Error("กรุณาระบุรายการสินค้า");
            }
        });
    },
    validateItemDepositInvoice: (depositInvoiceData) => {
        if (!depositInvoiceData || depositInvoiceData.length <= 0) {
            throw new Error("กรุณาระบุรายการแจ้งหนี้มัดจำ");
        }
        depositInvoiceData.map(diData => {
            if (!diData.pre_vat_amount || diData.pre_vat_amount <= 0) {
                throw new Error("กรุณาระบุยอดก่อนภาษี");
            }
        });
    }
};
module.exports = item;