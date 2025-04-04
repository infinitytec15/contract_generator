import { redirect } from "next/navigation";

export default function ClientIdRedirect({
  params,
}: {
  params: { clientId: string };
}) {
  // Redirect to the clients route with standardized parameter
  return redirect(`/clients/${params.clientId}`);
}
