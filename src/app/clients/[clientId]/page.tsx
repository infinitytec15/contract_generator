import { redirect } from "next/navigation";

export default function ClientIdRedirect({
  params,
}: {
  params: { clientId: string };
}) {
  // Redirect to the id-based route to consolidate on a single parameter name
  return redirect(`/clients/${params.clientId}`);
}
