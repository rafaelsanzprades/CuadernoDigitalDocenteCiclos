import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'react-hot-toast';
import { useAppStore, useTemporalStore } from '@/store/useAppStore';

export function useShortcuts() {
  const { pastStates } = useTemporalStore((state) => state);
  const undo = useTemporalStore((state) => state.undo);

  useHotkeys('ctrl+s, meta+s', (e) => {
    e.preventDefault();
    // For now we just show a toast. In Phase 2 this will trigger the real fileManager.saveModuleData
    // via a custom event or a store action.
    toast.success('Cambios guardados manualmente', {
      icon: '',
      duration: 3000,
    });
    // We dispatch a custom event that Header.tsx or AutoSave can listen to
    window.dispatchEvent(new Event('cdd-manual-save'));
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+z, meta+z', (e) => {
    if (pastStates.length > 0) {
      e.preventDefault();
      undo();
      toast('Cambio deshecho', {
        icon: '↩️',
        duration: 2000,
      });
    }
  }, { enableOnFormTags: true });

  // Add more global shortcuts here if needed
}
