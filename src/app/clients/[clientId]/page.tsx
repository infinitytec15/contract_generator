import { redirect } from "next/navigation";

export default function ClientIdRedirect({
  params,
}: {
  params: { clientId: string };
}) {
  // Redirect from the old [clientId] route to the details page directly
  return redirect(`/clients/${params.clientId}/details`);
}
