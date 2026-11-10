import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SellerLayout from '../../components/layout/SellerLayout/SellerLayout';
import api from '../../services/api';
import socket from '../../services/socket';

vi.mock('../../components/SEO/SEO', () => ({
  default: () => null,
}));

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../../services/socket', () => ({
  default: {
    connected: true,
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
  connectSellerSocket: vi.fn(),
  disconnectSellerSocket: vi.fn(),
}));

const createMockStore = (authState = { isAuthenticated: true, user: { id: 10, name: 'Test Seller', role: 'seller' } }) =>
  configureStore({
    reducer: {
      auth: () => authState,
      ui: () => ({ themeMode: 'light' }),
    },
  });

describe('Seller Sidebar Notification Badges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === '/notifications') {
        return Promise.resolve({ data: { data: [] } });
      }
      return Promise.resolve({ data: {} });
    });
    api.patch.mockResolvedValue({ data: { success: true } });
  });

  const renderSellerLayout = (initialPath = '/dashboard') => {
    const store = createMockStore();
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/" element={<SellerLayout />}>
              <Route path="dashboard" element={<div>Dashboard Page</div>} />
              <Route path="products" element={<div>Products Page</div>} />
              <Route path="sellerreviews" element={<div>Reviews Page</div>} />
              <Route path="orders" element={<div>Orders Page</div>} />
              <Route path="returns" element={<div>Returns Page</div>} />
              <Route path="inventory" element={<div>Inventory Page</div>} />
              <Route path="coupons" element={<div>Coupons Page</div>} />
              <Route path="cms" element={<div>CMS Page</div>} />
              <Route path="support" element={<div>Support Page</div>} />
              <Route path="wallet" element={<div>Wallet Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  it('renders badges for all supported seller modules with unseen notifications', async () => {
    const mockNotifications = [
      { id: 1, type: 'product_status', title: 'Product Approved', reference_id: 101, is_seen: false, is_read: false },
      { id: 2, type: 'new_review', title: 'New Review', reference_id: 201, is_seen: false, is_read: false },
      { id: 3, type: 'new_order', title: 'New Order', reference_id: 301, is_seen: false, is_read: false },
      { id: 4, type: 'return_request', title: 'Return Request', reference_id: 401, is_seen: false, is_read: false },
      { id: 5, type: 'low_stock', title: 'Low Stock', reference_id: 501, is_seen: false, is_read: false },
      { id: 6, type: 'banner_status', title: 'Banner Approved', reference_id: 601, is_seen: false, is_read: false },
      { id: 7, type: 'support_reply', title: 'Support Reply', reference_id: 701, is_seen: false, is_read: false },
      { id: 8, type: 'payout_status', title: 'Payout Completed', reference_id: 801, is_seen: false, is_read: false },
    ];

    api.get.mockImplementation((url) => {
      if (url === '/notifications') {
        return Promise.resolve({ data: { data: mockNotifications } });
      }
      return Promise.resolve({ data: {} });
    });

    renderSellerLayout('/dashboard');

    await waitFor(() => {
      const badges = screen.getAllByText('1');
      expect(badges.length).toBeGreaterThanOrEqual(8);
    });
  });

  it('strictly excludes Coupons from displaying a notification badge', async () => {
    const mockNotifications = [
      { id: 10, type: 'coupon_created', reference_id: 999, is_seen: false, is_read: false },
      { id: 11, type: 'coupon_status', reference_id: 998, is_seen: false, is_read: false },
    ];

    api.get.mockImplementation((url) => {
      if (url === '/notifications') {
        return Promise.resolve({ data: { data: mockNotifications } });
      }
      return Promise.resolve({ data: {} });
    });

    renderSellerLayout('/dashboard');

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/notifications');
    });

    // Coupons nav item exists in drawers but has no badge
    const couponsBtns = screen.getAllByText('Coupons').map(el => el.closest('[role="button"]'));
    expect(couponsBtns.length).toBeGreaterThan(0);
    couponsBtns.forEach(btn => {
      expect(btn.querySelector('.MuiChip-root')).toBeNull();
    });
  });

  it('deduplicates multiple events with the same reference_id to count as 1', async () => {
    const mockNotifications = [
      { id: 1, type: 'product_status', reference_id: 101, is_seen: false, is_read: false },
      { id: 2, type: 'product_status', reference_id: 101, is_seen: false, is_read: false },
      { id: 3, type: 'new_order', reference_id: 202, is_seen: false, is_read: false },
      { id: 4, type: 'order_status_update', reference_id: 202, is_seen: false, is_read: false },
    ];

    api.get.mockImplementation((url) => {
      if (url === '/notifications') {
        return Promise.resolve({ data: { data: mockNotifications } });
      }
      return Promise.resolve({ data: {} });
    });

    renderSellerLayout('/dashboard');

    await waitFor(() => {
      // Products button should have count 1 (not 2)
      const productsBtn = screen.getAllByText('Products')[0].closest('[role="button"]');
      expect(productsBtn.querySelector('.MuiChip-root')).toHaveTextContent('1');

      // Orders button should have count 1 (not 2)
      const ordersBtn = screen.getAllByText('Orders')[0].closest('[role="button"]');
      expect(ordersBtn.querySelector('.MuiChip-root')).toHaveTextContent('1');
    });
  });

  it('auto-clears unseen notifications when navigating to a module page', async () => {
    const mockNotifications = [
      { id: 1, type: 'product_status', reference_id: 101, is_seen: false, is_read: false },
      { id: 2, type: 'new_order', reference_id: 301, is_seen: false, is_read: false },
    ];

    api.get.mockImplementation((url) => {
      if (url === '/notifications') {
        return Promise.resolve({ data: { data: mockNotifications } });
      }
      return Promise.resolve({ data: {} });
    });

    renderSellerLayout('/dashboard');

    await waitFor(() => {
      expect(screen.getAllByText('Products')[0].closest('[role="button"]').querySelector('.MuiChip-root')).toHaveTextContent('1');
      expect(screen.getAllByText('Orders')[0].closest('[role="button"]').querySelector('.MuiChip-root')).toHaveTextContent('1');
    });

    // Click on Products
    const productsBtn = screen.getAllByText('Products')[0].closest('[role="button"]');
    fireEvent.click(productsBtn);

    // Should call PATCH /notifications/seen with products types
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/notifications/seen', {
        types: ['product_status', 'product_approval'],
      });
    });

    // Products badge should disappear
    expect(screen.getAllByText('Products')[0].closest('[role="button"]').querySelector('.MuiChip-root')).toBeNull();

    // Orders badge should still remain!
    expect(screen.getAllByText('Orders')[0].closest('[role="button"]').querySelector('.MuiChip-root')).toHaveTextContent('1');
  });

  it('receives real-time notifications via socket and increments badge count', async () => {
    let socketHandlers = {};
    socket.on.mockImplementation((event, handler) => {
      socketHandlers[event] = handler;
    });

    renderSellerLayout('/dashboard');

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/notifications');
    });

    expect(screen.getAllByText('Inventory')[0].closest('[role="button"]').querySelector('.MuiChip-root')).toBeNull();

    // Emit real-time low_stock notification
    act(() => {
      if (socketHandlers['new_notification']) {
        socketHandlers['new_notification']({
          id: 55,
          type: 'low_stock',
          title: 'Low Stock Alert',
          reference_id: 42,
          is_seen: false,
          is_read: false,
        });
      }
    });

    await waitFor(() => {
      expect(screen.getAllByText('Inventory')[0].closest('[role="button"]').querySelector('.MuiChip-root')).toHaveTextContent('1');
    });
  });

  it('ignores real-time notifications directed to another seller (data isolation)', async () => {
    let socketHandlers = {};
    socket.on.mockImplementation((event, handler) => {
      socketHandlers[event] = handler;
    });

    renderSellerLayout('/dashboard');

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/notifications');
    });

    // Socket notification arrives for user_id: 999 (logged in user is id: 10)
    act(() => {
      if (socketHandlers['sidebar:notification:new']) {
        socketHandlers['sidebar:notification:new']({
          id: 9991,
          user_id: 999,
          type: 'new_order',
          title: 'Order Placed',
          reference_id: 888,
          is_seen: false,
          is_read: false,
        });
      }
    });

    // Orders badge remains null because it belongs to another seller
    expect(screen.getAllByText('Orders')[0].closest('[role="button"]').querySelector('.MuiChip-root')).toBeNull();
  });

  it('clears badge in real time when sidebar_notifications_seen or sidebar:notification:read arrives', async () => {
    let socketHandlers = {};
    socket.on.mockImplementation((event, handler) => {
      socketHandlers[event] = handler;
    });

    // Initial notifications with 1 unseen order
    api.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 101,
            type: 'new_order',
            title: 'New order',
            reference_id: 50,
            is_seen: false,
            is_read: false,
          },
        ],
      },
    });

    renderSellerLayout('/dashboard');

    await waitFor(() => {
      expect(screen.getAllByText('Orders')[0].closest('[role="button"]').querySelector('.MuiChip-root')).toHaveTextContent('1');
    });

    // Another tab or device marks orders as seen
    act(() => {
      if (socketHandlers['sidebar:notification:read']) {
        socketHandlers['sidebar:notification:read']({
          types: ['new_order', 'order_status_update', 'order_delivered', 'shipment_status'],
          module: 'Orders',
        });
      }
    });

    // Badge should disappear immediately in real time
    await waitFor(() => {
      expect(screen.getAllByText('Orders')[0].closest('[role="button"]').querySelector('.MuiChip-root')).toBeNull();
    });
  });
});
