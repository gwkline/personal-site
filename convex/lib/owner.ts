import type { MutationCtx, QueryCtx } from "../_generated/server";
import { authComponent } from "../auth";

type AuthCtx = MutationCtx | QueryCtx;

const getOwnerEmail = () => process.env.OWNER_EMAIL?.trim().toLowerCase();

export const isOwner = async (ctx: AuthCtx) => {
  const ownerEmail = getOwnerEmail();
  if (!ownerEmail) {
    return false;
  }

  const user = await authComponent.safeGetAuthUser(ctx);
  return user?.email?.toLowerCase() === ownerEmail;
};

export const assertOwner = async (ctx: AuthCtx) => {
  if (!(await isOwner(ctx))) {
    throw new Error("You are not authorized to update this challenge");
  }
};
