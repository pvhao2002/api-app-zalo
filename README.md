# api-app-zalo


-  Đầu tiên git clone về máy
- Sau đó config như sau:
-   Tạo file .env cấu hình file .env như sau:

NODE_ENV=DEVELOPMENT
JWT_SECRET=
MONGO_URI= "Đường dẫn tới database MONGODB của bạn"
CLOUD_API_SECRET=
CLOUD_API_KEY=
CLOUD_NAME=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

- Sau đó gõ lệnh npm install
- Sau đó gõ lệnh npm run dev

Những thông tin config trong file .env bao gồm: JWT, MONGO DB, CLOUDINARY, TWILIO.


Lưu ý: Nếu chạy máy window
thì đổi đoạn sau đây trong file package.json
 "scripts": {
    "start": "node app.js",
    "dev": "export NODE_ENV=DEVELOPMENT && nodemon app",
    "prod": "export NODE_ENV=PRODUCTION && nodemon app"
  }
  thành
   "scripts": {
    "start": "node app.js",
    "dev": "SET NODE_ENV=DEVELOPMENT && nodemon app",
    "prod": "SET NODE_ENV=PRODUCTION && nodemon app"
  }
  
  
  

