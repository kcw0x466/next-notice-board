import pool from '../../../lib/db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  })
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  } else if (req.method === 'POST') {
    upload.array('files')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: '파일 업로드 중 오류가 발생했습니다.' });
      }

      const { title, content, nickname, password } = req.body;
      const files = req.files;

      try {
        const [result] = await pool.query(
          'INSERT INTO posts (title, content, nickname, password) VALUES (?, ?, ?, ?)',
          [title, content, nickname, password]
        );

        const postId = result.insertId;

        if (files && files.length > 0) {
          for (const file of files) {
            const originalName = Buffer.from(file.originalname, 'binary').toString('utf8');
            await pool.query(
              'INSERT INTO attachments (post_id, file_name, file_path, original_name) VALUES (?, ?, ?, ?)',
              [postId, file.filename, file.path, originalName]
            );
          }
        }

        res.status(201).json({ id: postId, message: '게시물이 생성되었습니다.' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
      }
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
