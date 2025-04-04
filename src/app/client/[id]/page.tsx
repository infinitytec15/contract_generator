import { redirect } from "next/navigation";

export default function ClientIdRedirect({
  params,
}: {
  params: { id: string };
}) {
  // Redirect to the clients route with standardized parameter
  return redirect(`/clients/${params.id}`);
}
