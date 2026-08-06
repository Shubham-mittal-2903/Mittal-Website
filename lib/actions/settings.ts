"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { settingsSchema, type SettingsInput } from "@/lib/validations/settings";

export async function getSettings() {
  const settings = await db.appSettings.findUnique({ where: { id: 1 } });
  return settings;
}

export async function saveSettings(input: SettingsInput) {
  const data = settingsSchema.parse(input);
  await db.appSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  });
  revalidatePath("/leads/settings");
}
