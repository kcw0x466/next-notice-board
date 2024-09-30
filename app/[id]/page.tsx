"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';

interface Post {
  id: string | number;
  title: string;
  content: string;
  nickname: string;
  created_at: string;
  attachments: {
    id: number;
    file_name: string;
    original_name: string;  // 이 줄을 추가
  }[];
}

export default function PostDetail() {
  const [post, setPost] = useState<Post | null>(null);
  const [password, setPassword] = useState('');
  const params = useParams();
  const router = useRouter();
  const { id } = params ?? {};

  useEffect(() => {
    if (id) {
      fetch(`/api/posts/${id}`)
        .then(res => res.json())
        .then(data => setPost(data));
    }
  }, [id]);

  const handleEdit = async () => {
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/posts/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, password }),
      });

      const data = await response.json();

      if (data.verified) {
        sessionStorage.setItem('editVerified', 'true');
        router.push(`/edit/${id}`);
      } else {
        alert(data.message || '비밀번호가 틀렸습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const handleDownload = async (attachmentId: number, fileName: string) => {
    try {
      const response = await fetch(`/api/download/${attachmentId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('파일 다운로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  if (!post) return <div>로딩 중...</div>;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-600 mb-2">작성자: {post.nickname}</p>
        <p className="text-gray-600 mb-4">작성일: {new Date(post.created_at).toLocaleDateString()}</p>
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <p className="whitespace-pre-wrap">{post.content}</p>
        </div>
        {post.attachments && post.attachments.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">첨부 파일</h2>
            <ul className="list-disc pl-5">
              {post.attachments.map((attachment) => (
                <li key={attachment.id}>
                  <button
                    onClick={() => handleDownload(attachment.id, attachment.original_name)}
                    className="text-blue-500 hover:underline"
                  >
                    {attachment.original_name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-between items-center">
          <Link href="/posts" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            목록으로
          </Link>
          <div className="flex items-center">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="border border-gray-300 rounded px-3 py-2 mr-2"
            />
            <button
              onClick={handleEdit}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              수정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}