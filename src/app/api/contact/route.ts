// Public contact form. A Route Handler, not a Server Action, because landing-page visitors are not
// signed in, so there is no user to require(). Mock now; Spring's public `POST /contact` later.
import { NextResponse, type NextRequest } from "next/server";
import { submitContact } from "@/features/landing";

export async function POST(request: NextRequest) {
  const result = await submitContact(await request.formData());
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
