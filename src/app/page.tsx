"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";
import { getCurrentUser, onAuthStateChange, signOut } from "@/lib/auth";

type StepProps = {
  image: string;
  title: string;
  desc: string;
  reverse?: boolean;
};

function Step({ image, title, desc, reverse }: StepProps) {
  return (
    <div
      className={`flex flex-col md:flex-row items-center gap-16 ${reverse ? "md:flex-row-reverse" : ""}`}
      data-aos="fade-up"
      data-aos-duration="1500"
      data-aos-delay={reverse ? "200" : "0"}
    >
      <div className="flex-1 flex justify-center" data-aos="zoom-in" data-aos-delay="300">
        <Image src={image} alt={title} width={400} height={400} className="rounded-2xl shadow-2xl" />
      </div>
      <div className="flex-1 text-center md:text-left" data-aos="fade-left" data-aos-delay="500">
        <h3 className="font-serif text-4xl text-[#D4AF37] mb-4">{title}</h3>
        <p className="text-[#F5F5DC] text-2xl">{desc}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 初期認証状態を確認
    getCurrentUser().then(user => {
      if (user) {
        // ユーザーがログインしている場合はダッシュボードにリダイレクト
        router.push("/dashboard");
        return;
      }
      setUser(user);
      setLoading(false);
    });

    // 認証状態の変更を監視
    const { subscription } = onAuthStateChange((user) => {
      if (user) {
        router.push("/dashboard");
        return;
      }
      setUser(user);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, [router]);

  useEffect(() => {
    const AOS = require("aos");
    AOS.init({ 
      once: true, 
      duration: 1200, 
      easing: "ease-out-cubic",
      offset: 120,
      delay: 100
    });
  }, []);

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0B192F] via-[#1A1A1A] to-[#232946] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-[#0B192F] via-[#1A1A1A] to-[#232946] min-h-screen text-white font-sans">
      {/* ナビゲーションバー */}
      <nav className="absolute top-0 left-0 right-0 z-40 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="font-serif text-2xl text-[#D4AF37] font-bold">
            時の宝箱
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => openAuthModal("login")}
              className="text-[#F5F5DC] hover:text-[#D4AF37] transition-colors px-4 py-2 rounded-lg"
            >
              ログイン
            </button>
            <button
              onClick={() => openAuthModal("signup")}
              className="bg-gradient-to-r from-[#D4AF37] to-[#F5F5DC] text-[#0B192F] px-6 py-2 rounded-lg font-bold hover:opacity-90 transition"
            >
              新規登録
            </button>
          </div>
        </div>
      </nav>
      {/* ヒーローセクション */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[90vh] text-center overflow-hidden"
        data-aos="fade-in"
        data-aos-duration="2000"
      >
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0B192F] via-[#1A1A1A] to-[#232946] opacity-90" />
        <Image
          src="/hero-night.jpg"
          alt="夜空と宝箱"
          fill
          className="object-cover z-0 opacity-40"
          priority
        />
        <div className="relative z-10 flex flex-col items-center">
          <h1 
            className="font-serif text-6xl md:text-8xl font-bold text-white drop-shadow-lg mb-8 tracking-tight"
            data-aos="fade-up"
            data-aos-delay="500"
            data-aos-duration="1800"
          >
            24時間限定<br className="hidden md:block" />
            アルバム
          </h1>
          <p 
            className="text-2xl md:text-3xl text-[#F5F5DC] mb-10 max-w-3xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="800"
            data-aos-duration="1600"
          >
            あなたの大切な一日を、未来へ届けるタイムカプセル・アルバム。
          </p>
          <button
            onClick={() => openAuthModal("signup")}
            className="inline-block bg-gradient-to-r from-[#D4AF37] to-[#F5F5DC] text-[#0B192F] px-12 py-5 rounded-full font-bold text-2xl shadow-xl hover:opacity-90 transition"
            data-aos="zoom-in"
            data-aos-delay="1200"
            data-aos-duration="1000"
          >
            思い出を封印する
          </button>
        </div>
      </section>

      {/* 体験の流れ */}
      <section className="max-w-7xl mx-auto py-32 px-4 space-y-40">
        <Step
          image="/step1-seal.png"
          title="封印する"
          desc="大切な写真やメッセージを、未来のあなたへ。アプリが一年間、大切に保管します。"
        />
        <Step
          image="/step2-wait.png"
          title="待つ"
          desc="その日が来るまで、中身を見ることはできません。年に一度の再会をお楽しみに。"
          reverse
        />
        <Step
          image="/step3-open.png"
          title="開く"
          desc="指定した記念日の24時間だけ、思い出の扉が開きます。特別な一日を、もう一度。"
        />
      </section>

      {/* ギャラリー・デモ */}
      <section className="bg-[#181A20] py-32" data-aos="fade-up" data-aos-duration="1500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-24 items-center px-4">
          <div className="flex-1" data-aos="slide-right" data-aos-delay="200">
            <h2 className="font-serif text-4xl text-[#D4AF37] mb-8">普段は、静かな眠りのなかで。</h2>
            <Image
              src="/lock-demo.png"
              alt="ロック画面"
              width={520}
              height={340}
              className="rounded-2xl shadow-2xl"
            />
            <p className="text-[#F5F5DC] text-2xl mt-6">次の解禁日まで、あと <span className="text-[#D4AF37] font-bold">182日</span></p>
          </div>
          <div className="flex-1" data-aos="slide-left" data-aos-delay="400">
            <h2 className="font-serif text-4xl text-[#D4AF37] mb-8">その日、思い出は鮮やかに甦る。</h2>
            <Image
              src="/unlock-demo.png"
              alt="ギャラリー画面"
              width={520}
              height={340}
              className="rounded-2xl shadow-2xl"
            />
            <p className="text-[#F5F5DC] text-2xl mt-6">写真がポラロイドのように並びます</p>
          </div>
        </div>
      </section>

      {/* 最後のアクション */}
      <section className="py-32 text-center" data-aos="fade-up" data-aos-duration="1500">
        <h2 className="font-serif text-5xl text-[#D4AF37] mb-12" data-aos="fade-up" data-aos-delay="200">
          あなたの宝箱を、作りませんか？
        </h2>
        <button
          onClick={() => openAuthModal("signup")}
          className="inline-block bg-gradient-to-r from-[#D4AF37] to-[#F5F5DC] text-[#0B192F] px-16 py-6 rounded-full font-bold text-3xl shadow-xl hover:opacity-90 transition"
          data-aos="zoom-in"
          data-aos-delay="500"
          data-aos-duration="1200"
        >
          無料で始める
        </button>
      </section>

      {/* 認証モーダル */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </main>
  );
}

