import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AdminLayout from '@/layouts/AdminLayout'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import AdminRoute from '@/components/common/AdminRoute'
import HomePage from '@/pages/Home'
import SearchPage from '@/pages/Search'
import CategoryPage from '@/pages/Category'
import CategoriesPage from '@/pages/Categories'
import ListingDetail from '@/pages/ListingDetail'
import PostAd from '@/pages/PostAd'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import FavoritesPage from '@/pages/Favorites'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminUsers from '@/pages/admin/Users'
import AdminListings from '@/pages/admin/Listings'
import AdminCategories from '@/pages/admin/Categories'
import AdminPromotions from '@/pages/admin/Promotions'
import AdminEnquiries from '@/pages/admin/Enquiries'
import AdminCommissionAds from '@/pages/admin/CommissionAds'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route
            path="/post"
            element={
              <ProtectedRoute>
                <PostAd />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-account"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin routes — separate layout, no header/footer */}
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/listings" element={<AdminListings />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/promotions" element={<AdminPromotions />} />
          <Route path="/admin/enquiries" element={<AdminEnquiries />} />
          <Route path="/admin/commission-ads" element={<AdminCommissionAds />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
