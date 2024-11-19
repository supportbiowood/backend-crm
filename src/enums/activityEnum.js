const ActivityRefTypeOwnerType = (projectActivityEnum) => {
    switch (projectActivityEnum) {
        case ActivityRefTypeEnum.QUOTATION:
            return "DOCUMENT_QUOTATION";
        case ActivityRefTypeEnum.SALES_ORDER:
            return "DOCUMENT_SALES_ORDER";
        case ActivityRefTypeEnum.SALES_INVOICE:
            return "DOCUMENT_SALES_INVOICE";
        case ActivityRefTypeEnum.DEPOSIT_INVOICE:
            return "DOCUMENT_DEPOSIT_INVOICE";
        case ActivityRefTypeEnum.PAYMENT_RECEIPT:
            return "DOCUMENT_PAYMENT_RECEIPT";
        case ActivityRefTypeEnum.BILLING_NOTE:
            return "DOCUMENT_BILLING_NOTE";
        case ActivityRefTypeEnum.SALES_RETURN:
            return "DOCUMENT_SALES_RETURN";
        case ActivityRefTypeEnum.CREDIT_NOTE:
            return "DOCUMENT_CREDIT_NOTE";
        case ActivityRefTypeEnum.PURCHASE_INVOICE:
            return "DOCUMENT_PURCHASE_INVOICE";
        case ActivityRefTypeEnum.PURCHASE_ORDER:
            return "DOCUMENT_PURCHASE_ORDER";
        case ActivityRefTypeEnum.PURCHASE_REQUEST:
            return "DOCUMENT_PURCHASE_REQUEST";
        case ActivityRefTypeEnum.PAYMENT_MADE:
            return "DOCUMENT_PAYMENT_MADE";
        case ActivityRefTypeEnum.COMBINED_PAYMENT:
            return "DOCUMENT_COMBINED_PAYMENT";
        case ActivityRefTypeEnum.DEBIT_NOTE:
            return "DOCUMENT_DEBIT_NOTE";
        case ActivityRefTypeEnum.PROJECT:
            return "PROJECT";
        case ActivityRefTypeEnum.ENGINEER:
            return "ENGINEER";
        default:
            return "";
    }
};

const ActivityRefTypeEnum = {
    QUOTATION: "quotation",
    SALES_ORDER: "sales_order",
    SALES_INVOICE: "sales_invoice",
    DEPOSIT_INVOICE: "deposit_invoice",
    PAYMENT_RECEIPT: "payment_receipt",
    BILLING_NOTE: "billing_note",
    SALES_RETURN: "sales_return",
    CREDIT_NOTE: "credit_note",
    PURCHASE_INVOICE: "purchase_invoice",
    PURCHASE_ORDER: "purchase_order",
    PURCHASE_REQUEST: "purchase_request",
    PAYMENT_MADE: "payment_made",
    COMBINED_PAYMENT: "combined_payment",
    DEBIT_NOTE: "debit_note",
    DELIVERY_NOTE: "delivery_note",
    PROJECT: "project",
    ENGINEER: "engineer"
};

const ActivityDocumentCategory = {
    SALES_ACCOUNT: "sales_account",
    PURCHASES_ACCOUNT: "purchases_account",
    ENGINEER: "engineer",
    LOGISTIC: "logistic"
};

const ActivityRefTypeDocumentThaiName = (projectActivityEnum) => {
    switch (projectActivityEnum) {
        case ActivityRefTypeEnum.QUOTATION:
            return "ใบเสนอราคา";
        case ActivityRefTypeEnum.SALES_ORDER:
            return "ใบสั่งขาย";
        case ActivityRefTypeEnum.SALES_INVOICE:
            return "ใบแจ้งหนี้";
        case ActivityRefTypeEnum.DEPOSIT_INVOICE:
            return "ใบแจ้งหนี้มัดจำ";
        case ActivityRefTypeEnum.PAYMENT_RECEIPT:
            return "ใบการชำระเงิน";
        case ActivityRefTypeEnum.BILLING_NOTE:
            return "ใบวางบิล";
        case ActivityRefTypeEnum.SALES_RETURN:
            return "ใบส่งคืน";
        case ActivityRefTypeEnum.CREDIT_NOTE:
            return "ใบลดหนี้";
        case ActivityRefTypeEnum.PURCHASE_INVOICE:
            return "ใบบันทึกซื้อ";
        case ActivityRefTypeEnum.PURCHASE_ORDER:
            return "ใบสั่งซื้อ";
        case ActivityRefTypeEnum.PURCHASE_REQUEST:
            return "ใบขอซื้อ";
        case ActivityRefTypeEnum.PAYMENT_MADE:
            return "ใบชำระเงิน";
        case ActivityRefTypeEnum.COMBINED_PAYMENT:
            return "ใบรวมจ่าย";
        case ActivityRefTypeEnum.DEBIT_NOTE:
            return "ใบเพิ่มหนี้";
        case ActivityRefTypeEnum.ENGINEER:
            return "ใบถอดแบบ/ติดตั้ง";
        default:
            return "";
    }
};

export { ActivityRefTypeOwnerType, ActivityRefTypeEnum, ActivityDocumentCategory, ActivityRefTypeDocumentThaiName };