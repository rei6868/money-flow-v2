import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Wallet, TrendingUp, CreditCard, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold text-slate-900">
            Money Flow 2.0
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Quản lý tài chính cá nhân thông minh với theo dõi nợ, cashback và phân tích chi tiêu
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Bắt đầu ngay <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Wallet className="w-10 h-10 text-blue-500 mb-2" />
              <CardTitle>Quản lý tài khoản</CardTitle>
              <CardDescription>
                Theo dõi nhiều tài khoản ngân hàng, thẻ tín dụng và ví điện tử
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-10 h-10 text-green-500 mb-2" />
              <CardTitle>Phân tích chi tiêu</CardTitle>
              <CardDescription>
                Báo cáo chi tiết theo danh mục, thời gian và xu hướng
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CreditCard className="w-10 h-10 text-purple-500 mb-2" />
              <CardTitle>Cashback thông minh</CardTitle>
              <CardDescription>
                Tự động tính toán và tối ưu hóa hoàn tiền từ thẻ tín dụng
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-10 h-10 text-orange-500 mb-2" />
              <CardTitle>Quản lý nợ</CardTitle>
              <CardDescription>
                Theo dõi công nợ với bạn bè và gia đình một cách rõ ràng
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats */}
        <div className="mt-16 text-center">
          <Card className="inline-block">
            <CardContent className="pt-6">
              <div className="flex gap-12">
                <div>
                  <div className="text-3xl font-bold text-slate-900">17,000+</div>
                  <div className="text-sm text-slate-600">Giao dịch</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">10+</div>
                  <div className="text-sm text-slate-600">Người dùng</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">100%</div>
                  <div className="text-sm text-slate-600">Realtime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}