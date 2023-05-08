const client = require("twilio")(
  process.env.ACCOUNTSID_TWILIO,
  process.env.AUTHTOKEN_TWILIO
);

exports.generateOTP = (otp_length = 6) => {
  let OTP = "";
  for (let i = 1; i <= otp_length; i++) {
    const randomVal = Math.round(Math.random() * 9);
    OTP += randomVal;
  }
  return OTP;
};

exports.generatePhoneTransporter = (phone, message) => {
  client.messages
    .create({
      body: message,
      from: "+14754656032",
      to: `+84${phone}`,
    })
    .then((messageSid) => console.log(messageSid.sid));
};
