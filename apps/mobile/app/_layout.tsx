import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { initTelemetry } from '../lib/telemetry';

export default function RootLayout() {
  useEffect(() => { initTelemetry(); }, []);
  return <Slot />;
}
