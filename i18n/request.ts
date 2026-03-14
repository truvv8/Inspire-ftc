import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "ru";
  const validLocale = ["ru", "en"].includes(locale) ? locale : "ru";

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});