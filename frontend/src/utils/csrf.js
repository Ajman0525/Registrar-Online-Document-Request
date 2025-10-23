export function getCSRFToken() {
  const match = document.cookie.match(new RegExp('(^| )csrf_access_token=([^;]+)'));
  if (match) return match[2];
  return null;
}