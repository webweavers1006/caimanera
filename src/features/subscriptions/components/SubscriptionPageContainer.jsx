import { EntityPageContainer } from "@/components/shared/EntityPageContainer";
import { fetchSubscriptionsList } from "@/features/subscriptions/services/subscription.read.service";
import { SubscriptionTable } from "@/features/subscriptions/components/SubscriptionTable";
import { SUBSCRIPTION_CONFIG } from "@/features/subscriptions/config/subscription.constants";

export async function SubscriptionPageContainer({ searchParams }) {
  return (
    <EntityPageContainer
      config={SUBSCRIPTION_CONFIG}
      searchParams={searchParams}
      fetchData={fetchSubscriptionsList}
      renderTable={({ data, pagination }) => <SubscriptionTable data={data} pagination={pagination} />}
    />
  );
}
