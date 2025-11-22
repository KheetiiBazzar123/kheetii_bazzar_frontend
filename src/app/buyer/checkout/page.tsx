'use client';

import React, { useState, useEffect } from 'use client';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import { DeliveryAddress } from '@/types';
import { ShoppingCartIcon, MapPinIcon, CreditCardIcon, TruckIcon } from '@heroicons/react/24/outline';

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    farmer: {
      firstName: string;
      lastName: string;
    };
  };
  quantity: number;
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'upi' | 'wallet'>('cod');
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'home' as 'home' | 'work' | 'other',
    isDefault: false
  });

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('checkout_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    
    // Load addresses
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await api.get('/addresses');
      if (response.data.success) {
        setAddresses(response.data.data as DeliveryAddress[]);
        // Auto-select default address
        const defaultAddr = response.data.data.find((addr: DeliveryAddress) => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
        }
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    try {
      const response = await api.post('/addresses', newAddress);
      if (response.data.success) {
        await loadAddresses();
        setShowAddressForm(false);
        setSelectedAddressId(response.data.data._id);
      }
    } catch (err) {
      console.error('Error adding address:', err);
      setError('Failed to add address');
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
    const tax = subtotal * 0.05; // 5% tax
    return { subtotal, shipping, tax, total: subtotal + shipping + tax };
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError(t('orders.checkout.selectAddress'));
      return;
    }

    if (cartItems.length === 0) {
      setError('No items in cart');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);
      
      const orderData = {
        products: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingAddress: {
          street: selectedAddress?.addressLine1 || '',
          city: selectedAddress?.city || '',
          state: selectedAddress?.state || '',
          zipCode: selectedAddress?.pincode || '',
          country: selectedAddress?.country || 'India'
        },
        paymentMethod: paymentMethod,
        notes: orderNotes
      };

      const response = await api.createOrder(orderData);
      
      if (response.success && response.data) {
        // Clear cart
        localStorage.removeItem('checkout_cart');
        // Redirect to confirmation page
        router.push(`/buyer/orders/confirmation/${response.data._id}`);
      } else {
        setError(response.message || 'Failed to place order');
      }
    } catch (err: any) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  const { subtotal, shipping, tax, total } = calculateTotal();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {t('orders.checkout.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCartIcon className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('orders.checkout.reviewOrder')}
              </h2>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No items in cart. Add some products first!
              </p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <img
                      src={item.product.images[0] || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{item.product.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {item.product.farmer.firstName} {item.product.farmer.lastName}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Address */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('orders.checkout.selectAddress')}
                </h2>
              </div>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                {t('orders.checkout.addNewAddress')}
              </button>
            </div>

            {showAddressForm && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                    className="px-4 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                    className="px-4 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={newAddress.addressLine1}
                  onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    className="px-4 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                    className="px-4 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                    className="px-4 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleAddAddress}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
                >
                  Save Address
                </button>
              </div>
            )}

            <div className="space-y-3">
              {addresses.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  {t('orders.checkout.addNewAddress')}
                </p>
              ) : (
                addresses.map((address) => (
                  <label
                    key={address._id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedAddressId === address._id
                        ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address._id}
                      checked={selectedAddressId === address._id}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">{address.fullName}</span>
                    {address.isDefault && (
                      <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {address.addressLine1}, {address.city}, {address.state} - {address.pincode}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{address.phone}</p>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCardIcon className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('orders.checkout.selectPayment')}
              </h2>
            </div>

            <div className="space-y-3">
              {(['cod', 'card', 'upi', 'wallet'] as const).map((method) => (
                <label
                  key={method}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                    paymentMethod === method
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mr-3"
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {t(`orders.paymentMethods.${method}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Order Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('orders.orderNotes')}
            </label>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder={t('orders.addNotes')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('orders.checkout.orderSummary')}
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{t('orders.subtotal')}</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{t('orders.shippingCharges')}</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{t('orders.taxes')}</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>{t('orders.total')}</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={processing || cartItems.length === 0 || !selectedAddressId}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {t('orders.checkout.processing')}
                </>
              ) : (
                <>
                  <TruckIcon className="h-5 w-5" />
                  {t('orders.checkout.placeOrder')}
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              By placing this order, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
