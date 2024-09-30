"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';

interface Post {
  id: string | number;
  title: string;
  nickname: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">게시판</h1>
        <div className="flex justify-end mb-4">
          <Link href="/write" className="bg-primary text-white px-4 py-2 rounded inline-block">
            글 쓰기
          </Link>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2 text-left">번호</th>
              <th className="border border-gray-300 p-2 text-left">제목</th>
              <th className="border border-gray-300 p-2 text-left">작성자</th>
              <th className="border border-gray-300 p-2 text-left">날짜</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post: Post, index: number) => (
              <tr key={post.id} className="border-b border-gray-300">
                <td className="border border-gray-300 p-2">{index + 1}</td>
                <td className="border border-gray-300 p-2">
                  <Link href={`/${post.id}`} className="text-primary hover:underline">
                    {post.title}
                  </Link>
                </td>
                <td className="border border-gray-300 p-2">{post.nickname}</td>
                <td className="border border-gray-300 p-2">{new Date(post.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
