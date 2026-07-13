const getPageZoom = () => {
  if (typeof window === 'undefined') return 1;

  const zoom = Number.parseFloat(
    window.getComputedStyle(document.documentElement).zoom
  );

  return Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
};

const getElementZoom = (anchorEl) => {
  const pageZoom = getPageZoom();
  if (pageZoom !== 1) return pageZoom;

  const rect = anchorEl.getBoundingClientRect();
  const layoutWidth = anchorEl.offsetWidth || anchorEl.clientWidth;
  const inferredZoom = layoutWidth ? rect.width / layoutWidth : 1;

  return Number.isFinite(inferredZoom) && inferredZoom > 0 ? inferredZoom : 1;
};

export const getZoomCorrectedAnchor = (anchorEl) => {
  if (!anchorEl) return null;

  const zoom = getElementZoom(anchorEl);
  if (zoom === 1) return anchorEl;

  return {
    nodeType: 1,
    ownerDocument: anchorEl.ownerDocument,
    contextElement: anchorEl,
    clientWidth: anchorEl.clientWidth / zoom,
    clientHeight: anchorEl.clientHeight / zoom,
    getBoundingClientRect: () => {
      const rect = anchorEl.getBoundingClientRect();

      return {
        x: rect.x / zoom,
        y: rect.y / zoom,
        top: rect.top / zoom,
        right: rect.right / zoom,
        bottom: rect.bottom / zoom,
        left: rect.left / zoom,
        width: rect.width / zoom,
        height: rect.height / zoom,
        toJSON: () => rect.toJSON(),
      };
    },
  };
};

export const getZoomCorrectedAnchorPosition = (anchorEl, horizontal = 'left') => {
  if (!anchorEl) return undefined;

  const zoom = getElementZoom(anchorEl);
  const rect = anchorEl.getBoundingClientRect();
  const left = horizontal === 'right' ? rect.right : rect.left;

  return {
    top: rect.bottom / zoom,
    left: left / zoom,
  };
};
