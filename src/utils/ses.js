let AWS = require('aws-sdk');

const AWS_ACCESS_KEY_ID = "AKIA5BW4RILWIRO52MOW";
const AWS_SECRET_ACCESS_KEY = "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";
const AWS_REGION = "ap-southeast-1";

AWS.config.update({ region: AWS_REGION });

function verifySes(email) {
    // Create promise and SES service object
    var verifyEmailPromise = new AWS.SES({ apiVersion: '2010-12-01' }).verifyEmailIdentity({ EmailAddress: email }).promise();

    // Handle promise's fulfilled/rejected states
    return verifyEmailPromise.then(
        function (data) {
            console.log("Email verification initiated");
            console.log(data);
        }).catch(
        function (err) {
            console.error(err, err.stack);
        });
}

function sendPassword(email, password) {
    var params = {
        Destination: {
            ToAddresses: [
                'suppakit.neno@gmail.com',
            ]
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `รหัสผ่านของคุณคือ ${password}`
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'ลืมรหัสผ่าน ERP Biowoodthailand'
            }
        },
        Source: 'suppakit.neno@gmail.com',
    };

    // Create the promise and SES service object
    var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();

    // Handle promise's fulfilled/rejected states
    return sendPromise.then(
        function (data) {
            console.log(data.MessageId);
        }).catch(
        function (err) {
            console.error(err, err.stack);
        });
}

module.exports = {
    verifySes,
    sendPassword
};
