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
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
      if (rows.length > 0) {
        const [attachments] = await pool.query('SELECT * FROM attachments WHERE post_id = ?', [id]);
        rows[0].attachments = attachments.map(attachment => ({
          ...attachment,
          original_name: Buffer.from(attachment.original_name, 'binary').toString('utf8')
        }));
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.status(200).json(rows[0]);
      } else {
        res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
      }
    } catch (error) {
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  } else if (req.method === 'PUT') {
    upload.array('newFiles')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: '파일 업로드 중 오류가 발생했습니다.' });
      }

      const { title, content } = req.body;
      const newFiles = req.files;
      const deletedAttachments = JSON.parse(req.body.deletedAttachments || '[]');

      try {
        await pool.query('UPDATE posts SET title = ?, content = ? WHERE id = ?', [title, content, id]);

        if (newFiles && newFiles.length > 0) {
          for (const file of newFiles) {
            await pool.query(
              'INSERT INTO attachments (post_id, file_name, file_path, original_name) VALUES (?, ?, ?, ?)',
              [id, file.filename, file.path, file.originalname]
            );
          }
        }

        if (deletedAttachments.length > 0) {
          for (const attachmentId of deletedAttachments) {
            const [attachment] = await pool.query('SELECT file_path FROM attachments WHERE id = ?', [attachmentId]);
            if (attachment.length > 0) {
              fs.unlinkSync(attachment[0].file_path);
              await pool.query('DELETE FROM attachments WHERE id = ?', [attachmentId]);
            }
          }
        }

        res.status(200).json({ message: '게시물이 수정되었습니다.' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
      }
    });
  } else if (req.method === 'DELETE') {
    try {
      const [attachments] = await pool.query('SELECT file_path FROM attachments WHERE post_id = ?', [id]);
      for (const attachment of attachments) {
        fs.unlinkSync(attachment.file_path);
      }

      await pool.query('DELETE FROM attachments WHERE post_id = ?', [id]);
      const [result] = await pool.query('DELETE FROM posts WHERE id = ?', [id]);

      if (result.affectedRows > 0) {
        res.status(200).json({ message: '게시물이 삭제되었습니다.' });
      } else {
        res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}