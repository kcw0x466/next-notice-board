"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

export default function WritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('nickname', nickname);
    formData.append('password', password);
    files.forEach((file) => {
      const originalName = Buffer.from(file.name, 'utf-8').toString('binary');
      const blob = new Blob([file], { type: file.type });
      formData.append('files', blob, originalName);
    });

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        router.push(`/${data.id}`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || '게시물 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('게시물 작성 중 오류가 발생했습니다.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">글 쓰기</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block mb-2">제목</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block mb-2">내용</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              rows={5}
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="files" className="block mb-2">첨부 파일</label>
            <input
              type="file"
              id="files"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded"
              multiple
            />
          </div>
          <div>
            <label htmlFor="nickname" className="block mb-2">닉네임</label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
            글 작성
          </button>
        </form>
      </div>
    </div>
  );
}