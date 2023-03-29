const AWS = require("aws-sdk");

exports.generateOTP = (otp_length = 6) => {
  let OTP = "";
  for (let i = 1; i <= otp_length; i++) {
    const randomVal = Math.round(Math.random() * 9);
    OTP += randomVal;
  }

  return OTP;
};

exports.generatePhoneTransporter = (phone, message) => {
  console.log("Message = " + message);
  console.log("Phone = " + phone);

  var params = {
    Message: message,
    PhoneNumber: "+84" + phone,
    MessageAttributes: {
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        StringValue: "OTP",
      },
    },
  };

  var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
    .publish(params)
    .promise();

  return publishTextPromise;
};
