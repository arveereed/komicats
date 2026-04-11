import { getActiveProfileId, getProfiles } from "@/actions/profile.action";
import CustomProfileDetails from "@/components/CustomProfileDetails";
import ProfileSettingsActions from "@/components/ProfileSettingsActions";
import SignoutSetting from "@/components/SignoutSetting";

export default async function Page() {
  const profiles = await getProfiles();
  const activeProfileId = await getActiveProfileId();

  return (
    <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-5 px-4 py-8">
      <div className="rounded-3xl border border-white/10 bg-[#375055] px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Profile details
        </h1>
        <p className="mt-1 text-sm text-white/65">
          Manage your profile, emails, and account preferences.
        </p>
      </div>

      <ProfileSettingsActions
        profiles={profiles}
        activeProfileId={activeProfileId}
      />

      <CustomProfileDetails />

      <SignoutSetting />
    </div>
  );
}
