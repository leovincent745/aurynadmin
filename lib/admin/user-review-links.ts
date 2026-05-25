/** Deep links between user profiles and conversation review (Step 1). */

export function conversationsHrefForUserEmail(email: string): string {
  const params = new URLSearchParams({ email });
  return `/conversations?${params.toString()}`;
}

export function userProfileHref(userId: string): string {
  return `/users/${userId}`;
}
