import * as deepl from "deepl-node";

// DeepL's target-language codes are more specific than our app's "fr"/"en"
// (e.g. "EN-US" vs "EN-GB"). We only ever need the two languages the UI
// supports, so map explicitly instead of guessing.
const TARGET_LANG: Record<string, deepl.TargetLanguageCode> = {
  en: "en-US",
  fr: "fr",
};

const SOURCE_LANG: Record<string, deepl.SourceLanguageCode> = {
  en: "en",
  fr: "fr",
};

let translator: deepl.Translator | null | undefined;

function getTranslator(): deepl.Translator | null {
  if (translator !== undefined) return translator;

  const key = process.env.DEEPL_API_KEY;
  translator = key ? new deepl.Translator(key) : null;
  return translator;
}

/**
 * Translates `text` from `sourceLang` into `targetLang` (both "fr" | "en").
 * Falls back to returning the original text untouched if:
 *   - no DEEPL_API_KEY is configured,
 *   - source and target are the same language,
 *   - the DeepL request fails for any reason (network, quota, etc).
 * Translation is a nice-to-have for reading finished stories — it should
 * never be able to break gameplay, so failures are swallowed, not thrown.
 */
export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  if (!text.trim() || sourceLang === targetLang) return text;

  const client = getTranslator();
  if (!client) return text;

  try {
    const result = await client.translateText(
      text,
      SOURCE_LANG[sourceLang] ?? null,
      TARGET_LANG[targetLang] ?? "en-US",
    );
    return result.text;
  } catch (err) {
    console.error("DeepL translation failed, falling back to original text:", err);
    return text;
  }
}

/**
 * The host-entered lobby name is free text in the lobby's own language
 * (`lobby.language`). Translate it for viewers whose UI language differs —
 * `viewerLanguage` is untrusted query-param input, so anything other than
 * "en"/"fr" (including null) is treated as "don't translate".
 */
export async function translateLobbyName<T extends { name: string | null; language: string }>(
  lobby: T,
  viewerLanguage: string | null,
): Promise<T> {
  if (!lobby.name || (viewerLanguage !== "en" && viewerLanguage !== "fr")) return lobby;
  return { ...lobby, name: await translateText(lobby.name, lobby.language, viewerLanguage) };
}
