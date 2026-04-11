/**
 * Safely copies text to the clipboard with fallback for non-secure contexts
 * or older browsers where navigator.clipboard is not available.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern API first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Modern clipboard copy failed, falling back...', err);
    }
  }

  // Fallback for non-secure contexts or failures
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Ensure the textarea is not visible but part of the DOM to allow execCommand
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    return !!successful;
  } catch (err) {
    console.error('Fallback clipboard copy failed:', err);
    return false;
  }
}
