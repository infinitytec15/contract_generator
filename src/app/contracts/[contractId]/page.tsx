import { redirect } from "next/navigation";

export default function ContractPage({
  params,
}: {
  params: { contractId: string };
}) {
  // Redirect to the details page for this contract
  return redirect(`/contracts/${params.contractId}/details`);
}
