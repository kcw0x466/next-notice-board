import pool from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { id, password } = req.body;

    try {
      const [rows] = await pool.query('SELECT * FROM posts WHERE id = ? AND password = ?', [id, password]);
      if (rows.length > 0) {
        res.status(200).json({ verified: true });
      } else {
        res.status(403).json({ verified: false, message: '비밀번호가 일치하지 않습니다.' });
      }
    } catch (error) {
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}