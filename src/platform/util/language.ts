// TODO - This is deprioritized for now

declare var localizationLookup: object;

const getLanguages = () => {
  const languages: string[] = [];
  if (window["localizationLookup"]) {
    for (let key in localizationLookup) {
      languages.push(key);
    }
  }
  return languages;
};

export const AVAILABLE_LANGUAGES: string[] = getLanguages();
