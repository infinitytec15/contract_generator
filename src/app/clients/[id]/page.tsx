import { redirect } from "next/navigation";

export default function ClientPage({ params }: { params: { id: string } }) {
  // Redirect to the details page for this client
  return redirect(`/clients/${params.id}/details`);
}
