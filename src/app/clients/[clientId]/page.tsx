import { redirect } from "next/navigation";

export default function ClientIdRedirect({
  params,
}: {
  params: { clientId: string };
}) {
  // Redirect to the details page using the clientId parameter
  return redirect(`/clients/${params.clientId}/details`);
}
