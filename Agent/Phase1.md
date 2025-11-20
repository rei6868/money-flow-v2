📋 MONEY FLOW 2.0 - BUILD INSTRUCTIONS FOR AI AGENT
🎯 PROJECT OVERVIEW
Project Name: Money Flow 2.0
Tech Stack: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase
Database: PostgreSQL (Supabase) - Already migrated
Current Status: Landing page completed at localhost:3000

🚀 PHASE 1: AUTHENTICATION SYSTEM
1.1 Setup Supabase Auth
File: src/middleware.ts

typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user && !request.nextUrl.pathname.startsWith('/auth') && request.nextUrl.pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if already authenticated
  if (user && request.nextUrl.pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
1.2 Create Auth Context
File: src/contexts/auth-context.tsx

typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    router.push('/dashboard')
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })
    if (error) throw error
    
    // Create initial person record
    if (data.user) {
      await supabase.from('people').insert({
        name,
        email,
        user_id: data.user.id,
        is_group: false,
      })
    }
    
    router.push('/dashboard')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
1.3 Create Login Page
File: src/app/auth/login/page.tsx

typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { Wallet } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await signIn(email, password)
      toast({
        title: 'Đăng nhập thành công',
        description: 'Chào mừng bạn trở lại!',
      })
    } catch (error: any) {
      toast({
        title: 'Lỗi đăng nhập',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập email và mật khẩu để truy cập tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
            <p className="text-sm text-center text-slate-600">
              Chưa có tài khoản?{' '}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
1.4 Create Signup Page
File: src/app/auth/signup/page.tsx

typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { Wallet } from 'lucide-react'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: 'Lỗi',
        description: 'Mật khẩu xác nhận không khớp',
        variant: 'destructive',
      })
      return
    }
    
    setLoading(true)
    
    try {
      await signUp(email, password, name)
      toast({
        title: 'Đăng ký thành công',
        description: 'Chào mừng bạn đến với Money Flow 2.0!',
      })
    } catch (error: any) {
      toast({
        title: 'Lỗi đăng ký',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
          <CardDescription>
            Nhập thông tin để tạo tài khoản mới
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </Button>
            <p className="text-sm text-center text-slate-600">
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Đăng nhập
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
1.5 Update Root Layout
File: src/app/layout.tsx - Add AuthProvider:

typescript
import { AuthProvider } from "@/contexts/auth-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
🎨 PHASE 2: DASHBOARD LAYOUT
2.1 Create Sidebar Component
File: src/components/layout/sidebar.tsx

typescript
'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Users,
  CreditCard,
  Gift,
  TrendingUp,
  Settings,
  FileText,
  DollarSign,
} from 'lucide-react'

const navigation = [
  {
    title: 'Tổng quan',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Giao dịch',
    items: [
      { name: 'Danh sách giao dịch', href: '/dashboard/transactions', icon: ArrowLeftRight },
      { name: 'Tài khoản', href: '/dashboard/accounts', icon: Wallet },
      { name: 'Danh mục', href: '/dashboard/categories', icon: FileText },
    ],
  },
  {
    title: 'Quản lý',
    items: [
      { name: 'Người & Nợ', href: '/dashboard/people', icon: Users },
      { name: 'Cashback', href: '/dashboard/cashback', icon: Gift },
      { name: 'Lợi nhuận thẻ', href: '/dashboard/card-pl', icon: CreditCard },
    ],
  },
  {
    title: 'Báo cáo',
    items: [
      { name: 'Phân tích', href: '/dashboard/analytics', icon: TrendingUp },
      { name: 'Ngân sách', href: '/dashboard/budget', icon: DollarSign },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-50">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Wallet className="h-6 w-6 text-primary" />
          <span className="text-lg">Money Flow 2.0</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <h4 className="mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-3',
                          isActive && 'bg-slate-200 font-medium'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Settings */}
      <div className="border-t p-3">
        <Link href="/dashboard/settings">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Settings className="h-4 w-4" />
            Cài đặt
          </Button>
        </Link>
      </div>
    </div>
  )
}
2.2 Create Header Component
File: src/components/layout/header.tsx

typescript
'use client'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bell, LogOut, Settings, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
  }

  const userInitials = user?.user_metadata?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-white px-6">
      <div className="flex flex-1 items-center justify-between">
        {/* Search or breadcrumbs can go here */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900">
            Chào mừng trở lại, {user?.user_metadata?.name || 'User'}!
          </h2>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-primary text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.user_metadata?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <User className="mr-2 h-4 w-4" />
                Hồ sơ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
2.3 Create Dashboard Layout
File: src/app/dashboard/layout.tsx

typescript
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
2.4 Create Dashboard Home Page
File: src/app/dashboard/page.tsx

typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, Wallet, CreditCard } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-600">Tổng quan tài chính của bạn</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thu nhập</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,000,000₫</div>
            <p className="text-xs text-slate-600">+20% từ tháng trước</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,500,000₫</div>
            <p className="text-xs text-slate-600">-5% từ tháng trước</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số dư tài khoản</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25,450,000₫</div>
            <p className="text-xs text-slate-600">Trên 3 tài khoản</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cashback kiếm được</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127,500₫</div>
            <p className="text-xs text-slate-600">Tháng này</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Giao dịch gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Sẽ được cập nhật sau khi hoàn thành Transactions List</p>
        </CardContent>
      </Card>
    </div>
  )
}
💰 PHASE 3: TRANSACTIONS LIST & FORM
3.1 Create Transactions List Page
File: src/app/dashboard/transactions/page.tsx

typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Filter, Download, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import numeral from 'numeral'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

type Transaction = {
  id: string
  date: string
  type: string
  status: string
  amount: number
  final_amount: number
  description: string
  category_id: string
  categories?: {
    name: string
    icon: string
  }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchTransactions()
  }, [filterType])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('transactions')
        .select(`
          *,
          categories (
            name,
            icon
          )
        `)
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(50)

      if (filterType !== 'all') {
        query = query.eq('type', filterType.toUpperCase())
      }

      const { data, error } = await query

      if (error) throw error
      setTransactions(data || [])
    } catch (error: any) {
      toast({
        title: 'Lỗi tải dữ liệu',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa giao dịch này?')) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Thành công',
        description: 'Đã xóa giao dịch',
      })

      fetchTransactions()
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INCOME':
        return 'bg-green-100 text-green-800'
      case 'EXPENSE':
        return 'bg-red-100 text-red-800'
      case 'TRANSFER':
        return 'bg-blue-100 text-blue-800'
      case 'DEBT':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'INCOME':
        return 'Thu nhập'
      case 'EXPENSE':
        return 'Chi tiêu'
      case 'TRANSFER':
        return 'Chuyển khoản'
      case 'DEBT':
        return 'Nợ'
      case 'DEBT_REPAYMENT':
        return 'Trả nợ'
      default:
        return type
    }
  }

  const filteredTransactions = transactions.filter((txn) =>
    txn.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Giao dịch</h1>
          <p className="text-slate-600">Quản lý tất cả các giao dịch của bạn</p>
        </div>
        <Link href="/dashboard/transactions/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo giao dịch
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm giao dịch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="income">Thu nhập</SelectItem>
              <SelectItem value="expense">Chi tiêu</SelectItem>
              <SelectItem value="transfer">Chuyển khoản</SelectItem>
              <SelectItem value="debt">Nợ</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Xuất Excel
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead className="text-right">Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Chưa có giao dịch nào
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-medium">
                    {format(new Date(txn.date), 'dd/MM/yyyy', { locale: vi })}
                  </TableCell>
                  <TableCell>{txn.description || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{txn.categories?.icon}</span>
                      <span>{txn.categories?.name || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(txn.type)}>
                      {getTypeName(txn.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    <span className={txn.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                      {txn.type === 'INCOME' ? '+' : '-'}
                      {numeral(txn.final_amount || txn.amount).format('0,0')}₫
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={txn.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {txn.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/transactions/${txn.id}`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(txn.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
3.2 Create Transaction Form
File: src/app/dashboard/transactions/new/page.tsx (continued in next message due to length)

typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function NewTransactionPage() {
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [type, setType] = useState('EXPENSE')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
    fetchAccounts()
  }, [type])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user?.id)
      .eq('type', type)
      .order('name')
    
    setCategories(data || [])
  }

  const fetchAccounts = async () => {
    const { data } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user?.id)
      .eq('is_active', true)
      .order('name')
    
    setAccounts(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create transaction
      const { data: txn, error: txnError } = await supabase
        .from('transactions')
        .insert({
          date: format(date, 'yyyy-MM-dd'),
          type,
          amount: parseFloat(amount),
          final_amount: parseFloat(amount),
          description,
          category_id: categoryId || null,
          user_id: user?.id,
          created_by: user?.id,
        })
        .select()
        .single()

      if (txnError) throw txnError

      // Create transaction line
      const { error: lineError } = await supabase
        .from('transaction_lines')
        .insert({
          transaction_id: txn.id,
          line_type: type === 'INCOME' ? 'TO' : 'FROM',
          account_id: accountId,
          amount: parseFloat(amount),
          user_id: user?.id,
        })

      if (lineError) throw lineError

      toast({
        title: 'Thành công',
        description: 'Đã tạo giao dịch mới',
      })

      router.push('/dashboard/transactions')
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/transactions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Tạo giao dịch mới</h1>
          <p className="text-slate-600">Nhập thông tin giao dịch</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin giao dịch</CardTitle>
          <CardDescription>Điền các trường bên dưới để tạo giao dịch mới</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label>Loại giao dịch *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Thu nhập</SelectItem>
                  <SelectItem value="EXPENSE">Chi tiêu</SelectItem>
                  <SelectItem value="TRANSFER">Chuyển khoản</SelectItem>
                  <SelectItem value="DEBT">Nợ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Ngày giao dịch *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Số tiền *</Label>
              <Input
                id="amount"
                type="number"
                step="1000"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account */}
            <div className="space-y-2">
              <Label>Tài khoản *</Label>
              <Select value={accountId} onValueChange={setAccountId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tài khoản" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả giao dịch..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Đang xử lý...' : 'Tạo giao dịch'}
              </Button>
              <Link href="/dashboard/transactions" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Hủy
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
📝 IMPLEMENTATION CHECKLIST
 Install missing shadcn components: scroll-area, avatar

 Create all auth files (middleware, context, login, signup)

 Update root layout with AuthProvider

 Create layout components (Sidebar, Header)

 Create dashboard layout and home page

 Create transactions list page

 Create transaction form page

 Test authentication flow

 Test navigation between pages

 Test transaction CRUD operations

🎯 EXPECTED RESULT
After completing all steps, you should have:

✅ Working Authentication - Users can signup/login/logout

✅ Dashboard Layout - Professional sidebar + header navigation

✅ Transactions Management - Full CRUD for transactions with:

List view with filters

Create form with validation

Edit capability (stretch goal)

Delete with confirmation

Real-time sync with Supabase