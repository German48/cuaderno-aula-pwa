import { useEffect, useMemo, useState } from 'react';

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installHint = useMemo(() => {
    const ua = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);

    if (isIOS) return 'En iPhone/iPad: pulsa Compartir y luego “Añadir a pantalla de inicio”.';
    if (isAndroid) return 'En Android: abre el menú del navegador y pulsa “Instalar app” o “Añadir a pantalla de inicio”.';
    return 'Si no aparece el botón, usa el menú del navegador para instalar o añadir la app a la pantalla de inicio.';
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
    return result?.outcome === 'accepted';
  };

  return { canInstall, install, installHint };
}
