# Daily Deals Ecommerce System - Comprehensive Specification

**Date**: 2025-09-01  
**Status**: Complete Specification  
**Purpose**: Functional pharmacy deals marketplace with full ecommerce workflow

---

## 🎯 **SYSTEM OVERVIEW**

### **Daily Deals Platform Vision**
A **functional ecommerce marketplace** where **pharmacies create product deals** and **patients browse, cart, and order** with real transaction processing. Similar to onedayonly.co.za but specifically for pharmacy products and health items.

### **Core Capabilities**
- **Pharmacy deal creation**: Products with special pricing and availability
- **Patient deal browsing**: Search, filter, and discovery of pharmacy specials  
- **Shopping cart system**: Add items, manage quantities, persist across sessions
- **Order processing**: Real order placement with database persistence
- **Status tracking**: Order lifecycle from placement to collection
- **Payment simulation**: Fake gateway for complete workflow testing
- **Pharmacy fulfillment**: Order queue and processing workflow

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### **Database Schema (Ecommerce Foundation)**

#### **Product Catalog & Inventory**
```sql
-- Core product catalog
CREATE TABLE pharmacy__inventory__products (
  product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies_directory(pharmacy_id),
  user_id UUID NOT NULL REFERENCES auth.users(id), -- Pharmacy owner
  
  -- Product Information
  product_name VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- 'prescription', 'otc', 'supplement', 'equipment', 'personal_care'
  brand VARCHAR(200),
  sku VARCHAR(100),
  barcode VARCHAR(50),
  
  -- Inventory Management
  current_stock INTEGER NOT NULL DEFAULT 0,
  reserved_stock INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  
  -- Pricing
  unit_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  
  -- Compliance  
  requires_prescription BOOLEAN DEFAULT false,
  expiry_date DATE,
  batch_number VARCHAR(100),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Daily deals/specials
CREATE TABLE pharmacy__deals__specials (
  deal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies_directory(pharmacy_id),
  product_id UUID NOT NULL REFERENCES pharmacy__inventory__products(product_id),
  user_id UUID NOT NULL REFERENCES auth.users(id), -- Pharmacy owner
  
  -- Deal Configuration
  deal_name VARCHAR(200) NOT NULL,
  deal_type VARCHAR(50) NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed_amount', 'buy_x_get_y'
  original_price DECIMAL(10,2) NOT NULL,
  special_price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    ROUND(((original_price - special_price) / original_price * 100)::numeric, 2)
  ) STORED,
  
  -- Availability
  max_quantity_per_customer INTEGER DEFAULT 1,
  total_deal_quantity INTEGER,
  deals_claimed INTEGER DEFAULT 0,
  deals_remaining INTEGER GENERATED ALWAYS AS (
    GREATEST(0, total_deal_quantity - deals_claimed)
  ) STORED,
  
  -- Validity
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  terms_conditions TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'expired', 'sold_out'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### **Shopping Cart System**
```sql
-- Patient shopping cart (persistent across sessions)
CREATE TABLE patient__cart__items (
  cart_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  product_id UUID NOT NULL REFERENCES pharmacy__inventory__products(product_id),
  deal_id UUID REFERENCES pharmacy__deals__specials(deal_id), -- null for regular price
  pharmacy_id UUID NOT NULL REFERENCES pharmacies_directory(pharmacy_id),
  
  -- Cart Details
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  is_deal BOOLEAN DEFAULT false,
  deal_savings DECIMAL(10,2) DEFAULT 0,
  
  -- Cart Management
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### **Order Management System**
```sql
-- Customer orders
CREATE TABLE patient__orders__orders (
  order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies_directory(pharmacy_id),
  
  -- Order Status
  order_status VARCHAR(50) NOT NULL DEFAULT 'pending', 
  -- 'pending', 'confirmed', 'preparing', 'ready', 'collected', 'cancelled'
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- 'pending', 'authorized', 'paid', 'failed', 'refunded'
  
  -- Financial
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Fulfillment
  collection_method VARCHAR(50) DEFAULT 'pickup', -- 'pickup', 'delivery'
  customer_notes TEXT,
  pharmacy_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  ready_at TIMESTAMP WITH TIME ZONE,
  collected_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Order line items
CREATE TABLE patient__orders__items (
  item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES patient__orders__orders(order_id),
  product_id UUID NOT NULL REFERENCES pharmacy__inventory__products(product_id),
  deal_id UUID REFERENCES pharmacy__deals__specials(deal_id),
  
  -- Item Details
  product_name VARCHAR(500) NOT NULL, -- Snapshot for history
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  is_deal BOOLEAN DEFAULT false,
  deal_savings DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### **Payment & Transaction Management**
```sql
-- Payment processing (simulation initially)
CREATE TABLE patient__transactions__payments (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES patient__orders__orders(order_id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Payment Details
  payment_method VARCHAR(50) NOT NULL, -- 'card', 'eft', 'cash', 'medical_aid', 'simulation'
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ZAR',
  
  -- Gateway Integration (for future)
  gateway_provider VARCHAR(50), -- 'stripe', 'paypal', 'simulation'
  gateway_reference VARCHAR(200),
  gateway_response JSONB,
  
  -- Status & Timing
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Stock reservations (for future real-time stock management)
CREATE TABLE pharmacy__inventory__reservations (
  reservation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES pharmacy__inventory__products(product_id),
  order_id UUID NOT NULL REFERENCES patient__orders__orders(order_id),
  
  -- Reservation Details
  quantity_reserved INTEGER NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'fulfilled', 'expired', 'cancelled'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## 🎮 **USER WORKFLOW SPECIFICATIONS**

### **Patient Shopping Journey (Detailed)**

#### **Step 1: Deal Discovery**
**URL**: `/patient/daily-deals/browse`
**Component**: `DailyDealsListFeature.tsx`
```typescript
// Deal browsing with GenericListFeature pattern
const dailyDealsListConfig: ListFeatureConfig = {
  entityName: 'deal',
  entityNamePlural: 'daily deals',
  basePath: '/patient/daily-deals/browse',
  
  transformRowToItem: (deal) => ({
    id: deal.deal_id,
    title: deal.deal_name,
    subtitle: `${deal.pharmacy_name} - ${deal.discount_percentage}% off`,
    severity: deal.deals_remaining > 10 ? 'normal' : 'moderate', // Stock indicator
    thirdColumn: `${deal.deals_remaining} left`,
    data: deal
  }),
  
  filterFields: [
    { key: 'category', label: 'Category', options: productCategories },
    { key: 'pharmacy_id', label: 'Pharmacy', options: pharmacyOptions },
    { key: 'discount_range', label: 'Discount', options: discountRanges }
  ]
}
```

#### **Step 2: Deal Details & Add to Cart**
**URL**: `/patient/daily-deals/browse/[deal_id]`
**Component**: `DealDetailFeature.tsx`
```typescript
// Deal detail with add to cart functionality
interface DealDetailFeatureProps {
  deal: DealRow
  product: ProductRow
  pharmacy: PharmacyRow
}

export default function DealDetailFeature({ deal, product, pharmacy }) {
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  
  const addToCart = async () => {
    setAddingToCart(true)
    try {
      await fetch('/api/patient/daily-deals/cart', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.product_id,
          deal_id: deal.deal_id,
          quantity,
          unit_price: deal.special_price
        })
      })
      // Success feedback
    } catch (error) {
      // Error handling
    } finally {
      setAddingToCart(false)
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Product Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={product.image_url} alt={product.product_name} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{deal.deal_name}</h1>
          <p className="text-gray-600">{product.description}</p>
          
          {/* Pricing */}
          <div className="mt-4">
            <span className="text-3xl font-bold text-green-600">
              R{deal.special_price}
            </span>
            <span className="text-lg text-gray-500 line-through ml-2">
              R{deal.original_price}
            </span>
            <span className="text-lg text-green-600 ml-2">
              ({deal.discount_percentage}% off)
            </span>
          </div>
          
          {/* Stock & Availability */}
          <div className="mt-4">
            <p className="text-sm text-orange-600">
              Only {deal.deals_remaining} left at this price!
            </p>
            <p className="text-sm text-gray-500">
              Valid until {new Date(deal.valid_until).toLocaleDateString()}
            </p>
          </div>
          
          {/* Add to Cart */}
          <div className="mt-6 flex gap-4">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              min={1}
              max={deal.max_quantity_per_customer}
              className="w-20 px-3 py-2 border rounded"
            />
            <button
              onClick={addToCart}
              disabled={addingToCart}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
          
          {/* Pharmacy Information */}
          <div className="mt-8 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold">{pharmacy.pharmacy_name}</h3>
            <p className="text-sm text-gray-600">{pharmacy.address}</p>
            <p className="text-sm text-gray-600">{pharmacy.phone}</p>
            <p className="text-sm text-blue-600">
              {pharmacy.distance ? `${pharmacy.distance}km away` : 'View location'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### **Step 3: Shopping Cart Management**
**URL**: `/patient/daily-deals/cart`
**Component**: `ShoppingCartFeature.tsx`
```typescript
// Shopping cart with quantity management and checkout
export default function ShoppingCartFeature() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  
  const fetchCart = async () => {
    const response = await fetch('/api/patient/daily-deals/cart', {
      credentials: 'same-origin'
    })
    const data = await response.json()
    setCartItems(data.items || [])
    setLoading(false)
  }
  
  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    await fetch(`/api/patient/daily-deals/cart/${cartItemId}`, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQuantity })
    })
    fetchCart() // Refresh cart
  }
  
  const removeItem = async (cartItemId: string) => {
    await fetch(`/api/patient/daily-deals/cart/${cartItemId}`, {
      method: 'DELETE',
      credentials: 'same-origin'
    })
    fetchCart() // Refresh cart
  }
  
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.total_price, 0)
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Your cart is empty</p>
          <button 
            onClick={() => router.push('/patient/daily-deals/browse')}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded"
          >
            Browse Deals
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.cart_item_id} className="flex items-center gap-4 p-4 border rounded">
                <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover" />
                
                <div className="flex-1">
                  <h3 className="font-medium">{item.product_name}</h3>
                  <p className="text-sm text-gray-600">{item.pharmacy_name}</p>
                  {item.is_deal && (
                    <p className="text-sm text-green-600">
                      Special price - Save R{item.deal_savings}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.cart_item_id, parseInt(e.target.value))}
                    min={1}
                    className="w-16 px-2 py-1 border rounded"
                  />
                  <span className="font-medium">R{item.total_price}</span>
                  <button
                    onClick={() => removeItem(item.cart_item_id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Cart Summary */}
          <div className="mt-8 p-6 bg-gray-50 rounded">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Total: R{calculateTotal().toFixed(2)}</span>
              <button
                onClick={() => router.push('/patient/daily-deals/checkout')}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
```

#### **Step 4: Checkout & Order Placement**
**URL**: `/patient/daily-deals/checkout`
**Component**: `CheckoutFeature.tsx`
```typescript
// Checkout with order placement and payment simulation
export default function CheckoutFeature() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [orderForm, setOrderForm] = useState({
    collection_method: 'pickup',
    customer_notes: '',
    payment_method: 'simulation'
  })
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  
  const placeOrder = async () => {
    setIsPlacingOrder(true)
    try {
      // Create order from cart items
      const orderResponse = await fetch('/api/patient/daily-deals/orders', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection_method: orderForm.collection_method,
          customer_notes: orderForm.customer_notes,
          payment_method: orderForm.payment_method
        })
      })
      
      const order = await orderResponse.json()
      
      // Process simulated payment
      const paymentResponse = await fetch('/api/patient/daily-deals/payment/simulate', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.order_id,
          amount: order.total_amount,
          payment_method: orderForm.payment_method
        })
      })
      
      if (paymentResponse.ok) {
        // Clear cart and redirect to order confirmation
        await fetch('/api/patient/daily-deals/cart/clear', {
          method: 'POST',
          credentials: 'same-origin'
        })
        
        router.push(`/patient/daily-deals/orders/${order.order_id}`)
      }
      
    } catch (error) {
      console.error('Order placement failed:', error)
    } finally {
      setIsPlacingOrder(false)
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      {/* Order Summary */}
      <div className="mb-8 p-6 bg-gray-50 rounded">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        {cartItems.map((item) => (
          <div key={item.cart_item_id} className="flex justify-between py-2">
            <span>{item.product_name} x{item.quantity}</span>
            <span>R{item.total_price}</span>
          </div>
        ))}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>R{calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Collection Method */}
      <div className="mb-6">
        <label className="block font-medium mb-2">Collection Method</label>
        <select
          value={orderForm.collection_method}
          onChange={(e) => setOrderForm({...orderForm, collection_method: e.target.value})}
          className="w-full p-3 border rounded"
        >
          <option value="pickup">Pickup at Pharmacy</option>
          <option value="delivery">Home Delivery</option>
        </select>
      </div>
      
      {/* Customer Notes */}
      <div className="mb-6">
        <label className="block font-medium mb-2">Notes for Pharmacy</label>
        <textarea
          value={orderForm.customer_notes}
          onChange={(e) => setOrderForm({...orderForm, customer_notes: e.target.value})}
          className="w-full p-3 border rounded"
          rows={3}
          placeholder="Special instructions or requests..."
        />
      </div>
      
      {/* Payment Simulation */}
      <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-medium text-yellow-800">Payment Simulation</h3>
        <p className="text-sm text-yellow-700">
          This is a simulated payment for testing purposes. No real payment will be processed.
        </p>
        <select
          value={orderForm.payment_method}
          onChange={(e) => setOrderForm({...orderForm, payment_method: e.target.value})}
          className="mt-2 p-2 border rounded"
        >
          <option value="simulation">Simulated Payment</option>
          <option value="cash">Cash on Collection</option>
        </select>
      </div>
      
      {/* Place Order */}
      <button
        onClick={placeOrder}
        disabled={isPlacingOrder || cartItems.length === 0}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-4 px-6 rounded-lg text-lg font-medium"
      >
        {isPlacingOrder ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  )
}
```

### **Pharmacy Order Management (Detailed)**

#### **Pharmacy Order Queue**
**URL**: `/pharmacy/daily-deals/orders`
**Component**: `PharmacyOrderQueueFeature.tsx`
```typescript
// Pharmacy-side order processing
export default function PharmacyOrderQueueFeature() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [selectedStatus, setSelectedStatus] = useState('pending')
  
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await fetch(`/api/pharmacy/daily-deals/orders/${orderId}/status`, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    fetchOrders() // Refresh list
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Order Queue</h1>
      
      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex gap-2">
          {['pending', 'confirmed', 'preparing', 'ready'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded ${
                selectedStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Orders List */}
      <div className="space-y-4">
        {orders.filter(order => order.order_status === selectedStatus).map((order) => (
          <div key={order.order_id} className="border rounded p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Order #{order.order_id.slice(0, 8)}</h3>
                <p className="text-gray-600">
                  {order.customer_name} - {order.total_amount} ZAR
                </p>
                <p className="text-sm text-gray-500">
                  Placed {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              
              <div className="flex gap-2">
                {order.order_status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.order_id, 'confirmed')}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Accept Order
                  </button>
                )}
                {order.order_status === 'confirmed' && (
                  <button
                    onClick={() => updateOrderStatus(order.order_id, 'preparing')}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Start Preparing
                  </button>
                )}
                {order.order_status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order.order_id, 'ready')}
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                  >
                    Mark Ready
                  </button>
                )}
              </div>
            </div>
            
            {/* Order Items */}
            <div className="mt-4">
              <h4 className="font-medium">Items:</h4>
              {order.items.map((item) => (
                <div key={item.item_id} className="flex justify-between py-1">
                  <span>{item.product_name} x{item.quantity}</span>
                  <span>R{item.total_price}</span>
                </div>
              ))}
            </div>
            
            {order.customer_notes && (
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <h4 className="font-medium">Customer Notes:</h4>
                <p>{order.customer_notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🔌 **API ARCHITECTURE**

### **Patient-Side APIs**
```typescript
// Shopping cart management
GET    /api/patient/daily-deals/cart              // Get cart items
POST   /api/patient/daily-deals/cart              // Add item to cart
PUT    /api/patient/daily-deals/cart/[item_id]    // Update quantity
DELETE /api/patient/daily-deals/cart/[item_id]    // Remove item
POST   /api/patient/daily-deals/cart/clear        // Clear entire cart

// Deal browsing
GET    /api/patient/daily-deals/browse            // List active deals
GET    /api/patient/daily-deals/browse/[deal_id]  // Deal details

// Order management  
POST   /api/patient/daily-deals/orders           // Place new order
GET    /api/patient/daily-deals/orders           // Order history
GET    /api/patient/daily-deals/orders/[id]      // Order details

// Payment simulation
POST   /api/patient/daily-deals/payment/simulate // Process fake payment
```

### **Pharmacy-Side APIs**
```typescript
// Deal management
GET    /api/pharmacy/daily-deals/specials        // List pharmacy deals
POST   /api/pharmacy/daily-deals/specials        // Create new deal
PUT    /api/pharmacy/daily-deals/specials/[id]   // Update deal
DELETE /api/pharmacy/daily-deals/specials/[id]   // Deactivate deal

// Order processing
GET    /api/pharmacy/daily-deals/orders          // Incoming orders queue
PUT    /api/pharmacy/daily-deals/orders/[id]/status  // Update order status

// Inventory management
GET    /api/pharmacy/daily-deals/inventory       // Product catalog
POST   /api/pharmacy/daily-deals/inventory       // Add new product
PUT    /api/pharmacy/daily-deals/inventory/[id]  // Update product
```

---

## 🚀 **IMPLEMENTATION PHASES**

### **Phase 1: Foundation (Current Priority)**
**Goal**: Working ecommerce workflow with simulated payments

**Deliverables**:
- **Product catalog**: Pharmacies can add products and create deals
- **Deal browsing**: Patients can search and filter pharmacy specials
- **Shopping cart**: Add items, manage quantities, persist across sessions
- **Order placement**: Real orders stored in database with proper workflow
- **Payment simulation**: Fake payment gateway to complete order cycle
- **Order tracking**: Status updates from pharmacy to patient

### **Phase 2: Enhanced Features**
**Goal**: Improved user experience and pharmacy management

**Deliverables**:
- **Real-time updates**: Order status changes notify both sides
- **Inventory management**: Stock levels and automatic deal deactivation
- **Analytics dashboard**: Deal performance and order metrics
- **Advanced filtering**: Category, location, rating, price range

### **Phase 3: Production Features**
**Goal**: Scalability and real-world deployment

**Deliverables**:
- **Payment gateway integration**: Stripe, PayPal, medical aid billing
- **Stock reservations**: Prevent overselling during checkout
- **Notification system**: SMS/email updates for order status
- **Advanced analytics**: Revenue tracking, conversion optimization

---

## 📋 **COMPONENT IMPLEMENTATION**

### **Patient App Structure**
```typescript
app/patient/daily-deals/
├── page.tsx                    # Daily deals hub (categories, featured)
├── browse/
│   ├── page.tsx               # Deal listing with filters
│   └── [deal_id]/page.tsx     # Deal detail with add to cart
├── cart/
│   └── page.tsx               # Shopping cart management
├── checkout/
│   └── page.tsx               # Order placement and payment
└── orders/
    ├── page.tsx               # Order history list
    └── [order_id]/page.tsx    # Order detail and tracking
```

### **Pharmacy App Structure**  
```typescript
app/pharmacy/daily-deals/
├── page.tsx                   # Deal management dashboard
├── specials/
│   ├── page.tsx              # Deal list management
│   ├── new/page.tsx          # Create new deal
│   └── [deal_id]/page.tsx    # Edit deal
├── inventory/
│   ├── page.tsx              # Product catalog management
│   └── [product_id]/page.tsx # Product detail management
└── orders/
    ├── page.tsx              # Incoming order queue
    └── [order_id]/page.tsx   # Order processing detail
```

---

## 🔒 **SECURITY & COMPLIANCE**

### **Data Protection**
- **User isolation**: RLS policies ensure users only see their data
- **CSRF protection**: All write operations include CSRF verification
- **Authentication**: Middleware protection on all commerce routes
- **Audit trails**: Complete order and transaction logging

### **Medical Compliance**
- **Prescription requirements**: Flag products requiring prescriptions
- **Age verification**: Restrict certain products to verified users
- **Regulatory tracking**: Batch numbers and expiry dates for pharmaceuticals
- **Professional oversight**: Pharmacist approval for prescription-related deals

### **Financial Security**
- **Payment simulation**: Safe testing environment for order workflows
- **Transaction logging**: Complete payment attempt recording
- **Fraud prevention**: Order validation and user verification
- **Audit compliance**: Financial transaction trail maintenance

---

## 📊 **SUCCESS METRICS**

### **Functional Validation**
- **Complete workflow**: Patient browse → cart → order → pharmacy processing → collection
- **Real data persistence**: Orders and transactions stored correctly
- **Status synchronization**: Order states update across patient and pharmacy apps
- **Payment simulation**: Fake payment gateway completes order cycle
- **User isolation**: Multiple users can shop independently without data leakage

### **Performance Requirements**
- **Cart responsiveness**: Add/remove items under 1 second
- **Deal browsing**: Product catalog loads efficiently with filtering
- **Order processing**: Order placement completes successfully
- **Database integrity**: Proper foreign key relationships and constraints

### **Business Logic Validation**
- **Deal expiration**: Expired deals automatically hidden from browse
- **Quantity limits**: Per-customer limits enforced during cart addition
- **Stock availability**: Deal availability reflects current inventory
- **Order workflow**: Realistic pharmacy fulfillment process

---

This specification provides a **comprehensive foundation** for implementing a **functional pharmacy deals marketplace** with **real ecommerce capabilities** while maintaining **clean architecture** for future **microservices separation** and **payment gateway integration**.