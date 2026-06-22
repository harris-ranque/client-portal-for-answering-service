import type { Tables } from "@/types/database";

export type ProfileUser = Tables<"users">;
export type ProfileCompany = Tables<"companies">;
export type ProfileContact = Tables<"company_contacts">;

export interface ProfileData {
  user: ProfileUser;
  company: ProfileCompany | null;
  contacts: ProfileContact[];
}
