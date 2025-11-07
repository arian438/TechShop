import React, { useState } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  TrendingUp, 
  DollarSign,
  ChevronRight,
  Plus,
  Search,
  Edit,
  Eye,
  Trash2
} from '../components/icons/index';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { mockProducts, mockOrders, mockUsers } from '../data/mockData';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { AddProductForm } from '../components/admin/AddProductForm';
import { AddUserForm } from '../components/admin/AddUserForm';
import { OrderDetailsModal } from '../components/admin/OrderDetailsModal';
import { Product, User, Order } from '../types';

export function AdminScreen() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  
  const isAdmin = user?.role === 'admin';
  
  // Statistics
  const totalProducts = mockProducts.length;
  const activeProducts = mockProducts.filter(p => p.isActive).length;
  const totalOrders = mockOrders.length;
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

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
    // Здесь будет логика удаления пользователя
    console.log('Delete user:', userId);
    addNotification({
      title: 'Пользователь удален',
      message: 'Пользователь успешно удален из системы',
      type: 'system'
    });
  };

  const handleDeleteProduct = (productId: string) => {
    // Здесь будет логика удаления товара
    console.log('Delete product:', productId);
    addNotification({
      title: 'Товар удален',
      message: 'Товар успешно удален из каталога',
      type: 'system'
    });
  };

  const handleSaveProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    console.log('Save product:', productData);
    setShowAddProductForm(false);
    setEditingProduct(undefined);
    
    addNotification({
      title: editingProduct ? 'Товар обновлен' : 'Товар добавлен',
      message: editingProduct ? 
        `Товар "${productData.name}" успешно обновлен` : 
        `Товар "${productData.name}" добавлен в каталог`,
      type: 'product'
    });
  };

  const handleSaveUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    console.log('Save user:', userData);
    setShowAddUserForm(false);
    setEditingUser(undefined);
    
    addNotification({
      title: editingUser ? 'Пользователь обновлен' : 'Пользователь добавлен',
      message: editingUser ? 
        `Данные пользователя "${userData.name}" успешно обновлены` : 
        `Пользователь "${userData.name}" добавлен в систему`,
      type: 'system'
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddProductForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowAddUserForm(true);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleEditOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    ));
    setSelectedOrder(null);
    
    addNotification({
      title: 'Заказ обновлен',
      message: `Заказ #${updatedOrder.id} успешно обновлен`,
      type: 'order'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <div className="space-y-6 pb-20 p-4">
        {/* Header */}
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Панель управления
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {isAdmin ? 'Полный доступ к системе' : 'Управление товарами и заказами'}
                </p>
              </div>
              <Badge variant={isAdmin ? 'destructive' : 'default'} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                {isAdmin ? 'Администратор' : 'Менеджер'}
              </Badge>
            </div>

            {/* Statistics */}
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

        {/* Management Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} bg-white/70 backdrop-blur-sm`}>
            <TabsTrigger value="products">Товары</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            {isAdmin && <TabsTrigger value="users">Пользователи</TabsTrigger>}
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск товаров..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button size="sm" onClick={() => setShowAddProductForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            </div>

            <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="space-y-0">
                  {mockProducts.slice(0, 5).map((product, index) => (
                    <div key={product.id}>
                      <div className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          <ImageWithFallback
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="truncate">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium">{formatPrice(product.price)}</span>
                            <Badge variant={product.isActive ? 'outline' : 'secondary'} className="text-xs">
                              {product.isActive ? 'Активен' : 'Неактивен'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {index < mockProducts.slice(0, 5).length - 1 && (
                        <div className="border-b border-border mx-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск заказов..."
                  className="pl-10"
                />
              </div>
            </div>

            <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="space-y-0">
                  {orders.map((order, index) => {
                    const customer = mockUsers.find(u => u.id === order.userId);
                    return (
                      <div key={order.id}>
                        <div 
                          className="p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleViewOrder(order)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4>Заказ #{order.id}</h4>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {customer?.name} • {formatPrice(order.total)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('ru-RU')} • {order.items.length} товар(ов)
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewOrder(order);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        {index < orders.length - 1 && (
                          <div className="border-b border-border mx-4" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab (Admin only) */}
          {isAdmin && (
            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск пользователей..."
                    className="pl-10"
                  />
                </div>
                <Button size="sm" onClick={() => setShowAddUserForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              </div>

              <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {mockUsers.map((user, index) => (
                      <div key={user.id}>
                        <div className="p-4 flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4>{user.name}</h4>
                              {getRoleBadge(user.role)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Регистрация: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.role !== 'admin' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {index < mockUsers.length - 1 && (
                          <div className="border-b border-border mx-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Forms */}
      {showAddProductForm && (
        <AddProductForm
          onClose={() => {
            setShowAddProductForm(false);
            setEditingProduct(undefined);
          }}
          onSave={handleSaveProduct}
          editProduct={editingProduct}
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
          canEdit={true}
        />
      )}
    </div>
  );
}