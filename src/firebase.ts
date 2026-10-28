import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { BillCalculation, CartItem } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyDummyApiKeyForManjunathApp123456789",
  authDomain: "shoppingbill-manjunath.firebaseapp.com",
  projectId: "shoppingbill-manjunath",
  storageBucket: "shoppingbill-manjunath.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:manjunathappabcdef123456"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

export const saveOrderToFirestore = async (
  items: CartItem[],
  bill: BillCalculation,
  customerName: string = 'Manjunath'
) => {
  try {
    const ordersCollection = collection(db, 'orders');
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

    const docRef = await addDoc(ordersCollection, orderData);
    return { success: true, id: docRef.id };
  } catch (error) {
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
    return { success: true, id: fallbackId, isLocalFallback: true };
  }
};
