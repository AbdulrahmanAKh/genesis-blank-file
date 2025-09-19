import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import TransactionHistory from '@/components/Wallet/TransactionHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download,
  Plus,
  Banknote,
  Building,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const WalletPage = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Mock wallet data - would come from API
  const walletData = {
    currentBalance: 1250,
    totalEarnings: 2750,
    commissionPaid: 275,
    pendingAmount: 150,
    monthlyEarnings: 2750,
    availableForWithdraw: 1100
  };

  const banks = [
    { id: 'rajhi', name: 'مصرف الراجحي' },
    { id: 'ncb', name: 'البنك الأهلي التجاري' },
    { id: 'riyad', name: 'بنك الرياض' },
    { id: 'samba', name: 'بنك سامبا' },
    { id: 'arab', name: 'البنك العربي الوطني' }
  ];

  const handleWithdraw = async () => {
    if (!withdrawAmount || !selectedBank || !accountNumber) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount < 100) {
      toast({
        title: "خطأ",
        description: "الحد الأدنى للسحب هو 100 ريال",
        variant: "destructive"
      });
      return;
    }

    if (amount > walletData.availableForWithdraw) {
      toast({
        title: "خطأ",
        description: "المبلغ أكبر من الرصيد المتاح",
        variant: "destructive"
      });
      return;
    }

    setIsWithdrawing(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "تم بنجاح!",
        description: `تم طلب سحب ${amount} ريال. ستتم المعالجة خلال 1-3 أيام عمل.`
      });
      
      setWithdrawAmount('');
      setSelectedBank('');
      setAccountNumber('');
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في طلب السحب",
        variant: "destructive"
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const exportTransactions = () => {
    // Mock export functionality
    toast({
      title: "تم التصدير",
      description: "تم تحميل ملف Excel بالعمليات المالية"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">المحفظة الرقمية</h1>
              <p className="text-muted-foreground">
                إدارة أموالك ومتابعة العمليات المالية
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportTransactions} className="gap-2">
                <Download className="h-4 w-4" />
                تصدير العمليات
              </Button>
              {(userRole === 'organizer' || userRole === 'provider') && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <CreditCard className="h-4 w-4" />
                      سحب الأموال
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>سحب الأموال</DialogTitle>
                      <DialogDescription>
                        اسحب أموالك إلى حسابك البنكي
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="amount">المبلغ (ريال)</Label>
                        <Input
                          id="amount"
                          type="number"
                          min="100"
                          max={walletData.availableForWithdraw}
                          placeholder="أدخل المبلغ"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          المتاح للسحب: {walletData.availableForWithdraw} ريال
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="bank">البنك</Label>
                        <Select value={selectedBank} onValueChange={setSelectedBank}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر البنك" />
                          </SelectTrigger>
                          <SelectContent>
                            {banks.map((bank) => (
                              <SelectItem key={bank.id} value={bank.id}>
                                {bank.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="account">رقم الحساب</Label>
                        <Input
                          id="account"
                          placeholder="أدخل رقم الحساب البنكي"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                        />
                      </div>
                      
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          مدة المعالجة: 1-3 أيام عمل. رسوم السحب: 5 ريال
                        </AlertDescription>
                      </Alert>
                      
                      <Button 
                        onClick={handleWithdraw} 
                        disabled={isWithdrawing}
                        className="w-full"
                      >
                        {isWithdrawing ? "جاري المعالجة..." : "تأكيد السحب"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Balance Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الرصيد الحالي</CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {walletData.currentBalance.toLocaleString()} ريال
                </div>
                <p className="text-xs text-muted-foreground">
                  إجمالي الرصيد
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المتاح للسحب</CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {walletData.availableForWithdraw.toLocaleString()} ريال
                </div>
                <p className="text-xs text-muted-foreground">
                  يمكن سحبه الآن
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الأرباح الشهرية</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {walletData.monthlyEarnings.toLocaleString()} ريال
                </div>
                <p className="text-xs text-muted-foreground">
                  هذا الشهر
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">العمولة المدفوعة</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {walletData.commissionPaid.toLocaleString()} ريال
                </div>
                <p className="text-xs text-muted-foreground">
                  10% من الأرباح
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          {(userRole === 'organizer' || userRole === 'provider') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  إجراءات سريعة
                </CardTitle>
                <CardDescription>
                  العمليات المالية المتاحة لحسابك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Banknote className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">تحويل فوري</h3>
                      <p className="text-sm text-muted-foreground">سحب لحسابك البنكي</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">كشف حساب</h3>
                      <p className="text-sm text-muted-foreground">تحميل كشف شهري</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">تقرير الأرباح</h3>
                      <p className="text-sm text-muted-foreground">تحليل مفصل للأرباح</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction History */}
          <TransactionHistory userId={user?.id} userRole={userRole} />

          {/* Information Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>معلومات السحب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>يتم خصم العمولة 10% تلقائياً من كل عملية دفع</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>يمكنك سحب الأموال إلى حسابك البنكي في أي وقت</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>مدة معالجة السحب: 1-3 أيام عمل</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>الحد الأدنى للسحب: 100 ريال</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>نصائح مالية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>راقب أرباحك الشهرية لتحسين الأداء</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>اسحب أموالك بانتظام لتجنب التراكم</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>احتفظ بسجل لجميع معاملاتك المالية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>استخدم التقارير لتحليل مصادر دخلك</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WalletPage;