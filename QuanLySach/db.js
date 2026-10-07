const mongoose = require('mongoose');
require('dotenv').config();

// Luồng 1: Chỉ Đọc
const readConnection = mongoose.createConnection(process.env.READ_URI);
// Luồng 2: Chỉ Ghi
const writeConnection = mongoose.createConnection(process.env.WRITE_URI);

const bookSchema = new mongoose.Schema({
    maSP: String,
    tenSach: String,
    giaGoc: Number,
    giaSauThue: Number
});

// Điều hướng luồng: Model đọc lấy kết nối read, Model ghi lấy kết nối write
const BookRead = readConnection.model('book manager', bookSchema);
const BookWrite = writeConnection.model('book manager', bookSchema);

module.exports = { BookRead, BookWrite };