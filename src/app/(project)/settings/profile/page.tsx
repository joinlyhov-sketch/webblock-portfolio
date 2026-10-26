import { requireUser } from "@/lib/auth/session";
import { getProfileView, ProfileView } from "@/features/account";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getProfileView(user.id);

  return <ProfileView profile={profile} />;
}
