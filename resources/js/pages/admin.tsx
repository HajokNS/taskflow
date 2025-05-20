import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Trash2, Edit, ArrowLeft, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  email_verified_at: string | null;
}

export default function AdminIndex({ users = [] }: { users: User[] }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const { data, setData, put, processing, errors } = useForm({
    name: '',
    email: '',
    is_admin: false
  });

  const handleEditClick = (user: User) => {
    setCurrentUser(user);
    setData({
      name: user.name,
      email: user.email,
      is_admin: user.is_admin
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!currentUser) return;
    
    put(route('admin.users.update', currentUser.id), {
      onSuccess: () => {
        setEditDialogOpen(false);
        toast.success('Зміни збережено успішно');
      },
      onError: () => {
        toast.error('Не вдалося зберегти зміни');
      }
    });
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
  if (!userToDelete) return;

  try {
    
    await axios.post(`/admin/users/${userToDelete.id}`);
    
    // Показуємо повідомлення про успіх
    toast.success('Користувача успішно видалено');
    
    // Додаємо затримку 1 секунду перед перезавантаженням

      window.location.reload();

    
  } catch (error) {
    toast.error('Не вдалося видалити користувача');
    console.error('Помилка видалення:', error);
  } finally {
    setDeleteDialogOpen(false);
  }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <AppLayout>
      <Head title="Адмін-панель" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Керування користувачами</h1>
          <div className="flex gap-2">
            <Link href="/boards">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
            </Link>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ім'я</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата реєстрації</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_admin ? 'default' : 'outline'}>
                        {user.is_admin ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Адмін
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 mr-1" />
                            Користувач
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.email_verified_at ? 'default' : 'secondary'}>
                        {user.email_verified_at ? 'Підтверджений' : 'Не підтверджений'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(user)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Редагувати
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setUserToDelete(user);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={user.is_admin}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Видалити
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Користувачів не знайдено
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Діалог підтвердження видалення */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Підтвердіть видалення</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Ви впевнені, що хочете видалити користувача <strong>{userToDelete?.name}</strong>?</p>
            <p className="text-muted-foreground text-sm mt-2">Email: {userToDelete?.email}</p>
            <p className="text-destructive mt-4">Цю дію неможливо скасувати!</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Скасувати
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Видалити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Діалог редагування користувача */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редагування користувача</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Ім'я
              </Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="col-span-3"
              />
              {errors.name && <p className="col-span-4 text-right text-sm text-destructive">{errors.name}</p>}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className="col-span-3"
              />
              {errors.email && <p className="col-span-4 text-right text-sm text-destructive">{errors.email}</p>}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Роль
              </Label>
              <Select
                value={data.is_admin ? 'admin' : 'user'}
                onValueChange={(value) => setData('is_admin', value === 'admin')}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Оберіть роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Адміністратор</SelectItem>
                  <SelectItem value="user">Користувач</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={handleSaveEdit} disabled={processing}>
              {processing ? 'Збереження...' : 'Зберегти зміни'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}