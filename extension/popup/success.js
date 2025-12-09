/**
 * NeuroSync Success Page
 * Activates Pro subscription after successful Stripe payment
 */

document.addEventListener('DOMContentLoaded', async () => {
  const statusDiv = document.getElementById('status');
  const continueBtn = document.getElementById('continueBtn');

  // Get session ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  if (!sessionId) {
    showError('No session ID found. Please contact support.');
    return;
  }

  console.log('[NeuroSync] Activating Pro subscription with session:', sessionId);

  try {
    // Activate Pro subscription
    const response = await chrome.runtime.sendMessage({
      type: 'activate_pro',
      sessionId: sessionId
    });

    if (response.success) {
      showSuccess('Pro subscription activated successfully!');

      continueBtn.disabled = false;
      continueBtn.onclick = () => {
        // Close this tab and open the extension popup
        chrome.tabs.getCurrent((tab) => {
          chrome.tabs.remove(tab.id);
        });
      };

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        continueBtn.click();
      }, 3000);

    } else {
      throw new Error(response.error || 'Failed to activate subscription');
    }

  } catch (error) {
    console.error('[NeuroSync] Error activating Pro:', error);
    showError('Failed to activate subscription: ' + error.message);

    continueBtn.textContent = 'Contact Support';
    continueBtn.disabled = false;
    continueBtn.onclick = () => {
      window.open('mailto:support@neurosync.app?subject=Pro Activation Failed&body=Session ID: ' + sessionId);
    };
  }
});

function showSuccess(message) {
  const statusDiv = document.getElementById('status');
  statusDiv.className = 'status success';
  statusDiv.innerHTML = `<span>✓ ${message}</span>`;
}

function showError(message) {
  const statusDiv = document.getElementById('status');
  statusDiv.className = 'status error';
  statusDiv.innerHTML = `<span>✗ ${message}</span>`;
}
