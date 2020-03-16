const previewContainerImage = (container, noAttSvg = '/images/wild_card/no_attachment.svg', noAvaSvg = '/images/wild_card/not_available.svg') => {
  const rawImg = container.preview_img;
  switch (rawImg) {
    case null:
    case undefined:
      return noAttSvg;
    case 'not available':
      return noAvaSvg;
    default:
      return `data:image/png;base64,${rawImg}`;
  }
};

// eslint-disable-next-line import/prefer-default-export
export { previewContainerImage };
