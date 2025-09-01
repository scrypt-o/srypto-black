# Daily Deals Ecommerce Architecture - Database and Business Logic

**Date**: 2025-09-01  
**Purpose**: Complete ecommerce database design following 2025 best practices
**Scope**: Working system with fake payment, real orders, logical microservice boundaries

---

## 🗄️ **DATABASE ARCHITECTURE**

### **Naming Convention (Microservice-Ready)**
```
Domain: patient / pharmacy
Group: daily-deals
Items: products, specials, carts, orders, order-items, payments
```

### **Core Tables Structure**

#### **1. Product Catalog**
```sql
-- Product inventory (pharmacy-managed)
CREATE TABLE pharmacy__daily_deals__products (
  product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies_directory(pharmacy_id),
  product_name VARCHAR(300) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'otc', 'supplement', 'equipment', 'personal_care'
  brand VARCHAR(100),
  unit_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_alert INTEGER DEFAULT 5,
  requires_prescription BOOLEAN DEFAULT false,
  product_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **2. Daily Specials/Deals**
```sql
-- Special offers and promotions
CREATE TABLE pharmacy__daily_deals__specials (
  special_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies_directory(pharmacy_id),
  product_id UUID NOT NULL REFERENCES pharmacy__daily_deals__products(product_id),
  special_name VARCHAR(200) NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  special_price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2) GENERATED ALWAYS AS 
    (ROUND(((original_price - special_price) / original_price) * 100, 2)) STORED,
  max_quantity_per_customer INTEGER DEFAULT 1,
  total_deal_stock INTEGER NOT NULL,
  deals_claimed INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  terms_conditions TEXT,
  deal_status VARCHAR(20) DEFAULT 'active' 
    CHECK (deal_status IN ('active', 'paused', 'expired', 'sold_out')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **3. Shopping Carts**
```sql
-- Patient shopping carts (persistent)
CREATE TABLE patient__daily_deals__carts (
  cart_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies_directory(pharmacy_id),
  session_data JSONB DEFAULT '{}',
  cart_status VARCHAR(20) DEFAULT 'active' 
    CHECK (cart_status IN ('active', 'abandoned', 'converted')),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart line items
CREATE TABLE patient__daily_deals__cart_items (
  cart_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES patient__daily_deals__carts(cart_id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES pharmacy__daily_deals__products(product_id),
  special_id UUID REFERENCES pharmacy__daily_deals__specials(special_id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  is_special BOOLEAN DEFAULT false,
  added_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **4. Order Management**
```sql
-- Customer orders with state management
CREATE TABLE patient__daily_deals__orders (
  order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies_directory(pharmacy_id),
  order_number VARCHAR(20) UNIQUE NOT NULL, -- Human-readable order ID
  
  -- Order totals
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Order workflow states
  order_status VARCHAR(20) DEFAULT 'pending' 
    CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'collected', 'cancelled')),
  payment_status VARCHAR(20) DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'simulated', 'paid', 'failed', 'refunded')),
  
  -- Collection details
  collection_method VARCHAR(20) DEFAULT 'pickup'
    CHECK (collection_method IN ('pickup', 'delivery')),
  customer_notes TEXT,
  pharmacy_notes TEXT,
  
  -- Timestamps for workflow tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  prepared_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ
);

-- Order line items
CREATE TABLE patient__daily_deals__order_items (
  order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES patient__daily_deals__orders(order_id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES pharmacy__daily_deals__products(product_id),
  special_id UUID REFERENCES pharmacy__daily_deals__specials(special_id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  is_special_price BOOLEAN DEFAULT false,
  discount_applied DECIMAL(10,2) DEFAULT 0
);
```

#### **5. Payment Simulation**
```sql
-- Payment processing (fake gateway for POC)
CREATE TABLE patient__daily_deals__payments (
  payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES patient__daily_deals__orders(order_id),
  payment_method VARCHAR(20) DEFAULT 'fake_card'
    CHECK (payment_method IN ('fake_card', 'fake_eft', 'cash', 'medical_aid')),
  amount DECIMAL(10,2) NOT NULL,
  gateway_reference VARCHAR(100), -- Fake transaction ID
  payment_status VARCHAR(20) DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'simulated', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔄 **ECOMMERCE WORKFLOW STATES**

### **Order State Machine**
```
[Customer] Browse → Add to Cart → Checkout → Place Order (pending)
    ↓
[Fake Payment] → Simulate Payment (simulated) 
    ↓
[Pharmacy] → Receive Order → Confirm Order (confirmed)
    ↓  
[Pharmacy] → Prepare Items (preparing)
    ↓
[Pharmacy] → Mark Ready (ready)
    ↓
[Customer] → Collect Order (collected)
```

### **Stock Management (Basic)**
```typescript
// Simple stock check before order placement
if (product.stock_quantity >= order_quantity) {
  // Allow order
  reduce_stock(product_id, quantity)
} else {
  // Show "out of stock" or "only X remaining"
}

// Deal stock tracking
if (special.deals_claimed + quantity <= special.total_deal_stock) {
  // Allow deal order
  increment_deals_claimed(special_id, quantity)
} else {
  // Deal sold out
}
```

---

## 🏗️ **API ARCHITECTURE (Microservice Boundaries)**

### **Patient API Routes**
```
/api/patient/daily-deals/browse          # List active deals with filtering
/api/patient/daily-deals/cart            # Cart management (add/remove/update)
/api/patient/daily-deals/checkout        # Order placement
/api/patient/daily-deals/payment         # Fake payment processing
/api/patient/daily-deals/orders          # Order tracking and history
```

### **Pharmacy API Routes**  
```
/api/pharmacy/daily-deals/products       # Product catalog management
/api/pharmacy/daily-deals/specials       # Deal creation and management
/api/pharmacy/daily-deals/orders         # Incoming order queue
/api/pharmacy/daily-deals/fulfillment    # Order status updates
```

---

## 💳 **PAYMENT SIMULATION (POC)**

### **Fake Payment Gateway**
```typescript
// Simulate payment processing with realistic workflow
const simulatePayment = async (amount: number, method: string) => {
  // Simulate processing delay (1-3 seconds)
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  // Simulate 95% success rate
  const isSuccess = Math.random() > 0.05
  
  if (isSuccess) {
    return {
      success: true,
      transaction_id: `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'simulated',
      amount: amount
    }
  } else {
    throw new Error('Payment simulation failed')
  }
}
```

### **Payment Methods (Simulated)**
- **Fake Card**: Simulate card payment with success/failure
- **Fake EFT**: Simulate bank transfer  
- **Cash on Collection**: No payment processing, pay at pharmacy
- **Medical Aid**: Simulate insurance billing

---

## 📱 **USER EXPERIENCE DESIGN**

### **Patient Deal Browsing**
- **Deal grid**: Product image, name, original price, special price, discount %
- **Filtering**: By pharmacy, category, discount percentage, distance
- **Search**: Product name, brand, category
- **Deal details**: Full product info, terms, pharmacy location, stock status

### **Shopping Cart Experience** 
- **Add to cart**: Quantity selection with stock validation
- **Cart management**: Update quantities, remove items, view totals
- **Multi-pharmacy handling**: Separate carts per pharmacy (different delivery)
- **Deal validation**: Check deal availability and customer limits

### **Checkout & Payment**
- **Order summary**: Items, quantities, prices, totals, delivery options
- **Customer details**: Name, phone, collection/delivery address
- **Payment selection**: Choose payment method (all simulated in POC)
- **Order confirmation**: Order number, collection details, estimated time

### **Order Tracking**
- **Status updates**: Real-time order progression tracking
- **Pharmacy communication**: Notes and updates from pharmacy
- **Collection details**: Address, hours, contact information
- **Order history**: Past orders and reorder functionality

---

## 🚀 **IMPLEMENTATION PRIORITIES**

### **Phase 1: Working Ecommerce (Current)**
- **Real cart functionality** with persistent storage
- **Actual order placement** with pharmacy notification
- **Fake payment simulation** with realistic success/failure
- **Order tracking** with status progression
- **Basic inventory** to prevent overselling

### **Phase 2: Enhanced Features (Future)**  
- **Real payment integration** (Stripe, PayPal, local gateways)
- **Advanced stock reservations** during checkout process
- **Real-time notifications** (WebSocket order updates)
- **Delivery integration** (courier services, tracking)
- **Analytics dashboard** (deal performance, customer insights)

**This specification provides working ecommerce functionality** while establishing foundations for future scaling and microservices architecture.