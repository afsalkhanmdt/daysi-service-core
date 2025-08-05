import { z } from "zod";

export const ChangePasswordSchema = z.object({
  memberid: z.string().min(1, "MemberId is required"),
  newpassword: z.string().min(1, "New password is required"),
  confirmpassword: z.string().min(1, "Confirm password is required"),
})
.refine((data) => data.newpassword === data.confirmpassword, {
  message: "The new password and confirmation password do not match.",
  path: ["ConfirmPassword"],
});
