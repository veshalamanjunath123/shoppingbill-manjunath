import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { BillCalculation, CartItem } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyCaEl8uHDySQami6jQNaOHxNDPb1Nmtr4U",
  authDomain: "shoppingbill-manjunath.firebaseapp.com",
  projectId: "shoppingbill-manjunath",
  storageBucket: "shoppingbill-manjunath.firebasestorage.app",
  messagingSenderId: "16500399661",
  appId: "1:16500399661:web:31947268ad1ec60f81e2a4"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

export const saveOrderToFirestore = async (
  items: CartItem[],
  bill: BillCalculation,
  customerName: string = 'Manjunath'
) => {
  const orderData = {
    customerName,
    createdAt: serverTimestamp(),
    items: items.map(i => ({
      id: i.product.id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity
    })),
    subtotal: bill.subtotal,
    savings: bill.totalSavings,
    finalAmount: bill.finalTotal,
    offersApplied: bill.offers
  };

  try {
    const ordersCollection = collection(db, 'orders');
    const docRef = await addDoc(ordersCollection, orderData);
    return { success: true, id: docRef.id, isFirestore: true, reason: '' };
  } catch (error: any) {
    const localHistory = JSON.parse(localStorage.getItem('manjunath_saved_orders') || '[]');
    const fallbackId = 'local-' + Date.now();
    localHistory.push({
      id: fallbackId,
      customerName,
      createdAt: new Date().toISOString(),
      items,
      bill
    });
    localStorage.setItem('manjunath_saved_orders', JSON.stringify(localHistory));
    return { success: true, id: fallbackId, isLocalFallback: true, reason: error?.message || 'error' };
  }
};
