module.exports = (data) => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <div class="info">
            <div class='info_left'>
                รหัสโปรเจค / Project No. : ${data.billing_info.project_id} <br>
                ชื่อโปรเจค / Project Name : ${
                  data.billing_info.project_name
                } <br>
                ชื่อลูกค้า / Customer Name : ${
                  data.billing_info.contact_name
                } <br>
                เลขที่ผู้เสียภาษี / Tax ID : ${data.billing_info.tax_no} <br>
                Email : ${data.billing_info.email} <br>
                วันที่ / Date : ${data.quotation_issue_date} <br>
                ใช้ได้ถึง / Expire Date : ${data.quotation_valid_unitl_date}
            </div>
            <div class='info_right'>
                ใบเสนอราคา / Quotation : ต้นฉบับ / Original <br>
                เลขที่เอกสาร / Document No. : ${data.quotation_document_id} <br>
                พนักงานขาย / Sale : ${data.sale_list.map(
                  (sale) =>
                    `${sale.employee_firstname} ${sale.employee_lastname}`
                )} <br>
                เบอร์โทรศัพท์ / Phone : ${data.billing_info.phone} <br>
                เบอร์โทรสาร / Fax : ${data.billing_info.tax_no} <br>
                ที่อยู่ / Address : ${data.billing_info.address}
             </div>
        </div>
        
    </body>
    </html>
    <style>
    body {background-color: powderblue;}
    .info {
        display: inline-block;
    }
    </style>
    `;
};
