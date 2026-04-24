export function getFirebaseErrorCode(error: unknown): string {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return "";
  }

  const { code } = error as { code?: unknown };
  return typeof code === "string" ? code : "";
}

export function getFirebaseErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object" || !("message" in error)) {
    return "";
  }

  const { message } = error as { message?: unknown };
  return typeof message === "string" ? message : "";
}

export function isFirestorePermissionDenied(error: unknown): boolean {
  const code = getFirebaseErrorCode(error);
  const message = getFirebaseErrorMessage(error).toLowerCase();
  return (
    code === "permission-denied" ||
    code === "firestore/permission-denied" ||
    message.includes("missing or insufficient permissions")
  );
}
