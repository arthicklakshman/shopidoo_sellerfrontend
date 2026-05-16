export const getDeliverySummary = (form) => {
  const price = Number(form.price || 0);
  const charge = Number(form.delivery_charge || 0);
  const threshold = Number(form.free_delivery_min_order || 0);

  if (form.delivery_type === 'free') {
    return { label: 'Free Delivery', deliveryCharge: 0, total: price };
  }

  if (form.delivery_type === 'conditional' && threshold > 0 && price >= threshold) {
    return { label: `Free Delivery above Rs ${threshold.toLocaleString('en-IN')}`, deliveryCharge: 0, total: price };
  }

  return {
    label: form.delivery_type === 'conditional'
      ? `Rs ${charge.toLocaleString('en-IN')} delivery, free above Rs ${threshold.toLocaleString('en-IN')}`
      : `Rs ${charge.toLocaleString('en-IN')} delivery`,
    deliveryCharge: charge,
    total: price + charge,
  };
};
