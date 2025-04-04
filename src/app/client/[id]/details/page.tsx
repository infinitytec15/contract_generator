import { redirect } from "next/navigation";

export default function ClientIdDetailsRedirect({
  params,
}: {
  params: { id: string };
}) {
  // Redirect to the clients/id/details route
  return redirect(`/clients/${params.id}/details`);
}
