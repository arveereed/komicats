"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Check,
  Loader2,
  Mail,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserCircle2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function CustomProfileDetails() {
  const { isLoaded, isSignedIn, user } = useUser();

  const [isUploading, setIsUploading] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState<string | null>(null);
  const [isRemovingEmail, setIsRemovingEmail] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [createdEmailId, setCreatedEmailId] = useState<string | null>(null);

  const [showEditName, setShowEditName] = useState(false);
  const [showAddEmail, setShowAddEmail] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#375055] text-white shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
        <div className="flex items-center gap-2 px-4 py-5 text-sm text-white/70 sm:px-6 sm:py-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  if (!isSignedIn || !user) return null;

  const primaryEmail =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    "No email";

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const resetAddEmailState = () => {
    setNewEmail("");
    setVerificationCode("");
    setCreatedEmailId(null);
  };

  const handleToggleEditName = () => {
    clearMessages();

    if (!showEditName) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }

    setShowEditName((prev) => !prev);
  };

  const handleToggleAddEmail = () => {
    clearMessages();

    if (showAddEmail) {
      resetAddEmailState();
    }

    setShowAddEmail((prev) => !prev);
  };

  const handleSaveName = async () => {
    clearMessages();

    try {
      setIsSavingName(true);

      await user.update({
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
      });

      await user.reload();

      setSuccess("Profile updated.");
      setShowEditName(false);
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || "Failed to update profile.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleUploadImage = async (file?: File) => {
    if (!file) return;

    clearMessages();

    try {
      setIsUploading(true);
      await user.setProfileImage({ file });
      await user.reload();
      setSuccess("Profile image updated.");
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || "Failed to update image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddEmail = async () => {
    clearMessages();

    if (!newEmail.trim()) {
      setError("Please enter an email address.");
      return;
    }

    try {
      setIsAddingEmail(true);

      const created = await user.createEmailAddress({
        email: newEmail.trim(),
      });

      await created.prepareVerification({ strategy: "email_code" });
      setCreatedEmailId(created.id);
      setSuccess("Verification code sent to your email.");
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || "Failed to add email.");
    } finally {
      setIsAddingEmail(false);
    }
  };

  const handleVerifyEmail = async () => {
    clearMessages();

    if (!createdEmailId || !verificationCode.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    try {
      setIsVerifyingEmail(true);

      const target = user.emailAddresses.find((e) => e.id === createdEmailId);

      if (!target) {
        setError("Email not found.");
        return;
      }

      await target.attemptVerification({
        code: verificationCode.trim(),
      });

      await user.reload();

      resetAddEmailState();
      setShowAddEmail(false);
      setSuccess("Email verified successfully.");
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || "Invalid verification code.");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSetPrimary = async (emailId: string) => {
    clearMessages();

    try {
      const target = user.emailAddresses.find((e) => e.id === emailId);

      if (!target) {
        setError("Email not found.");
        return;
      }

      if (target.verification?.status !== "verified") {
        setError("Only verified email addresses can be made primary.");
        return;
      }

      setIsSettingPrimary(emailId);

      await user.update({
        primaryEmailAddressId: target.id,
      });

      await user.reload();
      setSuccess("Primary email updated.");
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || "Failed to set primary email.");
    } finally {
      setIsSettingPrimary(null);
    }
  };

  const handleRemoveEmail = async (emailId: string) => {
    clearMessages();

    try {
      const target = user.emailAddresses.find((e) => e.id === emailId);

      if (!target) {
        setError("Email not found.");
        return;
      }

      const isPrimary = user.primaryEmailAddressId === emailId;
      if (isPrimary) {
        setError("You cannot remove your primary email.");
        return;
      }

      setIsRemovingEmail(emailId);

      await target.destroy();
      await user.reload();
      setSuccess("Email removed.");
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || "Failed to remove email.");
    } finally {
      setIsRemovingEmail(null);
    }
  };

  const expandTransition = {
    duration: 0.24,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  const expandVariants = {
    initial: {
      opacity: 0,
      height: 0,
      y: -8,
    },
    animate: {
      opacity: 1,
      height: "auto",
      y: 0,
    },
    exit: {
      opacity: 0,
      height: 0,
      y: -6,
    },
  };

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-[#375055] text-white shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
      <div className="border-b border-white/10 bg-white/[0.03] px-4 py-5 backdrop-blur sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Profile details
        </h1>
        <p className="mt-1 text-sm text-white/65">
          Manage your profile, emails, and connected accounts.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {(error || success) && (
          <motion.div
            key={error ? "error" : "success"}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="px-4 pt-4 sm:px-6"
          >
            {error ? (
              <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                {success}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="px-4 py-5 sm:px-6 sm:py-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.12em] text-white/60">
          Profile
        </h2>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="h-14 w-14 shrink-0 ring-2 ring-white/10 sm:h-16 sm:w-16">
                <AvatarImage
                  src={user.imageUrl}
                  alt={user.fullName || "User"}
                />
                <AvatarFallback className="bg-white/10 text-white">
                  <UserCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-white">
                  {user.fullName || "Unnamed user"}
                </p>
                <p className="truncate text-sm text-white/70">{primaryEmail}</p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
              <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15 sm:w-auto">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadImage(e.target.files?.[0])}
                />
                {isUploading ? "Updating..." : "Update profile"}
              </label>

              <button
                type="button"
                onClick={handleToggleEditName}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/10 sm:w-auto"
              >
                <motion.span
                  animate={{
                    rotate: showEditName ? 90 : 0,
                    scale: showEditName ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {showEditName ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}
                </motion.span>
                {showEditName ? "Close" : "Edit name"}
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {showEditName && (
              <motion.div
                key="edit-name-panel"
                variants={expandVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={expandTransition}
                className="overflow-hidden will-change-[height,opacity,transform]"
              >
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-cyan-300/30 focus:bg-black/15"
                  />
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-cyan-300/30 focus:bg-black/15"
                  />

                  <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleSaveName}
                      disabled={isSavingName}
                      className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#375055] transition hover:opacity-90 disabled:opacity-70 sm:w-auto"
                    >
                      {isSavingName ? "Saving..." : "Save changes"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowEditName(false)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="border-t border-white/10 px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-white/60">
            Email addresses
          </h2>

          <button
            type="button"
            onClick={handleToggleAddEmail}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.06] sm:w-auto"
          >
            <motion.span
              animate={{
                rotate: showAddEmail ? 45 : 0,
                scale: showAddEmail ? 1.05 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="h-4 w-4" />
            </motion.span>
            {showAddEmail ? "Close" : "Add email"}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showAddEmail && (
            <motion.div
              key="add-email-panel"
              variants={expandVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={expandTransition}
              className="overflow-hidden will-change-[height,opacity,transform]"
            >
              <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex flex-col gap-3">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-cyan-300/30 focus:bg-black/15"
                  />

                  {!createdEmailId ? (
                    <button
                      type="button"
                      onClick={handleAddEmail}
                      disabled={isAddingEmail}
                      className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#375055] transition hover:opacity-90 disabled:opacity-70 sm:w-fit"
                    >
                      {isAddingEmail
                        ? "Sending code..."
                        : "Add and send verification"}
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex flex-col gap-3 sm:flex-row"
                    >
                      <input
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter verification code"
                        className="w-full rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-cyan-300/30 focus:bg-black/15"
                      />

                      <button
                        type="button"
                        onClick={handleVerifyEmail}
                        disabled={isVerifyingEmail}
                        className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#375055] transition hover:opacity-90 disabled:opacity-70 sm:w-auto"
                      >
                        {isVerifyingEmail ? "Verifying..." : "Verify email"}
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {user.emailAddresses.map((email) => {
            const isPrimary = user.primaryEmailAddressId === email.id;
            const isVerified = email.verification?.status === "verified";
            const settingPrimary = isSettingPrimary === email.id;
            const removingEmail = isRemovingEmail === email.id;

            return (
              <div
                key={email.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 transition hover:bg-white/[0.06] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3 sm:items-center">
                  <div className="rounded-xl bg-white/10 p-2">
                    <Mail className="h-4 w-4 text-cyan-200" />
                  </div>

                  <div className="min-w-0">
                    <p className="break-all text-sm font-medium text-white sm:truncate">
                      {email.emailAddress}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {isPrimary && (
                        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-0.5 text-[11px] font-medium text-cyan-100">
                          Primary
                        </span>
                      )}

                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
                          isVerified
                            ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                            : "border-amber-300/20 bg-amber-300/10 text-amber-100"
                        }`}
                      >
                        {isVerified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(email.id)}
                      disabled={settingPrimary || removingEmail}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-70 sm:w-auto"
                    >
                      {settingPrimary ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Set primary
                    </button>
                  )}

                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email.id)}
                      disabled={settingPrimary || removingEmail}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-100 transition hover:bg-red-400/15 disabled:opacity-70 sm:w-auto"
                    >
                      {removingEmail ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="border-t border-white/10 bg-black/10 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-center gap-2 text-center text-xs text-white/55">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Secured by Komicats
        </div>
      </div>
    </div>
  );
}
