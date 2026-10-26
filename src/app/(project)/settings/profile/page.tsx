import { requireUser } from "@/lib/auth/session";
import { getProfileView } from "@/service/account-service";
import { ProfileView } from "@/components/settings/profile-view";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getProfileView(user.id);

  return <ProfileView profile={profile} />;
}
