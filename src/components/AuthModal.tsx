"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth";
import { X, UserPlus, LogIn, Mail, Lock, Key } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // defaultModeが変更された時、またはモーダルが開かれた時にmodeを更新
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      resetForm();
    }
  }, [isOpen, defaultMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("パスワードが一致しません");
      setLoading(false);
      return;
    }

    try {
      if (mode === "login") {
        const { data, error } = await signIn(email, password);
        if (error) {
          setError("ログインに失敗しました。メールアドレスとパスワードを確認してください。");
        } else {
          setMessage("ログインに成功しました！");
          setTimeout(() => {
            handleClose();
            router.push("/dashboard");
          }, 1500);
        }
      } else {
        const { data, error } = await signUp(email, password);
        if (error) {
          setError("アカウント作成に失敗しました。");
        } else {
          setMessage("アカウントの作成が完了しました！");
          setTimeout(() => {
            handleClose();
            router.push("/dashboard");
          }, 1500);
        }
      }
    } catch (err) {
      setError("エラーが発生しました。しばらく時間をおいて再度お試しください。");
    }

    setLoading(false);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setMessage("");
    setError("");
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  // モードに応じた色とアイコンの設定
  const modeConfig = {
    login: {
      bgGradient: "from-[#0B192F] via-[#1A2B4F] to-[#232946]",
      accentColor: "#4A90E2", // ブルー系
      icon: LogIn,
      title: "おかえりなさい",
      subtitle: "あなたの思い出の扉を開きましょう",
      buttonText: "ログイン",
      borderColor: "#4A90E2"
    },
    signup: {
      bgGradient: "from-[#0B192F] via-[#2F1B69] to-[#232946]", 
      accentColor: "#D4AF37", // ゴールド系
      icon: UserPlus,
      title: "はじめましょう",
      subtitle: "新しい思い出の宝箱を作りましょう",
      buttonText: "アカウント作成",
      borderColor: "#D4AF37"
    }
  };

  const config = modeConfig[mode];
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
      <div 
        className={`relative bg-gradient-to-b ${config.bgGradient} rounded-3xl max-w-md w-full mx-4 shadow-2xl border-2 transition-all duration-300 flex flex-col max-h-[90vh]`}
        style={{ borderColor: `${config.borderColor}40` }}
      >
        {/* ヘッダー (固定) */}
        <div className="p-8 pb-0 flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-[#F5F5DC] hover:text-[#D4AF37] transition-colors z-10"
          >
            <X size={24} />
          </button>

          {/* ヘッダーセクション */}
          <div className="text-center relative">
            {/* アイコン背景 */}
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${config.accentColor}20`, border: `2px solid ${config.accentColor}` }}
            >
              <IconComponent size={32} style={{ color: config.accentColor }} />
            </div>
            
            {/* タイトル */}
            <h2 
              className="font-serif text-3xl font-bold mb-2"
              style={{ color: config.accentColor }}
            >
              {config.title}
            </h2>
            
            {/* サブタイトル */}
            <p className="text-[#F5F5DC] text-lg">
              {config.subtitle}
            </p>
            
            {/* 装飾ライン */}
            <div 
              className="w-24 h-1 mx-auto mt-4 rounded-full"
              style={{ backgroundColor: config.accentColor }}
            />
          </div>
        </div>

        {/* コンテンツエリア (スクロール可能) */}
        <div className="flex-1 overflow-y-auto px-8">
          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-[#F5F5DC] text-sm font-medium mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} style={{ color: config.accentColor }} />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] rounded-xl text-[#F5F5DC] placeholder-gray-400 focus:outline-none transition-all duration-200 border-2"
                  style={{ 
                    borderColor: `${config.accentColor}30`
                  }}
                  placeholder="your@email.com"
                  onFocus={(e) => e.target.style.borderColor = config.accentColor}
                  onBlur={(e) => e.target.style.borderColor = `${config.accentColor}30`}
                />
              </div>
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-[#F5F5DC] text-sm font-medium mb-2">
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} style={{ color: config.accentColor }} />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] rounded-xl text-[#F5F5DC] placeholder-gray-400 focus:outline-none transition-all duration-200 border-2"
                  style={{ 
                    borderColor: `${config.accentColor}30`
                  }}
                  placeholder="••••••••"
                  onFocus={(e) => e.target.style.borderColor = config.accentColor}
                  onBlur={(e) => e.target.style.borderColor = `${config.accentColor}30`}
                />
              </div>
            </div>

            {/* パスワード確認（新規登録時のみ） */}
            {mode === "signup" && (
              <div>
                <label htmlFor="confirmPassword" className="block text-[#F5F5DC] text-sm font-medium mb-2">
                  パスワード確認
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={20} style={{ color: config.accentColor }} />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] rounded-xl text-[#F5F5DC] placeholder-gray-400 focus:outline-none transition-all duration-200 border-2"
                    style={{ 
                      borderColor: `${config.accentColor}30`
                    }}
                    placeholder="••••••••"
                    onFocus={(e) => e.target.style.borderColor = config.accentColor}
                    onBlur={(e) => e.target.style.borderColor = `${config.accentColor}30`}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded-xl p-4 text-red-200 text-sm flex items-center gap-3 backdrop-blur-sm">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="bg-green-900/50 border border-green-500 rounded-xl p-4 text-green-200 text-sm flex items-center gap-3 backdrop-blur-sm">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span>{message}</span>
              </div>
            )}
          </form>
        </div>

        {/* フッター (固定) */}
        <div className="p-8 pt-4 flex-shrink-0">
          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 mb-6"
            style={{
              background: mode === "login" 
                ? `linear-gradient(135deg, ${config.accentColor}, ${config.accentColor}CC)`
                : `linear-gradient(135deg, ${config.accentColor}, #F5F5DC)`,
              color: mode === "login" ? "#FFFFFF" : "#0B192F"
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                処理中...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <IconComponent size={20} />
                {config.buttonText}
              </div>
            )}
          </button>

          <div className="text-center">
            <p className="text-[#F5F5DC] text-sm mb-3">
              {mode === "login" ? "アカウントをお持ちでない方" : "既にアカウントをお持ちの方"}
            </p>
            <button
              onClick={switchMode}
              className="px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105"
              style={{
                color: config.accentColor,
                background: mode === "login" 
                  ? `linear-gradient(135deg, ${config.accentColor}20, ${config.accentColor}10)`
                  : `linear-gradient(135deg, ${config.accentColor}20, #F5F5DC30)`,
                border: `1px solid ${config.accentColor}30`
              }}
            >
              {mode === "login" ? "新規登録はこちら" : "ログインはこちら"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
