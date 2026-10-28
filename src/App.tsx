import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { addToCart, removeFromCart, deleteItem, clearCart } from './store/cartSlice';
import { PRODUCTS } from './products';
import { calculateBill } from './offers';
import { saveOrderToFirestore } from './firebase';
import { ShoppingCart, Tag, CheckCircle, Trash2, Plus, Minus, Store } from 'lucide-react';
import './styles.css';

export const App: React.FC = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState<boolean>(false);

  const bill = calculateBill(cartItems);

  const handleSaveOrder = async () => {
    if (cartItems.length === 0) return;
    setSavingOrder(true);
    const res = await saveOrderToFirestore(cartItems, bill, 'Manjunath');
    setSavingOrder(false);
    if (res.success) {
      setOrderStatus(`Order saved successfully! Order ID: ${res.id}`);
      dispatch(clearCart());
      setTimeout(() => setOrderStatus(null), 5000);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Shopping Bill Application</h1>
        <p>Built with React, TypeScript & Redux Toolkit &bull; Author: Manjunath</p>
      </header>

      <div className="main-layout">
        <section>
          <h2 className="section-title">
            <Store size={22} color="#4f46e5" />
            Available Products
          </h2>
          <div className="product-grid">
            {PRODUCTS.map(product => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} className="product-img" />
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">£{product.price.toFixed(2)} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/{product.unit}</span></div>
                  <button className="btn-add" onClick={() => dispatch(addToCart(product))}>
                    <Plus size={16} /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <h2 className="section-title">
              <Tag size={20} color="#10b981" />
              Active Special Offers
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
                <strong style={{ color: '#4f46e5' }}>Soup &amp; Bread Offer</strong>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Buy 1 Soup, get 1 Bread at half price (50% off).</p>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
                <strong style={{ color: '#4f46e5' }}>Cheese Offer</strong>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Buy 1 get 1 Free on all Cheese packs.</p>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
                <strong style={{ color: '#4f46e5' }}>Butter Offer</strong>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Get a third off (33% discount) on Butter.</p>
              </div>
            </div>
          </div>
        </section>

        <aside>
          <div className="bill-card">
            <h2 className="section-title">
              <ShoppingCart size={22} color="#4f46e5" />
              Your Cart &amp; Bill
            </h2>

            {cartItems.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>Your basket is empty. Select products to begin!</p>
            ) : (
              <>
                <ul className="cart-list">
                  {cartItems.map(item => (
                    <li key={item.product.id} className="cart-item">
                      <div>
                        <div className="cart-item-name">{item.product.name}</div>
                        <div className="cart-item-sub">£{item.product.price.toFixed(2)} &times; {item.quantity}</div>
                      </div>
                      <div className="qty-controls">
                        <button className="qty-btn" onClick={() => dispatch(removeFromCart(item.product.id))}>
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 600, minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => dispatch(addToCart(item.product))}>
                          <Plus size={14} />
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '0.25rem', color: '#ef4444' }} onClick={() => dispatch(deleteItem(item.product.id))}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="bill-row">
                  <span>Subtotal</span>
                  <span>£{bill.subtotal.toFixed(2)}</span>
                </div>

                {bill.offers.length > 0 && (
                  <div className="offers-box">
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Tag size={14} /> Applied Discounts
                    </div>
                    {bill.offers.map((offer, idx) => (
                      <div key={idx} className="offer-item">
                        <div className="bill-row" style={{ margin: 0 }}>
                          <span className="offer-title">{offer.name}</span>
                          <span style={{ color: '#166534', fontWeight: 700 }}>-£{offer.saving.toFixed(2)}</span>
                        </div>
                        <div className="offer-desc">{offer.description}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bill-row saving">
                  <span>Total Savings</span>
                  <span>-£{bill.totalSavings.toFixed(2)}</span>
                </div>

                <div className="divider" />

                <div className="bill-total">
                  <span>Final Payable</span>
                  <span style={{ color: '#4f46e5' }}>£{bill.finalTotal.toFixed(2)}</span>
                </div>

                <button
                  className="btn-checkout"
                  disabled={savingOrder}
                  onClick={handleSaveOrder}
                >
                  <CheckCircle size={18} />
                  {savingOrder ? 'Saving to Database...' : 'Save Order to Firebase'}
                </button>

                <button className="btn-clear" onClick={() => dispatch(clearCart())}>
                  Clear Cart
                </button>

                {orderStatus && (
                  <div className="toast">
                    {orderStatus}
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default App;
