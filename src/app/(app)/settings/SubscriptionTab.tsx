'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { getActivePlan, listUserSubscriptions } from '@/lib/subscriptions';
import { getCurrentUser } from '@/lib/appwrite';
import type { Subscription, Users } from '@/types/appwrite';

export function SubscriptionTab() {
  const [user, setUser] = useState<Users | null>(null);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const plan = await getActivePlan(currentUser.$id);
        setActivePlan(plan);
        const subs = await listUserSubscriptions(currentUser.$id);
        setSubscriptions(subs.documents as Subscription[]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view your subscription details.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Manage your subscription plan and view your usage.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Current Plan</h3>
          {activePlan ? (
            <div>
              <p><strong>Plan:</strong> {activePlan.plan}</p>
              <p><strong>Status:</strong> {activePlan.status}</p>
              {activePlan.periodEnd && <p><strong>Renews on:</strong> {new Date(activePlan.periodEnd).toLocaleDateString()}</p>}
            </div>
          ) : (
            <p>No active plan found.</p>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Manage Subscription</h3>
          <p>To upgrade or change your plan, please visit our pricing page.</p>
          <Button>Go to Pricing</Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Subscription History</h3>
          {subscriptions.length > 0 ? (
            <ul className="space-y-2">
              {subscriptions.map((sub) => (
                <li key={sub.$id} className="p-2 border rounded-md">
                  <p><strong>Plan:</strong> {sub.plan}</p>
                  <p><strong>Status:</strong> {sub.status}</p>
                  {sub.currentPeriodStart && <p><strong>From:</strong> {new Date(sub.currentPeriodStart).toLocaleDateString()}</p>}
                  {sub.currentPeriodEnd && <p><strong>To:</strong> {new Date(sub.currentPeriodEnd).toLocaleDateString()}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p>No subscription history found.</p>
          )}
        </div>
      </CardContent>
    </-Card>
  );
}
