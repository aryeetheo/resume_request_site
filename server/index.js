import express from 'express';
import multer from 'multer';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/submit', upload.single('image'), async (req, res) => {
  try {
    const data = req.body;
    const imageFile = req.file;
    const pdfPath = path.join('uploads', `${Date.now()}_resume.pdf`);
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    doc.fontSize(20).text('Resume Request', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    Object.keys(data).forEach(key => {
      if (key !== 'image') {
        doc.text(`${key}: ${data[key]}`);
      }
    });
    doc.moveDown();
    if (imageFile) {
      doc.text('Image:');
      doc.image(imageFile.path, { fit: [150, 150] });
    }
    doc.end();

    writeStream.on('finish', async () => {
      // Send email with PDF attachment
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'kodzoaryee@gmail.com',
          pass: '123@Grel'
        }
      });
      let mailOptions = {
        from: 'kodzoaryee@gmail.com',
        to: data.email,
        subject: 'Your Resume Request',
        text: 'Please find your submitted resume attached as a PDF.',
        attachments: [
          {
            filename: 'resume.pdf',
            path: pdfPath
          }
        ]
      };
      await transporter.sendMail(mailOptions);
      fs.unlinkSync(pdfPath);
      if (imageFile) fs.unlinkSync(imageFile.path);
      res.json({ success: true });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
