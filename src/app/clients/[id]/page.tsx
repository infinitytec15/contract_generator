import { redirect } from "next/navigation";

export default function ClientIdRedirect({
  params,
}: {
  params: { id: string };
}) {
  // Redirect from the new [id] route to the established [clientId] route
  return redirect(`/clients/${params.id}`);
}
