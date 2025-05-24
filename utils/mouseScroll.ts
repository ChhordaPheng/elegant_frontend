export function useDraggableButton() {
  const isDragging = ref(false);
  const position = ref({ x: 0, y: 0 });
  const windowWidth = ref(0);
  const windowHeight = ref(0);

  const startDrag = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    isDragging.value = true;

    const isTouchEvent = event.type === 'touchstart';
    const clientX = isTouchEvent
      ? (event as TouchEvent).touches[0].clientX
      : (event as MouseEvent).clientX;
    const clientY = isTouchEvent
      ? (event as TouchEvent).touches[0].clientY
      : (event as MouseEvent).clientY;

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;

    const move = (moveEvent: MouseEvent | TouchEvent) => {
      const moveClientX = isTouchEvent
        ? (moveEvent as TouchEvent).touches[0].clientX
        : (moveEvent as MouseEvent).clientX;
      const moveClientY = isTouchEvent
        ? (moveEvent as TouchEvent).touches[0].clientY
        : (moveEvent as MouseEvent).clientY;

      position.value = {
        x: Math.max(0, Math.min(windowWidth.value - rect.width, moveClientX - offsetX)),
        y: Math.max(0, Math.min(windowHeight.value - rect.height, moveClientY - offsetY)),
      };
    };

    const stopMove = () => {
      document.removeEventListener(isTouchEvent ? 'touchmove' : 'mousemove', move);
      document.removeEventListener(isTouchEvent ? 'touchend' : 'mouseup', stopMove);
      isDragging.value = false;
    };

    document.addEventListener(isTouchEvent ? 'touchmove' : 'mousemove', move);
    document.addEventListener(isTouchEvent ? 'touchend' : 'mouseup', stopMove);
  };

  onMounted(() => {
    if (typeof window !== 'undefined') {
      windowWidth.value = window.innerWidth;
      windowHeight.value = window.innerHeight;

      const button = document.querySelector('.draggable-button') as HTMLElement;
      if (button) {
        const buttonWidth = button.offsetWidth;
        const buttonHeight = button.offsetHeight;

        position.value = {
          x: windowWidth.value - buttonWidth - 20,
          y: windowHeight.value - buttonHeight - 50,
        };
      }
    }
  });

  return { isDragging, position, startDrag };
}
