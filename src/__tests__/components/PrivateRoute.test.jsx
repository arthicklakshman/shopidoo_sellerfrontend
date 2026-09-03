import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../../router/PrivateRoute';

const createMockStore = (authState) =>
  configureStore({
    reducer: {
      auth: (state = authState) => state,
    },
  });

describe('Seller PrivateRoute Guard', () => {
  it('should redirect unauthenticated users to /login', () => {
    const store = createMockStore({
      authChecked: true,
      isAuthenticated: false,
      user: null,
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<div>Seller Login Page</div>} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <div>Protected Seller Dashboard</div>
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Seller Login Page')).toBeInTheDocument();
  });

  it('should redirect pending sellers to /onboarding/success', () => {
    const store = createMockStore({
      authChecked: true,
      isAuthenticated: true,
      user: { id: 1, role: 'seller', seller_status: 'pending' },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/onboarding/success" element={<div>Application Pending Review</div>} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <div>Protected Seller Dashboard</div>
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Application Pending Review')).toBeInTheDocument();
  });

  it('should allow approved sellers to access dashboard', () => {
    const store = createMockStore({
      authChecked: true,
      isAuthenticated: true,
      user: { id: 1, role: 'seller', seller_status: 'approved' },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <div>Protected Seller Dashboard</div>
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Seller Dashboard')).toBeInTheDocument();
  });
});
