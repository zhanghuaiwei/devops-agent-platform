/** AI 生成：首页直接重定向到 Chat（产品主入口是对话页） */
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/chat');
}
