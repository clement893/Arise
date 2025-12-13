'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Check,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import { 
  Button, 
  Card, 
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Modal,
  LoadingInline,
} from '@/components/ui';

interface Product {
  id: number;
  name: string;
  planType: string;
  description?: string | null;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features?: string[] | null;
  isActive: boolean;
  isPopular: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    planType: 'starter' as const,
    description: '',
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'USD',
    features: [] as string[],
    isActive: true,
    isPopular: false,
    displayOrder: 0,
  });
  
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        planType: product.planType as any,
        description: product.description || '',
        monthlyPrice: product.monthlyPrice,
        annualPrice: product.annualPrice,
        currency: product.currency,
        features: product.features || [],
        isActive: product.isActive,
        isPopular: product.isPopular,
        displayOrder: product.displayOrder,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        planType: 'starter',
        description: '',
        monthlyPrice: 0,
        annualPrice: 0,
        currency: 'USD',
        features: [],
        isActive: true,
        isPopular: false,
        displayOrder: 0,
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setError('');
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save product');
      }

      handleCloseModal();
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      fetchProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const formatPrice = (cents: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  };

  const planTypes = [
    'starter',
    'individual',
    'coach',
    'professional',
    'enterprise',
    'revelation',
    'coaching',
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingInline />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products & Pricing</h1>
            <p className="text-gray-600 mt-1">Manage your subscription plans and pricing</p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Add Product
          </Button>
        </div>

        {/* Products Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Plan Type</TableHead>
                  <TableHead>Monthly Price</TableHead>
                  <TableHead>Annual Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      No products found. Create your first product to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{product.name}</span>
                          {product.isPopular && (
                            <Badge variant="primary" size="sm">Popular</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" size="sm">
                          {product.planType}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatPrice(product.monthlyPrice, product.currency)}</TableCell>
                      <TableCell>{formatPrice(product.annualPrice, product.currency)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={product.isActive ? 'success' : 'error'} 
                          size="sm"
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.displayOrder}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(product)}
                            leftIcon={<Edit className="w-4 h-4" />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            leftIcon={<Trash2 className="w-4 h-4" />}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingProduct ? 'Edit Product' : 'Create Product'}
          size="lg"
        >
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Starter Plan"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Type
                </label>
                <select
                  value={formData.planType}
                  onChange={(e) => setFormData({ ...formData, planType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={!!editingProduct}
                >
                  {planTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Monthly Price (cents)"
                type="number"
                value={formData.monthlyPrice}
                onChange={(e) => setFormData({ ...formData, monthlyPrice: parseInt(e.target.value) || 0 })}
                placeholder="0"
                required
              />

              <Input
                label="Annual Price (cents)"
                type="number"
                value={formData.annualPrice}
                onChange={(e) => setFormData({ ...formData, annualPrice: parseInt(e.target.value) || 0 })}
                placeholder="0"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="USD"
                required
              />

              <Input
                label="Display Order"
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="flex-1 text-sm">{feature}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFeature(index)}
                      leftIcon={<X className="w-4 h-4" />}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddFeature}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Popular</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                leftIcon={<Save className="w-4 h-4" />}
                isLoading={isSaving}
              >
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
