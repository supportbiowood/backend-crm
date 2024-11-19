const salesInvoiceModel = require("../models/salesInvoice.model");
const billingNoteModel = require("../models/billingNote.model");
const paymentReceiptModel = require("../models/paymentReceipt.model");
const depositInvoiceModel = require("../models/depositInvoice.model");
const creditNoteModel = require("../models/creditNote.model");

const purchaseInvoiceModel = require("../models/purchaseInvoice.model");
const paymentMadeModel = require("../models/paymentMade.model");
const combinedPaymentModel = require("../models/combinedPayment.model");
const debitNoteModel = require("../models/debitNote.model");

const Calculate = {
    amountToPayOfSalesAccount: async (sales_invoice_document_id) => {
        const salesInvoiceResult = await salesInvoiceModel.getByDocumentId(
            sales_invoice_document_id
        );

        let salesInvoicePaymentList =
            await paymentReceiptModel.getByRefTypeAndRefDocumentId(
                "sales_invoice",
                salesInvoiceResult.sales_invoice_document_id
            );

        salesInvoicePaymentList = await salesInvoicePaymentList.filter(
            (siPayment) => siPayment.payment_receipt_status === "payment_complete"
        );

        const billingNoteList = await billingNoteModel.getBySalesInvoiceDocumentId(
            salesInvoiceResult.sales_invoice_document_id
        );

        let billingNotePaymentPrep = [];
        for (let billingNote of billingNoteList) {
            let bnPaymentReceiptResult = await paymentReceiptModel.getByRefTypeAndRefDocumentId("billing_note", billingNote.billing_note_document_id);

            for (let bnPaymentReceipt of bnPaymentReceiptResult) {
                if (bnPaymentReceipt.payment_receipt_status === "payment_complete") {
                    billingNotePaymentPrep.push(billingNote);
                }
            }
        }

        let billingNotePaymentList = [];
        for (let billingNote of billingNotePaymentPrep) {
            for (let document of billingNote.document_list) {
                if (
                    document.document_id === salesInvoiceResult.sales_invoice_document_id
                ) {
                    billingNotePaymentList.push(document);
                }
            }
        }

        let depositInvoiceListResult = await depositInvoiceModel.getBySalesInvoiceDocumentId(sales_invoice_document_id);
        let diPaymentReceiptPrep = [];

        for (let depositInvoice of depositInvoiceListResult) {
            let diPaymentReceiptList = await paymentReceiptModel.getByRefTypeAndRefDocumentId("deposit_invoice", depositInvoice.deposit_invoice_document_id);
            for (let diPaymentReceipt of diPaymentReceiptList) {
                if (diPaymentReceipt.payment_receipt_status === "payment_complete") {
                    diPaymentReceiptPrep.push(depositInvoice);
                }
            }
        }

        let creditNoteListResult = await creditNoteModel.getBySalesInvoiceDocumentId(sales_invoice_document_id);
        creditNoteListResult = await creditNoteListResult.filter((cn) => cn.credit_note_status === "closed");

        //calculate total_amount of all salesInvoicePaymentList
        let total_amount = diPaymentReceiptPrep.reduce(
            (previousValue, currentValue) => previousValue + currentValue.total_amount,
            0
        );

        //calculate total_amount of all salesInvoicePaymentList
        total_amount = salesInvoicePaymentList.reduce(
            (previousValue, currentValue) => previousValue + currentValue.total_amount,
            total_amount
        );

        //calculate total_amount continute of all billingNotePaymentList on field billing_note
        total_amount = billingNotePaymentList.reduce(
            (previousValue, currentValue) => previousValue + currentValue.billing_amount,
            total_amount
        );

        //calculate total_amount continute of all creditNoteList
        total_amount = creditNoteListResult.reduce(
            (previousValue, currentValue) => previousValue + currentValue.total_amount,
            total_amount
        );

        //amount_to_pay
        let amount_to_pay = salesInvoiceResult.total_amount - total_amount;

        return amount_to_pay;
    },
    amountToPayOfPurchaseAccount: async (purchase_invoice_document_id) => {
        const purchaseInvoiceResult = await purchaseInvoiceModel.getByDocumentId(purchase_invoice_document_id);

        let PIPaymentList = await paymentMadeModel.getByRefTypeAndRefDocumentId("purchase_invoice", purchaseInvoiceResult.purchase_invoice_document_id);
        PIPaymentList = await PIPaymentList.filter((pm) => pm.payment_made_status === "payment_complete");

        let combinedPaymentList = await combinedPaymentModel.getByPurchaseInvoiceDocumentId(purchase_invoice_document_id);

        let BNXPaymentListPrep = [];

        for (let combinedPayment of combinedPaymentList) {
            let BNXPaymentListResult = await paymentMadeModel.getByRefTypeAndRefDocumentId("combined_payment", combinedPayment.combined_payment_document_id);

            for (let paymentMade of BNXPaymentListResult) {
                if (paymentMade.payment_made_status === "payment_complete") {
                    BNXPaymentListPrep.push(combinedPayment);
                }
            }
        }

        let BNXPaymentList = [];
        for (let combinedPayment of BNXPaymentListPrep) {
            for (let document of combinedPayment.document_list) {
                if (document.document_id === purchase_invoice_document_id) {
                    BNXPaymentList.push(document);
                }
            }
        }

        let debitNoteList = await debitNoteModel.getAllByPurchaseInvoiceDocumentId(purchase_invoice_document_id);
        //filter only debit note status is closed
        debitNoteList = await debitNoteList.filter((dn) => dn.debit_note_status === "closed");


        //calculate total_amount of all purchase invoice
        let total_amount = PIPaymentList.reduce((previousValue, currentValue) => previousValue + currentValue.total_amount, 0);

        //calculate total_amount of all combined_payment
        total_amount = BNXPaymentList.reduce((previousValue, currentValue) => previousValue + currentValue.billing_amount, total_amount);

        //calculate total_amount of all debit note list
        total_amount = debitNoteList.reduce((previousValue, currentValue) => previousValue + currentValue.total_amount, total_amount);

        //amount_to_pay
        let amountToPay = purchaseInvoiceResult.total_amount - total_amount;

        return amountToPay;
    },
    withHoldingTaxSaleInvoice: (salesInvoiceResult) => {
        let hasTaxNumber = false;
        let hasNone = false;
        let hasNotDefined = false;
        let taxNumberList = [];
        salesInvoiceResult.sales_invoice_data.forEach((siData) => {
            siData.category_list.forEach((category) => {
                if (category.item_data.length !== 0) {
                    category.item_data.forEach((item) => {
                        if (item.item_withholding_tax.tax === "ยังไม่ระบุ") {
                            hasNotDefined = true;
                        } else if (item.item_withholding_tax.tax === "ไม่มี"
                            || item.item_withholding_tax.tax === "0%") {
                            hasNone = true;
                        } else {
                            hasTaxNumber = true;
                        }
                        taxNumberList.push(item.item_withholding_tax.tax);
                    });
                }
            });
        });

        let tax = null;
        const allEqual = (arr) => arr.every(element => element === arr[0]);
        let isAllEqual = allEqual(taxNumberList);
        if (!hasTaxNumber && (hasNotDefined || hasNone)) {
            tax = null;
        } else if (isAllEqual && !(hasNotDefined || hasNone)) {
            tax = taxNumberList[0];
        } else {
            tax = "กำหนดเอง";
        }
        if (tax) {
            return {
                tax, withholding_tax_amount: salesInvoiceResult.withholding_tax
            };
        } else {
            return null;
        }

    },
    withHoldingTaxPurchaseInvoice: (purchaseInvoiceResult) => {
        let hasTaxNumber = false;
        let hasNone = false;
        let hasNotDefined = false;
        let taxNumberList = [];
        purchaseInvoiceResult.purchase_invoice_data.forEach((piData) => {
            if (piData.item_withholding_tax.tax === "ยังไม่ระบุ") {
                hasNotDefined = true;
            } else if (piData.item_withholding_tax.tax === "ไม่มี"
                || piData.item_withholding_tax.tax === "0%") {
                hasNone = true;
            } else {
                hasTaxNumber = true;
            }
            taxNumberList.push(piData.item_withholding_tax.tax);
        });

        let tax = null;
        const allEqual = (arr) => arr.every(element => element === arr[0]);
        let isAllEqual = allEqual(taxNumberList);
        if (!hasTaxNumber && (hasNotDefined || hasNone)) {
            tax = null;
        } else if (isAllEqual && !(hasNotDefined || hasNone)) {
            tax = taxNumberList[0];
        } else {
            tax = "กำหนดเอง";
        }
        if (tax) {
            return {
                tax: tax,
                withholding_tax_amount: purchaseInvoiceResult.withholding_tax
            };
        } else {
            return null;
        }
    },
    mergeWithHoldingTaxType: (withHoldingTaxList) => {
        let hasTaxNumber = false;
        let hasNull = false;
        var allTaxEqual = withHoldingTaxList.every(
            withHoldingTaxObj => {
                if (withHoldingTaxObj) {
                    hasTaxNumber = true;
                } else {
                    hasNull = true;
                }
                return withHoldingTaxObj && withHoldingTaxObj.tax === withHoldingTaxList[0].tax;
            }
        );
        if (!hasTaxNumber && hasNull) {
            return null;
        } else if (hasTaxNumber && allTaxEqual) {
            return withHoldingTaxList[0].tax;
        } else {
            return "กำหนดเอง";
        }
    }
};

module.exports = Calculate;