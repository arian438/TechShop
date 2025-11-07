
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  ShoppingCart, 
  User as UserIcon, 
  TrendingUp, 
  DollarSign,
  ChevronRight,
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Database
} from '../components/icons/index';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Product, User as UserType, Order, Brand, Category } from '../types';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { AddProductForm } from '../components/admin/AddProductForm';
import { AddUserForm } from '../components/admin/AddUserForm';
import { OrderDetailsModal } from '../components/admin/OrderDetailsModal';
import { toast } from '../components/ui/sonner';
import { useCollection, useFirebase, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { seedDatabase } from '@/lib/seed';

interface AdminScreenProps {
  currentUser: UserType;
}

export function AdminScreen({ currentUser }: AdminScreenProps) {
  const [activeTab, setActiveTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [editingUser, setEditingUser] = useState<UserType | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const { firestore, auth } = useFirebase();
  
  const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const categoriesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
  const brandsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'brands') : null, [firestore]);
  const ordersCollection = useMemoFirebase(() => firestore ? collection(firestore, 'orders') : null, [firestore]);
  const usersCollection = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);

  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsCollection);
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesCollection);
  const { data: brands, isLoading: brandsLoading } = useCollection<Brand>(brandsCollection);
  const { data: orders, isLoading: ordersLoading } = useCollection<Order>(ordersCollection);
  const { data: users, isLoading: usersLoading } = useCollection<UserType>(usersCollection);


  const isLoading = productsLoading || categoriesLoading || brandsLoading || ordersLoading || usersLoading;

  const isAdmin = currentUser?.role === 'admin';
  
  const totalProducts = products?.length || 0;
  const activeProducts = products?.filter(p => p.isActive).length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery) return products;
    return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, searchQuery]);

  const filteredOrders = useMemo(() => {
    if (!orders || !users) return [];
    if (!searchQuery) return orders;
    return orders.filter(o => o.id.toLowerCase().includes(searchQuery.toLowerCase()) || users.find(u => u.id === o.userId)?.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [orders, users, searchQuery]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchQuery) return users;
    return users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [users, searchQuery]);


  const getStatusBadge = (status: string) => {
    const statusMap = {
      'new': { label: 'Новый', variant: 'secondary' as const },
      'processing': { label: 'В обработке', variant: 'default' as const },
      'paid': { label: 'Оплачен', variant: 'default' as const },
      'shipping': { label: 'В пути', variant: 'default' as const },
      'delivered': { label: 'Доставлен', variant: 'outline' as const },
      'cancelled': { label: 'Отменен', variant: 'destructive' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const roleMap = {
      'admin': { label: 'Администратор', variant: 'destructive' as const },
      'manager': { label: 'Менеджер', variant: 'default' as const },
      'user': { label: 'Пользователь', variant: 'secondary' as const },
    };
    
    const roleInfo = roleMap[role as keyof typeof roleMap] || { label: role, variant: 'secondary' as const };
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  const handleDeleteUser = (userId: string) => {
    if (!firestore || !orders) return;

    const userHasOrders = orders.some(order => order.userId === userId);
    if (userHasOrders) {
      toast({ title: 'Ошибка удаления', description: 'Нельзя удалить пользователя, так как он связан с заказами.', variant: 'destructive' });
      return;
    }

    const userRef = doc(firestore, "users", userId);
    deleteDoc(userRef)
      .then(() => {
        toast({ title: 'Пользователь удален' });
      })
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userRef.path,
          operation: 'delete',
        }));
      });
  };

  const handleDeleteProduct = (productId: string) => {
    if (!firestore || !orders) return;

    const productInOrders = orders.some(order => order.items.some(item => item.productId === productId));
    if (productInOrders) {
      toast({ title: 'Ошибка удаления', description: 'Нельзя удалить товар, так как он находится в заказах.', variant: 'destructive' });
      return;
    }

     const productRef = doc(firestore, 'products', productId);
     deleteDoc(productRef).then(() => {
      toast({ title: 'Товар удален' });
     }).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: productRef.path,
        operation: 'delete',
      }));
     });
  };

  const handleSaveProduct = (productData: Partial<Product>, editProduct?: Product) => {
    if (!firestore) return;
    
    if (editProduct) {
      const productRef = doc(firestore, 'products', editProduct.id);
      setDoc(productRef, productData, { merge: true })
        .then(() => {
          toast({ title: 'Товар обновлен' });
          setShowAddProductForm(false);
          setEditingProduct(undefined);
        })
        .catch(serverError => {
          const permissionError = new FirestorePermissionError({
            path: productRef.path,
            operation: 'update',
            requestResourceData: productData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    } else {
      const newProductData: Omit<Product, 'id'> = {
        ...(productData as Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewsCount'>),
        rating: 0,
        reviewsCount: 0,
        createdAt: new Date().toISOString(),
      };
      const productsRef = collection(firestore, 'products');
      addDoc(productsRef, newProductData)
        .then(() => {
          toast({ title: 'Товар добавлен' });
          setShowAddProductForm(false);
          setEditingProduct(undefined);
        })
        .catch(serverError => {
          const permissionError = new FirestorePermissionError({
            path: productsRef.path,
            operation: 'create',
            requestResourceData: newProductData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  };
  
  const handleSaveUser = async (userData: Omit<UserType, 'id' | 'createdAt' | 'addresses' | 'favoriteProducts'>, password?: string, editUser?: UserType) => {
    if (!firestore || !auth) {
        throw new Error("Firebase not initialized");
    }

    if (editUser) {
        const userRef = doc(firestore, 'users', editUser.id);
        const dataToUpdate = { ...userData };
        
        setDoc(userRef, dataToUpdate, { merge: true })
          .then(() => {
            toast({ title: 'Данные пользователя обновлены' });
          })
          .catch(() => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: userRef.path,
              operation: 'update',
              requestResourceData: dataToUpdate,
            }));
          });

    } else if (password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
            const firebaseUser = userCredential.user;

            const userDocRef = doc(firestore, 'users', firebaseUser.uid);
            const newUser: Omit<UserType, 'id'> = {
                ...userData,
                favoriteProducts: [],
                addresses: [],
                createdAt: new Date().toISOString(),
            };
            setDoc(userDocRef, newUser).then(() => {
              toast({ title: 'Пользователь успешно создан' });
            }).catch(() => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'create',
                requestResourceData: newUser,
              }));
            });

        } catch (error: any) {
            console.error("Error creating user:", error);
            let errorMessage = "Произошла неизвестная ошибка.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "Этот email уже используется.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Неверный формат email.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Пароль слишком слабый. Он должен содержать не менее 6 символов.";
            }
            throw new Error(errorMessage);
        }
    }
    
    setShowAddUserForm(false);
    setEditingUser(undefined);
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddProductForm(true);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setShowAddUserForm(true);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleEditOrder = (updatedOrder: Order) => {
    if (!firestore) return;
    const orderRef = doc(firestore, 'orders', updatedOrder.id);
    setDoc(orderRef, updatedOrder, { merge: true })
      .then(() => {
        toast({ title: 'Заказ обновлен' });
        setSelectedOrder(null);
      })
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: orderRef.path,
          operation: 'update',
          requestResourceData: updatedOrder,
        }));
      });
  };
  
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'products':
        return 'Поиск товаров...';
      case 'orders':
        return 'Поиск заказов...';
      case 'users':
        return 'Поиск пользователей...';
      default:
        return 'Поиск...';
    }
  };

  if (isLoading) {
    return <div className="p-4 space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <div className="p-4 space-y-4">
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Управление
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                        {isAdmin ? 'Полный доступ к системе' : 'Управление товарами и заказами'}
                        </p>
                    </div>
                    <Badge variant={isAdmin ? 'destructive' : 'default'} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                        {isAdmin ? 'Администратор' : 'Менеджер'}
                    </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Card className="border-0 shadow-md bg-white/50 backdrop-blur-sm">
                        <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                            <Package className="h-5 w-5 text-white" />
                            </div>
                            <div>
                            <div className="text-2xl font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{totalProducts}</div>
                            <div className="text-sm text-muted-foreground">Товаров</div>
                            </div>
                        </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-white/50 backdrop-blur-sm">
                        <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                            <ShoppingCart className="h-5 w-5 text-white" />
                            </div>
                            <div>
                            <div className="text-2xl font-medium bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{totalOrders}</div>
                            <div className="text-sm text-muted-foreground">Заказов</div>
                            </div>
                        </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-white/50 backdrop-blur-sm">
                        <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                            <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                            <div className="text-2xl font-medium bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{activeProducts}</div>
                            <div className="text-sm text-muted-foreground">Активных</div>
                            </div>
                        </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-white/50 backdrop-blur-sm">
                        <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                            <DollarSign className="h-5 w-5 text-white" />
                            </div>
                            <div>
                            <div className="text-lg font-medium bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{formatPrice(totalRevenue)}</div>
                            <div className="text-sm text-muted-foreground">Выручка</div>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full justify-center grid-cols-3 bg-white/70 backdrop-blur-sm">
                <div className="col-start-2 flex justify-center">
                    <TabsTrigger value="products">Товары</TabsTrigger>
                    <TabsTrigger value="orders">Заказы</TabsTrigger>
                    {isAdmin && <TabsTrigger value="users">Пользователи</TabsTrigger>}
                </div>
            </TabsList>
            
          <div className="mt-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={getSearchPlaceholder()}
                    className="pl-10 bg-muted"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {activeTab === 'users' && isAdmin && <Button size="sm" className="px-4" onClick={() => setShowAddUserForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>}
                 {activeTab === 'products' && <Button size="sm" className="px-4" onClick={() => setShowAddProductForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>}
                
              </div>
          </div>

          <TabsContent value="products" className="space-y-4 mt-4">
            <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
              <CardContent className="p-0">
                {filteredProducts.map((product, index) => (
                  <React.Fragment key={product.id}>
                    <div className="py-4 px-4 sm:px-6 flex items-center gap-4">
                      <ImageWithFallback src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{product.name}</p>
                         <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-black">{formatPrice(product.price)}</p>
                            {product.isActive && <Badge variant={'outline'} className="text-xs">
                                {"Активен"}
                            </Badge>}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}><Edit className="h-4 w-4" /></Button>
                         {isAdmin && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                 <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Это действие необратимо. Товар "{product.name}" будет удален.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                                    Удалить
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                      </div>
                    </div>
                    {index < filteredProducts.length - 1 && <div className="border-b mx-4" />}
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders" className="space-y-4 mt-4">
             <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
              <CardContent className="p-0">
                {filteredOrders.map((order, index) => {
                    const customer = users?.find(u => u.id === order.userId);
                    return (
                      <React.Fragment key={order.id}>
                        <div 
                          className="py-4 px-4 sm:px-6 flex items-center gap-3"
                          onClick={() => handleViewOrder(order)}
                        >
                          <div className="flex-1 space-y-1">
                            <div className='flex items-center gap-2'>
                                <p className='font-medium'>{'Заказ #' + order.id.substring(0, 4)}</p>
                                {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">{customer?.name} • {formatPrice(order.total)}</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString('ru-RU')} • {order.items?.length || 0} товар(ов)
                            </p>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleViewOrder(order); }}><Eye className="h-5 w-5 text-muted-foreground" /></Button>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        {index < filteredOrders.length - 1 && <div className="border-b mx-4" />}
                      </React.Fragment>
                    );
                  })}
              </CardContent>
            </Card>
          </TabsContent>

           {isAdmin && (
            <TabsContent value="users" className="space-y-4 mt-4">
               <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
                <CardContent className="p-0">
                  {filteredUsers.map((user, index) => {
                      return (
                      <React.Fragment key={user.id}>
                        <div className="py-4 px-4 sm:px-6 flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <div className="font-medium">
                                  {user.name.split(' ').map((part, i) => <div key={i}>{part}</div>)}
                                </div>
                                {getRoleBadge(user.role)}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <div className="flex items-center">
                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}><Edit className="h-4 w-4" /></Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-destructive hover:text-destructive" 
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                     Это действие необратимо. Пользователь "{user.name}" и все его данные будут удалены.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                    Удалить
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                          </div>
                        </div>
                        {index < filteredUsers.length - 1 && <div className="border-b mx-4" />}
                      </React.Fragment>
                      )
                    })}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
        
        {showAddProductForm && (
            <AddProductForm 
                onClose={() => {
                    setShowAddProductForm(false);
                    setEditingProduct(undefined);
                }} 
                onSave={handleSaveProduct}
                editProduct={editingProduct}
                categories={categories || []}
                brands={brands || []}
            />
        )}

        {showAddUserForm && (
            <AddUserForm 
                onClose={() => {
                    setShowAddUserForm(false);
                    setEditingUser(undefined);
                }} 
                onSave={handleSaveUser}
                editUser={editingUser}
            />
        )}

        {selectedOrder && (
            <OrderDetailsModal 
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onEditOrder={handleEditOrder}
                products={products || []}
                users={users || []}
            />
        )}
    </div>
    </div>
  );
}
