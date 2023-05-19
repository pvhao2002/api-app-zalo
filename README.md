# api-app-zalo


-  Đầu tiên git clone về máy
- Sau đó config như sau:
-   Tạo file .env cấu hình file .env như sau:

NODE_ENV=DEVELOPMENT
JWT_SECRET=toan
MONGO_URI=mongodb+srv://toannguyen:toan123@cluster1.pdm5jvd.mongodb.net/zalo?retryWrites=true&w=majority
CLOUD_API_SECRET=vd7k434HXuVv47D2rdkz2kLks4g
CLOUD_API_KEY=376629151138126
CLOUD_NAME=myshop-it
TWILIO_ACCOUNT_SID=AC8a916b7ca934bd763e972628d1b43898
TWILIO_AUTH_TOKEN=7bc9901ef5a3d9a9f1c374c5fc1e70ae

- Sau đó gõ lệnh npm install
- Sau đó gõ lệnh npm run dev

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

