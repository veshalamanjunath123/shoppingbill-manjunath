import { CartItem, BillCalculation, OfferSavings } from './types';

export const calculateBill = (items: CartItem[]): BillCalculation => {
  const itemMap: Record<string, { quantity: number; price: number; name: string }> = {};

  let subtotal = 0;
  for (const item of items) {
    itemMap[item.product.id] = {
      quantity: item.quantity,
      price: item.product.price,
      name: item.product.name
    };
    subtotal += item.product.price * item.quantity;
  }

  const offers: OfferSavings[] = [];

  const soupQty = itemMap['soup']?.quantity || 0;
  const breadQty = itemMap['bread']?.quantity || 0;
  const breadPrice = itemMap['bread']?.price || 0.80;

  if (soupQty > 0 && breadQty > 0) {
    const discountedBreads = Math.min(soupQty, breadQty);
    const saving = Math.round(discountedBreads * (breadPrice * 0.5) * 100) / 100;
    if (saving > 0) {
      offers.push({
        name: 'Soup & Bread Half Price',
        description: `Bought ${soupQty} soup(s), get ${discountedBreads} bread(s) at 50% off`,
        saving
      });
    }
  }

  const cheeseQty = itemMap['cheese']?.quantity || 0;
  const cheesePrice = itemMap['cheese']?.price || 0.90;
  if (cheeseQty >= 2) {
    const freeCheeses = Math.floor(cheeseQty / 2);
    const saving = Math.round(freeCheeses * cheesePrice * 100) / 100;
    if (saving > 0) {
      offers.push({
        name: 'Cheese Buy 1 Get 1 Free',
        description: `Bought ${cheeseQty} cheese(s), received ${freeCheeses} free`,
        saving
      });
    }
  }

  const butterQty = itemMap['butter']?.quantity || 0;
  const butterPrice = itemMap['butter']?.price || 0.80;
  if (butterQty > 0) {
    const singleButterSaving = butterPrice / 3;
    const saving = Math.round(butterQty * singleButterSaving * 100) / 100;
    if (saving > 0) {
      offers.push({
        name: 'Butter A Third Off',
        description: `Get 33% off on ${butterQty} butter tub(s)`,
        saving
      });
    }
  }

  const totalSavings = Math.round(offers.reduce((acc, curr) => acc + curr.saving, 0) * 100) / 100;
  const finalTotal = Math.max(0, Math.round((subtotal - totalSavings) * 100) / 100);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    offers,
    totalSavings,
    finalTotal
  };
};
