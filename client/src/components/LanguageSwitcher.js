import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ru' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage}>
      <span className="text-sm font-medium">{i18n.language.toUpperCase()}</span>
      <span className="sr-only">Toggle language</span>
    </Button>
  );
}
