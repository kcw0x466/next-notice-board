import pool from '../../../lib/db';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM attachments WHERE id = ?', [id]);
      if (rows.length > 0) {
        const file = rows[0];
        const filePath = path.join(process.cwd(), file.file_path);
        
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file.original_name)}`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
      } else {
        res.status(404).json({ message: '파일을 찾을 수 없습니다.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}