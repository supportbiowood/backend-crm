require("dotenv").config();
require("babel-register");
require("babel-polyfill");
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const mysql = require('mysql2');
// enable CORS
app.use(cors());
// parse application/json
app.use(express.json());
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: "8mb" }));
// increase body limit size

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "CONTENT_TYPE, Authorization");
  next();
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(400).json({
      status: "error",
      message: "Missing Token",
    });
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({
        status: "error",
        message: "Invalid Token",
      });
    }
    const employeeRoleModel = require("./src/models/employeeRole.model");
    const permissionManager = require("./src/utils/permission");
    req.user = user;
    req.user.role = await employeeRoleModel.getByEmployeeDocumentId(
      req.user.employee_document_id
    );
    req.user.permission = permissionManager.matchPermissionObject(
      permissionManager.mergePermission(req.user.role)
    );
    next();
  });
};

app.get("/", (req, res) => {
  res.send("Biowood ERP api production");
});

// app.use("/auth", authRouter);
// app.use("/contact", authenticateToken, staffRouter);

const authRouter = require("./src/routes/auth.route");
const addressRouter = require("./src/routes/address.route");
const contactRouter = require("./src/routes/contact.route");
const contactChannelRouter = require("./src/routes/contactChannel.route");
const contactTagRouter = require("./src/routes/contactTag.route");
const employeeRouter = require("./src/routes/employee.route");
const eventRouter = require("./src/routes/event.route");
const projectRouter = require("./src/routes/project.route");
const projectActivityRouter = require("./src/routes/projectActivity.route");
const projectContactRouter = require("./src/routes/projectContact.route");
const projectEmployeeRouter = require("./src/routes/projectEmployee.route");
const projectTagRouter = require("./src/routes/projectTag.route");
const warrantyRouter = require("./src/routes/warranty.route");
const personRouter = require("./src/routes/person.route");
const attachmentRouter = require("./src/routes/attachment.route");
const bankAccountRouter = require("./src/routes/bankAccount.route");
const quotationRouter = require("./src/routes/quotation.route");
const salesInvoiceRouter = require("./src/routes/salesInvoice.route");
const billingNoteRouter = require("./src/routes/billingNote.route");
const remarktemplateRouter = require("./src/routes/remarkTemplate.route");
const paymentChannelRouter = require("./src/routes/paymentChannel.route");
const paymentReceiptRouter = require("./src/routes/paymentReceipt.route");
const salesOrderRouter = require("./src/routes/salesOrder.router");
const purchaseRequestRouter = require("./src/routes/purchaseRequest.route");
const purchaseOrderRouter = require("./src/routes/purchaseOrder.route");
const deliveryNoteRouter = require("./src/routes/deliveryNote.route");
const depositInvoiceRouter = require("./src/routes/depositInvoice.route");
const salesReturnRouter = require("./src/routes/salesReturn.route");
const creditNoteRouter = require("./src/routes/creditNote.route");
const purchaseInvoiceRouter = require("./src/routes/purchaseInvoice.route");
const paymentMadeRouter = require("./src/routes/paymentMade.route");
const combinedPaymentRouter = require("./src/routes/combinedPayment.route");
const purchaseReturnRouter = require("./src/routes/purchaseReturn.route");
const debitNoteRouter = require("./src/routes/debitNote.route");
const expensesRouter = require("./src/routes/expenses.route");
const activityRouter = require("./src/routes/activity.route");
const rbacRouter = require("./src/routes/rbac.route");
const teamRouter = require("./src/routes/team.route");
const engineerRouter = require("./src/routes/engineer.route");
const importerRouter = require("./src/routes/importer.route");
const accountRouter = require("./src/routes/account.route");
const accountTypeRouter = require("./src/routes/accountType.route");
const accountJournalRouter = require("./src/routes/accountJournal.route");

app.use("/v1/auth", authRouter);
app.use("/v1/address", authenticateToken, addressRouter);
app.use("/v1/contact", authenticateToken, contactRouter);
app.use("/v1/contact_channel", authenticateToken, contactChannelRouter);
app.use("/v1/contact_tag", authenticateToken, contactTagRouter);
app.use("/v1/employee", authenticateToken, employeeRouter);
app.use("/v1/event", authenticateToken, eventRouter);
app.use("/v1/project", authenticateToken, projectRouter);
app.use("/v1/project_activity", authenticateToken, projectActivityRouter);
app.use("/v1/project_contact", authenticateToken, projectContactRouter);
app.use("/v1/project_employee", authenticateToken, projectEmployeeRouter);
app.use("/v1/project_tag", authenticateToken, projectTagRouter);
app.use("/v1/warranty", authenticateToken, warrantyRouter);
app.use("/v1/person", authenticateToken, personRouter);
app.use("/v1/attachment", authenticateToken, attachmentRouter);
app.use("/v1/bank_account", authenticateToken, bankAccountRouter);
app.use("/v1/quotation", authenticateToken, quotationRouter);
app.use("/v1/sales_invoice", authenticateToken, salesInvoiceRouter);
app.use("/v1/billing_note", authenticateToken, billingNoteRouter);
app.use("/v1/remark_template", authenticateToken, remarktemplateRouter);
app.use("/v1/payment_channel", authenticateToken, paymentChannelRouter);
app.use("/v1/payment_receipt", authenticateToken, paymentReceiptRouter);
app.use("/v1/sales_order", authenticateToken, salesOrderRouter);
app.use("/v1/purchase_request", authenticateToken, purchaseRequestRouter);
app.use("/v1/purchase_order", authenticateToken, purchaseOrderRouter);
app.use("/v1/delivery_note", authenticateToken, deliveryNoteRouter);
app.use("/v1/deposit_invoice", authenticateToken, depositInvoiceRouter);
app.use("/v1/sales_return", authenticateToken, salesReturnRouter);
app.use("/v1/credit_note", authenticateToken, creditNoteRouter);
app.use("/v1/purchase_invoice", authenticateToken, purchaseInvoiceRouter);
app.use("/v1/payment_made", authenticateToken, paymentMadeRouter);
app.use("/v1/combined_payment", authenticateToken, combinedPaymentRouter);
app.use("/v1/purchase_return", authenticateToken, purchaseReturnRouter);
app.use("/v1/debit_note", authenticateToken, debitNoteRouter);
app.use("/v1/expenses", authenticateToken, expensesRouter);
app.use("/v1/importer", authenticateToken, importerRouter);
app.use("/v1/activity", authenticateToken, activityRouter);
app.use("/v1/rbac", authenticateToken, rbacRouter);
app.use("/v1/team", authenticateToken, teamRouter);
app.use("/v1/engineer", authenticateToken, engineerRouter);
app.use("/v1/account", authenticateToken, accountRouter);
app.use("/v1/account_type", authenticateToken, accountTypeRouter);
app.use("/v1/account_journal", authenticateToken, accountJournalRouter);

const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// Define your schema
const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

// Define your resolvers
const root = {
  hello: () => {
    return 'Hello world!';
  }
};

// Add GraphQL route to your server
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,  // This enables GraphiQL, a UI to interact with your API
}));


const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log("API listening on port:", port);
});
