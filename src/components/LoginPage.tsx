import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { BarChart3, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

type ViewMode = 'login' | 'signup' | 'reset';

export function LoginPage({ onLogin }: LoginPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetMessage, setShowResetMessage] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResetMessage(true);
    setTimeout(() => {
      setShowResetMessage(false);
      setViewMode('login');
    }, 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#51A2FF' }}>
      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      
      {/* Back button */}
      {viewMode !== 'login' && (
        <button
          onClick={() => setViewMode('login')}
          className="absolute top-8 left-8 flex items-center gap-2 text-white/90 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">로그인으로 돌아가기</span>
        </button>
      )}

      <Card className="w-full max-w-md border-0 shadow-2xl backdrop-blur-sm bg-white/95 relative z-10">
        <CardHeader className="space-y-4 text-center pb-6 pt-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-2 mt-5">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-blue-600 font-bold text-[32px]">REX</span>
          </div>

          {/* Title */}
          {viewMode === 'login' && (
            <>
              <h1 className="text-gray-900 text-[16px]">RAG 애플리케이션의 성능을 분석하고 최적화하세요.</h1>
            </>
          )}
          {viewMode === 'signup' && (
            <>
              <h1 className="text-gray-900 text-[28px]">계정 만들기</h1>
              <p className="text-gray-500 text-sm">
                REX에 가입하여 RAG 애플리케이션 평가를 시작하세요.
              </p>
            </>
          )}
          {viewMode === 'reset' && (
            <>
              <h1 className="text-gray-900 text-[28px]">비밀번호 재설정</h1>
              <p className="text-gray-500 text-sm">
                비밀번호 재설정 링크를 받을 이메일을 입력하세요.
              </p>
            </>
          )}
        </CardHeader>

        <CardContent className="px-6 pb-6">
          {/* Login Form */}
          {viewMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 text-sm">
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 text-sm">
                  비밀번호
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-gray-600 cursor-pointer select-none"
                  >
                    로그인 상태 유지
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('reset')}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  비밀번호를 잊으셨나요?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-white"
              >
                로그인
              </Button>

              <p className="text-center text-xs text-gray-600 mt-4">
                계정이 없으신가요?{' '}
                <button
                  type="button"
                  onClick={() => setViewMode('signup')}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  회원가입
                </button>
              </p>

              <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-center text-blue-700 text-xs">
                  데모: 아무 값이나 입력하면 시스템에 접속할 수 있습니다
                </p>
              </div>
            </form>
          )}

          {/* Signup Form */}
          {viewMode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-gray-700 text-sm">
                  이름
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                  className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-gray-700 text-sm">
                  이메일 주소
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-gray-700 text-sm">
                  비밀번호
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="비밀번호 생성 (8자 이상)"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-white"
              >
                계정 만들기
              </Button>

              <p className="text-center text-sm text-gray-600 mt-4">
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  로그인
                </button>
              </p>

              <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-center text-blue-700 text-xs">
                  데모: 아무 정보나 입력하면 계정이 생성됩니다
                </p>
              </div>
            </form>
          )}

          {/* Reset Password Form */}
          {viewMode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-gray-700 text-sm">
                  이메일 주소
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="가입한 이메일을 입력하세요"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                />
                <p className="text-gray-500 text-xs mt-1">
                  비밀번호 재설정 링크를 이메일로 보내드립니다
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-white"
              >
                재설정 링크 보내기
              </Button>

              {showResetMessage && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <p className="text-blue-700 text-sm">
                    ✓ 비밀번호 재설정 이메일이 전송되었습니다!
                  </p>
                </div>
              )}

              <p className="text-center text-sm text-gray-600 mt-4">
                비밀번호가 기억나셨나요?{' '}
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  로그인
                </button>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
