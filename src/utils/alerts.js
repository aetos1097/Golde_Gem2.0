import Swal from 'sweetalert2';

const getThemeColors = () => {
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() || '#fff';
  const text = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#1a1a1a';
  return { bg, text };
};

const themed = (options) => {
  const { bg, text } = getThemeColors();
  return Swal.fire({
    background: bg,
    color: text,
    confirmButtonColor: '#d4af37',
    customClass: { popup: 'rounded-2xl' },
    ...options,
  });
};

export const alertSuccess = (title, text) =>
  themed({ icon: 'success', title, text, confirmButtonText: 'Aceptar' });

export const alertError = (title, text) =>
  themed({ icon: 'error', title, text, confirmButtonText: 'Aceptar' });

export const alertWarning = (title, text) =>
  themed({ icon: 'warning', title, text, confirmButtonText: 'Aceptar' });

export const alertInfo = (title, text) =>
  themed({ icon: 'info', title, text, confirmButtonText: 'Aceptar' });

export const alertConfirm = (title, text) =>
  themed({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
  });

export const alertConfirmDelete = (title = 'Confirmar eliminación', text = 'Esta acción no se puede deshacer.') =>
  themed({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626',
  });

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export const toastSuccess = (title) => {
  const { bg, text } = getThemeColors();
  return Toast.fire({ icon: 'success', title, background: bg, color: text });
};

export const toastError = (title) => {
  const { bg, text } = getThemeColors();
  return Toast.fire({ icon: 'error', title, background: bg, color: text });
};
