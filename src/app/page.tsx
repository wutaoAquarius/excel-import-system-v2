'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import UploadSection from '@/components/import/UploadSection';
import MappingSection from '@/components/import/MappingSection';
import PreviewSection from '@/components/import/PreviewSection';
import ResultSection from '@/components/import/ResultSection';

export default function ImportPage() {
  return (
    <AppLayout>
      <UploadSection />
      <MappingSection />
      <PreviewSection />
      <ResultSection />
    </AppLayout>
  );
}
