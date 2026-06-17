import type { Metadata } from "next";
import StaffProfile from "../../_components/StaffProfile";

export const metadata: Metadata = {
    title: "Teacher Profile",
    description: "Teacher profile dashboard",
};

export default function StaffProfilePage({
    params,
}: {
    params: { id: string };
}) {
    return <StaffProfile params={params} />;
}
