import { redirect } from "next/navigation";

export default function ClientIdRedirect({
  params,
}: {
  params: { clientId: string };
}) {
  // Redirect to the equivalent route using 'id' parameter instead of 'clientId'
  return redirect(`/clients/${params.clientId}/details`);
}
