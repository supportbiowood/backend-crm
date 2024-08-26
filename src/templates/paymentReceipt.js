module.exports = (data)=>{
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <div>
            รหัสโปรเจค / Project No. : ${data.billing_info.project_id}
            ชื่อโปรเจค / Project Name : ${data.billing_info.project_name}
            ชื่อลูกค้า / Customer Name : ${data.billing_info.contact_name}
            เลขที่ผู้เสียภาษี / Tax ID : ${data.billing_info.tax_no}
            Email : ${data.billing_info.email}
            วันที่ออกใบ / Issue Date : ${data.payment_receipt_issue_date}
        </div>
            <div>
            ใบเสร็จ / Receipt : ต้นฉบับ / Original
            เลขที่เอกสาร / Document No. : ${data.payment_receipt_document_id}
            เบอร์โทรศัพท์ / Phone : ${data.billing_info.phone}
            เบอร์โทรสาร / Fax : ${data.billing_info.fax}
            ที่อยู่ / Address : ${data.billing_info.address}
        </div>
    </body>
    </html>`
}