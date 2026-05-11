'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import OrderTable from '@/components/orders/OrderTable';
import OrderFilter from '@/components/orders/OrderFilter';

export default function OrdersPage() {
  const [filters, setFilters] = useState({
    externalCode: '',
    receiverName: '',
    dateRange: null as [string, string] | null,
  });

  return (
    <AppLayout>
      <OrderFilter filters={filters} onFilterChange={setFilters} />
      <OrderTable filters={filters} />
    </AppLayout>
  );
}
