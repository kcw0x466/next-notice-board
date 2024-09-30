"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

interface Attachment {
  id: number;
  file_name: string;
  original_name: string;
}

export default function EditPage() {
  const [post, setPost] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletedAttachments, setDeletedAttachments] = useState<number[]>([]);
  const params = useParams();
  const router = useRouter();
  const { id } = params ?? {};

  useEffect(() => {
    if (id) {
      fetch(`/api/posts/${id}`)
        .then(res => res.json())
        .then(data => {
          setPost(data);
          setTitle(data.title);
          setContent(data.content);
          setAttachments(data.attachments || []);
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    newFiles.forEach((file) => {
      formData.append('newFiles', file);
    });
    formData.append('deletedAttachments', JSON.stringify(deletedAttachments));

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        body: formData,
      });
      if (response.ok) {
        router.push(`/${id}`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || '게시물 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('게시물 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (confirm('정말로 이 글을 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/posts/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('게시물이 삭제되었습니다.');
          router.push('/');
        } else {
          alert('게시물 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('게시물 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles(Array.from(e.target.files));
    }
  };

  const handleAttachmentDelete = (attachmentId: number) => {
    setAttachments(attachments.filter(att => att.id !== attachmentId));
    setDeletedAttachments([...deletedAttachments, attachmentId]);
  };

  if (!post) return <div>로딩 중...</div>;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">글 수정</h1>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-gray-600">작성자: {post.nickname}</p>
            <p className="text-gray-600">작성일: {new Date(post.created_at).toLocaleDateString()}</p>
          </div>
          <button 
            onClick={handleDelete} 
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            글 삭제
          </button>
        </div>
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
            <label htmlFor="attachments" className="block mb-2">첨부 파일</label>
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center mb-2">
                <span>{decodeURIComponent(attachment.original_name)}</span>
                <button
                  type="button"
                  onClick={() => handleAttachmentDelete(attachment.id)}
                  className="ml-2 text-red-500"
                >
                  X
                </button>
              </div>
            ))}
            <input
              type="file"
              id="newFiles"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded"
              multiple
            />
          </div>
          <div className="flex justify-between items-center">
            <Link href={`/${id}`} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              뒤로가기
            </Link>
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
              수정하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}