"use client";

import Link from 'next/link';
import Navbar from './components/Navbar';

interface Post {
  id: string | number;
  title: string;
  nickname: string;
  created_at: string;
}

export default function Home() {
  return (
    <div>
      <Navbar />
      <div>
        <h1 className="text-7xl font-bold mt-60 text-center animate-slidein300 opacity-0">IPLAB</h1>
        <h1 className="text-3xl font-bold mt-20 text-center animate-slidein500 opacity-0">AI / BCI / Software Engineering LAB </h1>
        <div className="text-center">
          <Link href="/posts" className="bg-primary text-white mt-20 px-6 py-2 rounded-xl inline-block animate-slidein700 opacity-0">
            게시판
          </Link>
        </div>
        
      </div>
    </div>
  );
}
