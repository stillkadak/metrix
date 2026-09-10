import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Skeleton,
} from '@mui/material';
import {
  AddOutlined,
  SearchOutlined,
  Inventory2Outlined,
  QrCodeOutlined,
} from '@mui/icons-material';
import { products as productsApi } from '../services/api';

interface ProductItem {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  manufacturer?: string;
  barcode?: string;
  net_quantity?: string;
  mrp?: number;
  created_at?: string;
}

const ProductsPage: React.FC = () => {
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openCreate, setOpenCreate] = useState(false);

  // New product form
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    manufacturer: '',
    barcode: '',
    net_quantity: '',
    mrp: '',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsApi.list({ search: search || undefined });
      setProductsList(response.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      await productsApi.create({
        ...formData,
        mrp: formData.mrp ? parseFloat(formData.mrp) : undefined,
      });
      setOpenCreate(false);
      setFormData({
        name: '',
        brand: '',
        category: '',
        manufacturer: '',
        barcode: '',
        net_quantity: '',
        mrp: '',
      });
      fetchProducts();
    } catch (err) {
      console.error('Error creating product:', err);
    }
  };

  return (
    <Box>
      {/* Top Bar with Search & Add Product */}
      <Paper sx={{ p: 2.5, mb: 3, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <TextField
            size="small"
            placeholder="Search by product name, brand, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchOutlined sx={{ color: '#94A3B8', mr: 1, fontSize: 20 }} />,
            }}
            sx={{ width: { xs: '100%', sm: 340 }, bgcolor: '#FFFFFF' }}
          />

          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => setOpenCreate(true)}
            sx={{ bgcolor: '#0F172A', fontWeight: 700, px: 2.5 }}
          >
            Register Product
          </Button>
        </Stack>
      </Paper>

      {/* Products Table */}
      <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell>Product SKU & Name</TableCell>
                <TableCell>Brand & Category</TableCell>
                <TableCell>Manufacturer</TableCell>
                <TableCell>Barcode</TableCell>
                <TableCell align="right">Declared MRP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton width={160} /></TableCell>
                    <TableCell><Skeleton width={120} /></TableCell>
                    <TableCell><Skeleton width={140} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell align="right"><Skeleton width={70} /></TableCell>
                  </TableRow>
                ))
              ) : productsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Inventory2Outlined sx={{ fontSize: 44, color: '#94A3B8', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      No registered products found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Register SKUs to automatically link packaging scans with catalog items.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                productsList.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        {product.name}
                      </Typography>
                      {product.net_quantity && (
                        <Typography variant="caption" color="text.secondary">
                          Net Qty: {product.net_quantity}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                        {product.brand || '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.category || 'General'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#475569' }}>
                        {product.manufacturer || '—'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {product.barcode ? (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <QrCodeOutlined fontSize="small" sx={{ color: '#64748B' }} />
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#0F172A' }}>
                            {product.barcode}
                          </Typography>
                        </Stack>
                      ) : (
                        '—'
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        {product.mrp != null ? `₹${product.mrp.toFixed(2)}` : '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Product Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleCreateProduct}>
          <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #E2E8F0' }}>
            Register New Product SKU
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2}>
              <TextField
                required
                label="Product Name"
                fullWidth
                size="small"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Brand"
                  fullWidth
                  size="small"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
                <TextField
                  label="Category"
                  fullWidth
                  size="small"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </Stack>

              <TextField
                label="Manufacturer Name"
                fullWidth
                size="small"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Barcode / EAN"
                  fullWidth
                  size="small"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                />
                <TextField
                  label="Declared MRP (₹)"
                  type="number"
                  fullWidth
                  size="small"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                />
              </Stack>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setOpenCreate(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#0F172A', fontWeight: 700 }}>
              Save SKU
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ProductsPage;
