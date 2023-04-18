document.getElementById('exportHtml').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: exportHtml,
    });
  } catch (error) {
    console.error('Error executing script:', error);
  }
});

async function exportHtml() {
  const sessionTitleElement = document.querySelector('.rounded-md.bg-gray-800.cursor-pointer .relative');
  const sessionTitle = sessionTitleElement ? sessionTitleElement.textContent.trim() : 'chatgpt';
  const formattedDate = new Date().toISOString().slice(2, 10).replace(/-/g, '');

  const clonedDocument = document.cloneNode(true);

  // Remove unwanted elements
  const unwantedTags = ['nav', 'button', 'textarea'];
  unwantedTags.forEach(tag => {
    const unwantedElements = clonedDocument.getElementsByTagName(tag);
    while (unwantedElements.length > 0) {
      unwantedElements[0].parentNode.removeChild(unwantedElements[0]);
    }
  });

  const unwantedClass = 'absolute bottom-0';
  const elementsWithUnwantedClass = clonedDocument.getElementsByClassName(unwantedClass);
  while (elementsWithUnwantedClass.length > 0) {
    elementsWithUnwantedClass[0].parentNode.removeChild(elementsWithUnwantedClass[0]);
  }

  const scriptElement = clonedDocument.querySelector('script#__NEXT_DATA__');
  if (scriptElement) {
    scriptElement.parentNode.removeChild(scriptElement);
  }

  // Update images and remove sensitive data
  const defaultImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAIAAAADnC86AAABf0lEQVR4nOzXQWsaQRQH8P+bnbVrtfVgqSAthR487EnZi9DTngr9jJ78BD2WJvfkEnIJQZRALoEEkiAx6uy4MxOUnOKsaFhjhPkfZ3B+vuW9WZZHUYRdhO1EdbCDHexgBzt4n2DaOsytq7LNdQnBscajfkOYYxJh9sVMmlQ+4oUTBWFyh716vf5yTSPogRGT3yAakCHjknl3BrkWb4MBJMa/0MVzRj7J70aESBuMC8ZuNXIqPgNehKbG7+tij9EnJn7M+eCKsft85DXGyYMqzvucZqAkFxSZXf2cD5T88kZtYwo6uKTyP0PXasswQf/kD78x+2rYGJUD8k8V0jx7O2Oc/vBx04Dw8YxKhxrD3ApdCRuoCviQPv+H10+Xp4jIfrEZs8EjscEK5b+KUmBqOSiO41arZT1LStnpdIQQr4UBGmX+9zAM4zi2biVJ0u1214Rp04+2Wq1WrVatW0qpwWCg9Vo33MpxsuVmkU1/tZz39j52sIMdvEfwUwAAAP//alCDMgpzqNUAAAAASUVORK5CYII=';
  const images = clonedDocument.querySelectorAll('img[data-nimg="intrinsic"]');
  images.forEach(img => {
    img.src = defaultImageBase64;
    img.removeAttribute('srcset');
    img.alt = '';
  });

  // Fetch and inline external CSS files
  const externalStylesheets = clonedDocument.querySelectorAll('link[rel="stylesheet"]');
  for (const stylesheet of externalStylesheets) {
    try {
      const response = await fetch(stylesheet.href);
      const cssText = await response.text();
      const inlineStyle = clonedDocument.createElement('style');
      inlineStyle.textContent = cssText;
      stylesheet.parentNode.replaceChild(inlineStyle, stylesheet);
    } catch (error) {
      console.warn('Error inlining CSS:', error);
    }
  }

  // Add a CSS rule to enable scrolling in the exported page
  const scrollingStyle = clonedDocument.createElement('style');
  scrollingStyle.textContent = `
    html, body {
      overflow: auto !important;
      height: auto !important;
      max-height: none !important;
    }
  `;
  clonedDocument.head.appendChild(scrollingStyle);

  // Serialize the cloned document as an HTML string
  const serializer = new XMLSerializer();
  const conversationHtml = '<!DOCTYPE html>\n' + serializer.serializeToString(clonedDocument);

  // Create a download link for the HTML file
  const link = document.createElement('a');
  link.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(conversationHtml);
  link.download = `export-${sessionTitle}-${formattedDate}.html`;
  link.style.display = 'none';
  document.body.appendChild(link);

  // Trigger the download
  link.click();

  // Remove the link from the DOM
  document.body.removeChild(link);
}