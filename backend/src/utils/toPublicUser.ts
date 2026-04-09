type AuthUserDocument = {
  _id: { toString(): string };
  toObject?: () => { password?: unknown; [key: string]: unknown };
  password?: string | null;
};

export const toPublicUser = (user: AuthUserDocument) => {
  const rawUser =
    typeof user.toObject === "function"
      ? user.toObject()
      : ({ ...user } as { password?: unknown; [key: string]: unknown });
  const safeUser = { ...rawUser };
  safeUser.id = safeUser._id?.toString?.() || String(safeUser.id || "");
  safeUser.role = typeof safeUser.role === "string" ? safeUser.role : "user";
  safeUser.status = typeof safeUser.status === "string" ? safeUser.status : "active";
  safeUser.hasPassword = Boolean(safeUser.password);
  delete safeUser.password;
  return safeUser;
};
