import React from 'react';
import { ShieldAlert, RefreshCw, AlertCircle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[MeatGuard ErrorBoundary] Caught render crash:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    try {
      // Clear potentially corrupted state in localStorage
      localStorage.removeItem('meatguard_scans_v1');
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen ambient-dark-bg text-slate-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121824]/95 border border-rose-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Đã xảy ra sự cố hiển thị trên thiết bị
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                MeatGuard đã tự động cách ly lỗi để bảo vệ ứng dụng khỏi hiện tượng trắng màn hình. Bạn có thể bấm nút bên dưới để khôi phục nhanh.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50 transition-transform active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Khôi phục & Tải lại ứng dụng</span>
              </button>
            </div>

            {this.state.error && (
              <details className="text-left pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                <summary className="cursor-pointer text-slate-400 hover:text-slate-300">
                  Chi tiết kỹ thuật
                </summary>
                <pre className="mt-2 p-2 rounded bg-slate-950/80 border border-slate-800/80 overflow-x-auto whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
