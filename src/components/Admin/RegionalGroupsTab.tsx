import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

export const RegionalGroupsTab = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    region: '',
    description: ''
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('regional_groups' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error loading regional groups:', error);
      toast.error('حدث خطأ في تحميل المجموعات الإقليمية');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingGroup) {
        const { error } = await supabase
          .from('regional_groups' as any)
          .update(formData)
          .eq('id', editingGroup.id);
        
        if (error) throw error;
        toast.success('تم تحديث المجموعة بنجاح');
      } else {
        const { error } = await supabase
          .from('regional_groups' as any)
          .insert(formData);
        
        if (error) throw error;
        toast.success('تم إضافة المجموعة بنجاح');
      }
      
      setDialogOpen(false);
      setEditingGroup(null);
      setFormData({ name: '', name_ar: '', region: '', description: '' });
      loadGroups();
    } catch (error) {
      console.error('Error saving group:', error);
      toast.error('حدث خطأ في حفظ المجموعة');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟')) return;
    
    try {
      const { error } = await supabase
        .from('regional_groups' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('تم حذف المجموعة');
      loadGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('حدث خطأ في الحذف');
    }
  };

  const openDialog = (group?: any) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        name_ar: group.name_ar,
        region: group.region,
        description: group.description || ''
      });
    } else {
      setEditingGroup(null);
      setFormData({ name: '', name_ar: '', region: '', description: '' });
    }
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            إدارة المجموعات الإقليمية
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة مجموعة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingGroup ? 'تعديل المجموعة' : 'إضافة مجموعة إقليمية'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name_ar">الاسم (عربي) *</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    placeholder="مجموعة الرياض"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">الاسم (English) *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Riyadh Group"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="region">المنطقة *</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="الرياض"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف المجموعة"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingGroup ? 'تحديث' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : groups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد مجموعات إقليمية حالياً
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم (عربي)</TableHead>
                <TableHead>الاسم (English)</TableHead>
                <TableHead>المنطقة</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name_ar}</TableCell>
                  <TableCell>{group.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{group.region}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {group.description || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(group)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(group.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
