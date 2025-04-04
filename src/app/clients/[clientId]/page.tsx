import { redirect } from "next/navigation";

export default function ClientIdRedirect({
  params,
}: {
  params: { clientId: string };
}) {
  // Redirect to the details page using the id parameter
  return redirect(`/clients/${params.clientId}/details`);
}
