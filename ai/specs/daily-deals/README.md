# Daily Deals Ecommerce System Specification

**Date**: 2025-09-01  
**Status**: Specification Complete  
**Purpose**: Pharmacy deals marketplace with working ecommerce functionality

---

## 📖 **READING ORDER**

### **1. SYSTEM OVERVIEW**
- `DAILY-DEALS-OVERVIEW.md` - Complete system architecture and workflow
- `ECOMMERCE-ARCHITECTURE.md` - Database design and business logic
- `USER-WORKFLOWS.md` - Patient and pharmacy user experiences

### **2. IMPLEMENTATION GUIDE**  
- `POC-IMPLEMENTATION.md` - Phase 1 working ecommerce system
- `FUTURE-ENHANCEMENTS.md` - Advanced features for scale (10k+ users)

---

## 🏪 **SYSTEM CONCEPT**

### **Pharmacy Deals Marketplace**
Like **onedayonly.co.za** but for pharmacy products:
- **Pharmacies**: Create special offers on health products
- **Patients**: Browse deals, add to cart, place orders  
- **Real workflow**: Actual orders with fake payment simulation
- **Live order flow**: Orders appear instantly in pharmacy management

### **Domain Structure**
```
patient/daily-deals/browse/        # Deal browsing and search
patient/daily-deals/cart/          # Shopping cart management  
patient/daily-deals/orders/        # Order placement and tracking

pharmacy/daily-deals/specials/     # Deal creation and management
pharmacy/daily-deals/orders/       # Incoming order queue  
pharmacy/daily-deals/products/     # Basic product management
```

---

## 🎯 **CORE FEATURES (Working System)**

### **Patient Experience**
1. **Browse deals** - List of current pharmacy specials with filtering
2. **Add to cart** - Real cart functionality with quantity selection
3. **Place orders** - Complete order form with delivery/pickup options
4. **Fake payment** - Payment simulation for workflow testing
5. **Order tracking** - Real status updates (placed → confirmed → ready)

### **Pharmacy Experience**  
1. **Create specials** - Add products with special pricing and validity
2. **Receive orders** - Real orders appear in queue immediately
3. **Process orders** - Update status (confirm → prepare → ready)
4. **Product management** - Basic inventory and pricing control
5. **Order history** - View completed and pending orders

---

## 🔧 **TECHNICAL FOUNDATION**

### **Database Architecture**
- **Product catalog**: pharmacy__daily_deals__products
- **Special offers**: pharmacy__daily_deals__specials  
- **Shopping carts**: patient__daily_deals__carts
- **Orders**: patient__daily_deals__orders
- **Order items**: patient__daily_deals__order_items

### **Ecommerce Features**
- **Real cart persistence** (not mockup)
- **Order state management** (pending → confirmed → ready → collected)
- **Inventory tracking** (basic stock levels)
- **Payment simulation** (fake gateway for testing)
- **Real-time order notifications** (pharmacy sees orders instantly)

### **Architecture Preparation**
- **Logical separation** ready for microservices extraction
- **API boundaries** designed for service independence
- **Event-driven patterns** for order processing
- **Scalable foundations** without premature optimization

---

## ⚡ **CURRENT SCOPE (Phase 1)**

### **INCLUDED (Working Features)**
- ✅ **Full shopping cart** with add/remove/quantity management
- ✅ **Real order placement** with customer and pharmacy data
- ✅ **Payment simulation** (fake gateway for testing workflow)
- ✅ **Order tracking** with status updates patient can see
- ✅ **Pharmacy order queue** with real incoming orders
- ✅ **Basic inventory** tracking to prevent overselling

### **DEFERRED (Future Phases)**
- ❌ **Real payment gateways** (Stripe, PayPal integration)
- ❌ **Advanced stock reservations** (hold items during checkout)
- ❌ **Real-time notifications** (WebSocket order updates)  
- ❌ **Complex promotions** (BOGO, bundles, loyalty points)
- ❌ **Scale optimizations** (caching, CDN, performance tuning)

---

**Start with DAILY-DEALS-OVERVIEW.md for complete system understanding.**