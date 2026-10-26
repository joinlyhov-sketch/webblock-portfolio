import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <>
      <PageHeader title="Sign in" description="Mock sign-in until the backend is ready." />
      <form action="/api/mock-auth" method="post" className="flex flex-col gap-3">
        <Button type="submit" name="role" value="USER">
          Sign in as User
        </Button>
        <Button type="submit" name="role" value="ADMIN" variant="secondary">
          Sign in as Admin
        </Button>
      </form>
    </>
  );
}
