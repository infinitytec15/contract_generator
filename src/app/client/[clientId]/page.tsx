import { redirect } from "next/navigation";

export default function ClientIdRedirect({
  params,
}: {
  params: { id: string };
}) {
  // Redirect to the clients/id route
  return redirect(`/clients/${params.id}`);
}
