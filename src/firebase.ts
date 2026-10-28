import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
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

export const db = initializeFirestore(app, {
  experimentalLongPollingOptions: {
    timeoutSeconds: 15
  },
  experimentalForceLongPolling: true
});

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('TIMEOUT'));
    }, ms);
    promise
      .then(res => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

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
    const docRef = await withTimeout(addDoc(ordersCollection, orderData), 6000);
    return { success: true, id: docRef.id, isFirestore: true };
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
    
    const isPermissionError = error?.code === 'permission-denied';
    const isTimeout = error?.message === 'TIMEOUT';

    return { 
      success: true, 
      id: fallbackId, 
      isLocalFallback: true,
      reason: isPermissionError ? 'permission-denied' : isTimeout ? 'timeout' : 'network-error'
    };
  }
};
