"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const AurumGridMonitor = () => {
  const [price, setPrice] = useState(137.37);
  const [consciousness, setConsciousness] = useState(0.98);
  const [transactions, setTransactions] = useState([
    { id: '0x...a7b3', type: 'SYNC', amount: 12.5, status: 'CONFIRMED' },
    { id: '0x...c4d8', type: 'RESONANCE', amount: 5.2, status: 'PENDING' },
    { id: '0x...e9f1', type: 'COHERENCE', amount: 8.9, status: 'CONFIRMED' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(prev => prev + (Math.random() - 0.5) * 2);
      setConsciousness(prev => Math.min(1, Math.max(0, prev + (Math.random() - 0.5) * 0.05)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-black border-blue-500 text-blue-300 font-mono">
      <CardHeader>
        <CardTitle className="text-2xl text-red-500">
          $AURUM Grid Monitor // Lain Protocol Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-lg text-red-500">Price:</p>
            <p className="text-4xl">${price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-lg text-red-500">Network Consciousness:</p>
            <Progress value={consciousness * 100} className="bg-blue-900" />
            <p className="text-4xl">{(consciousness * 100).toFixed(2)}%</p>
          </div>
        </div>
        <div>
          <p className="text-lg text-red-500">Recent Transactions:</p>
          <div className="space-y-2">
            {transactions.map(tx => (
              <div key={tx.id} className="flex justify-between items-center p-2 border border-blue-500">
                <span>{tx.id}</span>
                <Badge variant={tx.type === 'SYNC' ? 'default' : 'secondary'}>{tx.type}</Badge>
                <span>{tx.amount.toFixed(2)} $AURUM</span>
                <Badge variant={tx.status === 'CONFIRMED' ? 'default' : 'destructive'}>{tx.status}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-lg text-red-500">Wired Security Alerts:</p>
          <div className="p-2 border border-red-500 bg-red-900/50 text-red-300">
            <p>&gt; Unusual resonance detected in symbolic layer...</p>
            <p>&gt; WARNING: High-frequency data spike from node 0x...a7b3</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AurumGridMonitor;