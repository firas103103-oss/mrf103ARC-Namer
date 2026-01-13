import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { updateDocumentDirection } from '@/lib/i18n';

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    updateDocumentDirection(newLang);
  };

  const isArabic = i18n.language === 'ar';

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2 min-w-[70px]"
      data-testid="button-language-toggle"
    >
      <Languages className="h-4 w-4" />
      <span className="font-medium">{isArabic ? 'EN' : 'AR'}</span>
    </Button>
  );
}

export default LanguageToggle;
