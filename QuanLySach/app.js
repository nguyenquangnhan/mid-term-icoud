const express = require('express');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const { BookRead, BookWrite } = require('./db'); // Require từ file db.js
require('dotenv').config();

const app = express();
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: true }));

// 1. Cấu hình Stateless Session lưu thẳng xuống MongoDB Atlas
app.use(session({
    secret: 'vku-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.WRITE_URI }) // Lưu xuống Cloud
}));

// 2. Route hiển thị danh sách (Dùng luồng READ)
app.get('/', async (req, res) => {
    // Đọc bằng Model Read
    const books = await BookRead.find().lean();
    res.render('index', {
        books,
        hoTen: "Nguyễn Quang Nhân",
        mssv: "23NS" + process.env.MSSV_CUOI,
        vat: Number(process.env.CHU_SO_CUOI) + 6
    });
});

// 3. Route thêm mới (Dùng luồng WRITE & Thuật toán lọc)
app.post('/add', async (req, res) => {
    const { maSP, tenSach, giaGoc } = req.body;
    const mssvCuoi = process.env.MSSV_CUOI; // 3 số cuối
    const chuSoCuoi = Number(process.env.CHU_SO_CUOI); // Số cuối cùng

    // Cài đặt bộ lọc: Kiểm tra tiền tố mã sản phẩm
    if (!maSP.startsWith(mssvCuoi)) {
        return res.send("Lỗi: Mã sản phẩm phải bắt đầu bằng 3 số cuối MSSV!");
    }

    // Thuật toán cá nhân hóa: Tính VAT
    const VAT = chuSoCuoi + 6;
    const giaSauThue = Number(giaGoc) + (Number(giaGoc) * VAT / 100);

    // Lưu bằng Model Write
    const newBook = new BookWrite({ maSP, tenSach, giaGoc, giaSauThue });
    await newBook.save();

    res.redirect('/');
});

app.listen(3000, () => console.log('Server chạy cổng 3000'));