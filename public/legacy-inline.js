
// === CONFIG BACKEND ===
const BACKEND_URL = 'https://aur-x-backend.vercel.app';

// La sélection/copie est autorisée uniquement dans le texte des réponses de l'IA.
document.body.classList.add('copy-locked');
document.addEventListener('copy', event => {
  const selection = window.getSelection();
  const selectedText = selection ? selection.toString() : '';
  if (!selectedText) { event.preventDefault(); return; }
  const range = selection.getRangeAt(0);
  const start = range.startContainer.nodeType === Node.ELEMENT_NODE
    ? range.startContainer : range.startContainer.parentElement;
  const end = range.endContainer.nodeType === Node.ELEMENT_NODE
    ? range.endContainer : range.endContainer.parentElement;
  const startAI = start?.closest?.('#chat .msg-wrapper.bot .msg, #chat .msg-wrapper.bot-full .msg');
  const endAI = end?.closest?.('#chat .msg-wrapper.bot .msg, #chat .msg-wrapper.bot-full .msg');
  if (!startAI || !endAI || startAI !== endAI) event.preventDefault();
});

// === GOOGLE AUTH VIA BACKEND VERCEL ===
let googleUser = null;

async function checkAuth() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, { credentials: 'include' });
    if (res.ok) {
      googleUser = await res.json();
      updateGoogleUI(true);
      // N'affiche l'accueil que si l'utilisateur vient de lancer une connexion Google.
      // Une actualisation normale ne doit jamais déclencher ce message.
      if (sessionStorage.getItem('infinity_google_login_pending') === '1') {
        sessionStorage.removeItem('infinity_google_login_pending');
        showGoogleWelcome();
      }
    } else {
      googleUser = null;
      updateGoogleUI(false);
    }
  } catch (e) {
    console.log('Pas encore connecté');
    googleUser = null;
    updateGoogleUI(false);
  }
}

function showGoogleWelcome() {
  const modal = document.getElementById('welcomeLoginModal');
  const text = document.getElementById('welcomeLoginText');
  if (!modal) return;
  const name = (googleUser?.name || '').trim();
  text.textContent = name
    ? `Bienvenue ${name} ! Votre compte Google est connecté à Infinity. Appuyez sur OK pour continuer.`
    : 'Bienvenue sur Infinity ! Votre compte Google est connecté. Appuyez sur OK pour continuer.';
  modal.classList.add('open');
}

document.getElementById('welcomeLoginOk')?.addEventListener('click', () => {
  document.getElementById('welcomeLoginModal')?.classList.remove('open');
});

function updateGoogleUI(isConnected) {
  const googleBtn = document.getElementById('googleAuthBtn');
  const googleText = document.getElementById('googleAuthText');
  const userInfo = document.getElementById('googleUserInfo');
  const userPic = document.getElementById('googleUserPic');
  const userName = document.getElementById('googleUserName');
  const profilePic = document.getElementById('profilePic');
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profileId = document.getElementById('profileId');
  const profileLang = document.getElementById('profileLang');
  const userVerified = document.getElementById('profileVerified');
  const accountSyncStatus = document.getElementById('accountSyncStatus');

  if (isConnected && googleUser) {
    googleBtn.style.display = 'none';
    userInfo.style.display = 'block';
    userPic.src = googleUser.picture || '';
    userName.textContent = googleUser.name || 'Utilisateur';
    profilePic.src = googleUser.picture || '';
    profileName.textContent = googleUser.name || 'Utilisateur';
    profileEmail.textContent = googleUser.email || 'N/A';
    profileId.textContent = googleUser.sub || googleUser.id || 'N/A';
    profileLang.textContent = (googleUser.locale || 'fr').toUpperCase();

    if (googleUser.email_verified === true) {
      userVerified.textContent = '✓ Vérifié';
      userVerified.style.color = '#34A853';
      userVerified.style.background = 'rgba(52, 168, 83, 0.1)';
    } else {
      userVerified.textContent = '⚠ Non vérifié';
      userVerified.style.color = '#ff3b30';
      userVerified.style.background = 'rgba(255, 59, 48, 0.1)';
    }

    if (accountSyncStatus) {
      accountSyncStatus.innerHTML = `Connecté en tant que <strong>${googleUser.name}</strong>.<br><span style="color:#34A853; font-size:12px;">✓ Synchronisation cloud active. Conversations sauvegardées.</span>`;
    }
  } else {
    googleBtn.style.display = 'flex';
    googleBtn.classList.remove('connected');
    googleText.textContent = 'Se connecter avec Google';
    userInfo.style.display = 'none';

    if (accountSyncStatus) {
      accountSyncStatus.innerHTML = `Mode invité actif (Local uniquement).<br><span style="color:#ff9500; font-size:12px;">⚠ Connectez-vous pour ne pas perdre vos conversations.</span>`;
    }
  }
}

async function logoutGoogleAccount() {
  try {
    await fetch(`${BACKEND_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch (e) { console.error('Erreur déconnexion:', e); }
  googleUser = null;
  updateGoogleUI(false);
  document.getElementById('profileModal')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
  window.location.href = 'https://ax3d.vercel.app/';
}

document.getElementById('googleAuthBtn')?.addEventListener('click', () => {
  // Marque explicitement une connexion demandée par l'utilisateur.
  // sessionStorage survit à la redirection OAuth mais pas à une nouvelle session navigateur.
  sessionStorage.setItem('infinity_google_login_pending', '1');
  window.location.href = `${BACKEND_URL}/api/auth/google`;
});
document.getElementById('profileLogoutBtn')?.addEventListener('click', logoutGoogleAccount);
const profileTrigger = document.getElementById('googleUserInfo');
function openProfileModal() {
  if (!googleUser) return;
  document.getElementById('profileModal')?.classList.add('open');
  document.getElementById('overlay')?.classList.add('open');
}
profileTrigger?.addEventListener('click', openProfileModal);
profileTrigger?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProfileModal(); } });
document.getElementById('overlay')?.addEventListener('click', () => { document.getElementById('profileModal')?.classList.remove('open'); document.getElementById('creatorInfoModal')?.classList.remove('open'); document.getElementById('overlay')?.classList.remove('open'); });
document.getElementById('closeProfileModal')?.addEventListener('click', () => {
  document.getElementById('profileModal')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
});

// === INFOS CRÉATEUR ===
const creatorInfoModal = document.getElementById('creatorInfoModal');
document.getElementById('creatorInfoBtn')?.addEventListener('click', () => {
  document.getElementById('profileModal')?.classList.remove('open');
  creatorInfoModal?.classList.add('open');
  document.getElementById('overlay')?.classList.add('open');
});
function closeCreatorInfoModal() {
  creatorInfoModal?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}
document.getElementById('closeCreatorInfo')?.addEventListener('click', closeCreatorInfoModal);

// === INDICATEUR DE RECHERCHE WEB ===
// L'interface peut recevoir un signal explicite depuis le moteur IA via :
// window.dispatchEvent(new CustomEvent('infinity:web-search', {detail:{active:true}}));
const webSearchStatus = document.getElementById('webSearchStatus');
let webSearchHideTimer = null;
function setWebSearchStatus(active) {
  if (!webSearchStatus) return;
  clearTimeout(webSearchHideTimer);
  webSearchStatus.classList.toggle('visible', Boolean(active));
  if (active) {
    webSearchStatus.querySelector('span:last-child').textContent = 'Recherche web en cours…';
  } else {
    // Laisse le statut visible un court instant pour éviter un clignotement trop rapide.
    webSearchHideTimer = setTimeout(() => webSearchStatus.classList.remove('visible'), 700);
  }
}
window.addEventListener('infinity:web-search', event => setWebSearchStatus(event.detail?.active !== false));
// Aucun MutationObserver global ici : le statut est piloté par les événements SSE
// explicites du backend, ce qui évite de relire document.body.innerText en boucle.

// === GESTION DE L'ÉCRAN DES CONDITIONS (CHECKBOX + LOGIQUE CONTINUER) ===
const acceptTermsCheckbox = document.getElementById('acceptTerms');
const continueBtn = document.getElementById('continueBtn');
const termsScreen = document.getElementById('termsScreen');

if (acceptTermsCheckbox && continueBtn && termsScreen) {
  acceptTermsCheckbox.addEventListener('change', () => {
    if (acceptTermsCheckbox.checked) {
      continueBtn.disabled = false;
      continueBtn.classList.add('active');
    } else {
      continueBtn.disabled = true;
      continueBtn.classList.remove('active');
    }
  });

  continueBtn.addEventListener('click', () => {
    termsScreen.style.display = 'none';
  });
}

// Revoir l'écran depuis le bouton des paramètres
document.getElementById('reviewTermsBtn')?.addEventListener('click', () => {
  document.getElementById('settingsModal').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
  if (termsScreen) termsScreen.style.display = 'flex';
});

// === EXPORTATION DES CONVERSATIONS EN JSON ===
document.getElementById('exportConvsBtn')?.addEventListener('click', () => {
  try {
    // Récupération des conversations stockées localement
    const conversations = localStorage.getItem('infinity_conversations');

    if (!conversations || conversations === '[]') {
      alert('Aucune conversation à exporter dans votre historique local.');
      return;
    }

    // Création du fichier téléchargeable au format JSON
    const blob = new Blob([conversations], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `infinity-conversations-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erreur d'exportation :", error);
    alert("Impossible d'exporter vos données pour le moment.");
  }
});

// === WELCOME TOGGLE ===
function toggleWelcome() {
  const chat = document.getElementById('chat');
  const welcome = document.getElementById('welcome');
  if (!welcome) return;

  const hasMessages = chat.querySelector('.msg-wrapper, .typing-wrapper');
  welcome.style.display = hasMessages ? 'none' : 'flex';
}

// === ATTENDRE QUE KATEX SOIT CHARGÉ ===
function waitForKatex(callback) {
  if (window.renderMathInElement) {
    callback();
  } else {
    setTimeout(() => waitForKatex(callback), 100);
  }
}

// === RENDER MATH KATEX ===
function renderMath(element = document.getElementById('chat')) {
  if (typeof renderMathInElement === 'undefined') return;

  renderMathInElement(element, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true }
    ],
    throwOnError: false
  });
}

let renderTimeout = null;

// === INIT DOM ===
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  toggleWelcome();

  waitForKatex(() => {
    setTimeout(() => renderMath(), 300);

    const chat = document.getElementById('chat');

    const observer = new MutationObserver((mutations) => {
      // Ne pas relancer KaTeX pour chaque fragment reçu pendant que l'IA écrit.
      // On ne réagit qu'à l'ajout/suppression de messages complets, hors flux actif.
      const meaningfulChange = mutations.some(mutation => {
        const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;
        if (target?.closest?.('.streaming')) return false;
        const changedNodes = [...mutation.addedNodes, ...mutation.removedNodes];
        return changedNodes.some(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return false;
          return !node.matches?.('.streaming') && !node.querySelector?.('.streaming');
        });
      });
      if (!meaningfulChange) return;
      clearTimeout(renderTimeout);
      renderTimeout = setTimeout(() => {
        renderMath(chat);
        toggleWelcome();
      }, 350);
    });

    observer.observe(chat, { childList: true, subtree: true });
  });
});


// === OPTIONS NON ENCORE PRISES EN CHARGE ===
(function wireReorganizedUI() {
  const sidebar = document.getElementById('sidebar');
  const closeSidebar = () => sidebar?.classList.remove('open');
  const showUnavailable = (feature) => {
    window.alert(feature + " n’est pas encore pris en charge dans cette version d’Infinity. Le bouton sera activé lorsque cette fonctionnalité sera réellement disponible.");
  };

  // Les fonctions de base déjà présentes (chat, historique et paramètres) restent inchangées.
  // Les éléments ajoutés pour ressembler à l’interface de ChatGPT indiquent clairement
  // qu’ils ne sont pas encore disponibles, plutôt que de simuler une fonctionnalité.
  const premiumModal = document.getElementById('premiumModal');
  const premiumStatus = document.getElementById('premiumStatus');
  const premiumBuyBtn = document.getElementById('premiumBuyBtn');
  const openPremium = () => {
    if (premiumStatus) premiumStatus.textContent = '';
    if (premiumModal) premiumModal.classList.add('open');
  };
  const closePremium = () => premiumModal?.classList.remove('open');

  document.getElementById('offersBtn')?.addEventListener('click', openPremium);
  document.getElementById('premiumClose')?.addEventListener('click', closePremium);
  premiumModal?.addEventListener('click', (event) => {
    if (event.target === premiumModal) closePremium();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePremium();
  });

  premiumBuyBtn?.addEventListener('click', async () => {
    if (!googleUser) {
      if (premiumStatus) premiumStatus.textContent = 'Connecte-toi avec Google avant de souscrire à Premium.';
      return;
    }
    premiumBuyBtn.disabled = true;
    premiumBuyBtn.textContent = 'Préparation du paiement…';
    if (premiumStatus) premiumStatus.textContent = 'Connexion sécurisée à NOWPayments…';
    try {
      const response = await fetch(`${BACKEND_URL}/api/create-premium-payment`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({})
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Ta session a expiré. Reconnecte-toi avec Google puis réessaie.');
        }
        throw new Error(result.error || `Impossible de créer le paiement (HTTP ${response.status}).`);
      }
      if (result.tier === 'creator') {
        if (premiumStatus) premiumStatus.textContent = 'Ce compte bénéficie déjà de Premium gratuit et illimité.';
        premiumBuyBtn.textContent = 'Accès créateur actif';
        return;
      }
      if (!result.invoiceUrl) throw new Error('NOWPayments n’a pas retourné de lien de paiement.');
      if (premiumStatus) premiumStatus.textContent = 'Facture créée. Redirection vers le paiement Bitcoin…';
      window.location.assign(result.invoiceUrl);
    } catch (error) {
      if (premiumStatus) premiumStatus.textContent = error.message || 'Une erreur est survenue. Réessaie.';
      premiumBuyBtn.disabled = false;
      premiumBuyBtn.textContent = 'Réessayer avec Bitcoin';
    }
  });

  // Retour depuis la page NOWPayments : le webhook reste l'unique autorité d'activation.
  const paymentResult = new URLSearchParams(window.location.search).get('payment');
  if (paymentResult === 'success') {
    openPremium();
    if (premiumStatus) premiumStatus.textContent = 'Paiement envoyé. L’activation Premium arrive après confirmation réseau par NOWPayments. Actualise ton compte dans quelques instants.';
    window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
  } else if (paymentResult === 'cancelled') {
    openPremium();
    if (premiumStatus) premiumStatus.textContent = 'Paiement annulé. Tu peux reprendre quand tu veux.';
    window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
  }

  document.getElementById('createImageShortcut')?.addEventListener('click', () => {
    showUnavailable('La création d’images et de stickers');
  });
  document.getElementById('navImages')?.addEventListener('click', () => {
    closeSidebar();
    showUnavailable('La section Images');
  });
  document.getElementById('writeEditShortcut')?.addEventListener('click', () => {
    showUnavailable('L’outil dédié « Écrire ou modifier »');
  });
  document.getElementById('navLibrary')?.addEventListener('click', () => {
    closeSidebar();
    showUnavailable('La Bibliothèque');
  });
  document.getElementById('navProjects')?.addEventListener('click', () => {
    closeSidebar();
    showUnavailable('Les Projets');
  });
  document.getElementById('navScheduled')?.addEventListener('click', () => {
    closeSidebar();
    showUnavailable('Les tâches planifiées');
  });

  document.getElementById('navPlugins')?.addEventListener('click', () => {
    closeSidebar();
    showUnavailable('Les Plugins');
  });
})();

// === SIGNALEMENTS ET COTATIONS VIA LE BACKEND INFINITY ===
// Les retours passent par le backend Infinity ; aucun secret n'est stocké dans le HTML.
const INFINITY_FEEDBACK_ENDPOINT = `${BACKEND_URL}/api/feedback`;

async function sendInfinityFeedback(payload) {
  const response = await fetch(INFINITY_FEEDBACK_ENDPOINT, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  let result = {};
  try { result = await response.json(); } catch (_) {}
  if (!response.ok || result.success !== true) {
    const detail = result.error || result.message || `Erreur HTTP ${response.status}`;
    throw new Error(detail);
  }
  return result;
}

const bugModal = document.getElementById('bugReportModal');
const bugStatus = document.getElementById('bugReportStatus');
function closeBugModal() {
  bugModal?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}
document.getElementById('reportBugBtn')?.addEventListener('click', () => {
  document.getElementById('profileModal')?.classList.remove('open');
  bugModal?.classList.add('open');
  document.getElementById('overlay')?.classList.add('open');
});
document.getElementById('closeBugReport')?.addEventListener('click', closeBugModal);
document.getElementById('overlay')?.addEventListener('click', closeBugModal);

document.getElementById('sendBugReport')?.addEventListener('click', async () => {
  const field = document.getElementById('bugReportText');
  const description = field.value.trim();
  if (!description) {
    bugStatus.textContent = 'Décris le bug avant de l’envoyer.';
    return;
  }
  const btn = document.getElementById('sendBugReport');
  btn.disabled = true;
  bugStatus.textContent = 'Envoi en cours…';
  try {
    await sendInfinityFeedback({
      type: 'bug',
      description,
      category: 'Signalement depuis l’application',
      userName: googleUser?.name || (googleUser ? 'Utilisateur connecté' : 'Invité'),
      userEmail: googleUser?.email || '',
      timestamp: new Date().toISOString(),
      page: location.href,
      appVersion: 'Infinity'
    });
    bugStatus.textContent = 'Signalement envoyé. Merci !';
    field.value = '';
  } catch (error) {
    console.error('Erreur signalement Infinity :', error);
    bugStatus.textContent = /service d’envoi n’est pas configuré|service d’envoi n’est pas configuré/i.test(error.message)
      ? 'Le service e-mail du serveur n’est pas encore configuré sur Vercel.'
      : `Échec de l’envoi : ${error.message || 'erreur réseau'}. Vérifie le déploiement du backend et réessaie.`;
  } finally {
    btn.disabled = false;
  }
});

// Ajoute les boutons 👍 / 👎 sous chaque réponse IA, y compris les messages restaurés.
function addInfinityFeedbackToReplies() {
  document.querySelectorAll('#chat .msg-wrapper.bot, #chat .msg-wrapper.bot-full').forEach(wrapper => {
    if (wrapper.dataset.infinityFeedbackReady === '1') return;
    // Les messages en cours de génération ne reçoivent les commandes qu’une fois terminés.
    if (wrapper.querySelector('.streaming')) return;
    const messageEl = wrapper.querySelector('.msg');
    if (!messageEl) return;
    wrapper.dataset.infinityFeedbackReady = '1';

    const feedback = document.createElement('div');
    feedback.className = 'ai-feedback';
    feedback.innerHTML = `
      <div class="ai-feedback-actions" aria-label="Évaluer la réponse">
        <button type="button" data-rating="up" aria-label="Très bien" title="Très bien">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v11H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3Z"/><path d="M7 10l5-8c1.5 0 2.5 1 2 3l-1 5h6a2 2 0 0 1 2 2l-1 7a2 2 0 0 1-2 2H7"/></svg>
          <span>Très bien</span>
        </button>
        <button type="button" data-rating="down" aria-label="Naze" title="Naze">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14V3H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3Z"/><path d="M7 14l5 8c1.5 0 2.5-1 2-3l-1-5h6a2 2 0 0 0 2-2l-1-7a2 2 0 0 0-2-2H7"/></svg>
          <span>Naze</span>
        </button>
      </div>
      <div class="ai-disclaimer">Vérifiez les réponses d’Infinity, car l’IA peut faire des erreurs.</div>
      <div class="feedback-status" aria-live="polite"></div>`;
    wrapper.appendChild(feedback);

    feedback.querySelectorAll('button[data-rating]').forEach(button => {
      button.addEventListener('click', async () => {
        if (feedback.dataset.sent === '1') return;
        const rating = button.dataset.rating;
        const status = feedback.querySelector('.feedback-status');
        feedback.querySelectorAll('button').forEach(b => b.disabled = true);
        button.classList.add('selected');
        status.textContent = 'Envoi…';
        const answer = (messageEl.innerText || messageEl.textContent || '').trim().slice(0, 5000);
        const promptWrapper = wrapper.previousElementSibling;
        const prompt = (promptWrapper?.querySelector('.msg')?.innerText || promptWrapper?.querySelector('.msg')?.textContent || '').trim().slice(0, 2000) || '(question précédente non disponible)';
        try {
          await sendInfinityFeedback({
            type: 'rating',
            rating,
            question: prompt,
            response: answer,
            answer,
            userName: googleUser?.name || (googleUser ? 'Utilisateur connecté' : 'Invité'),
            userEmail: googleUser?.email || '',
            timestamp: new Date().toISOString(),
            page: location.href,
            appVersion: 'Infinity'
          });
          feedback.dataset.sent = '1';
          status.textContent = 'Merci pour votre avis !';
        } catch (error) {
          console.error('Erreur cotation Infinity :', error);
          status.textContent = /not configured|pas configuré|503/i.test(error.message)
            ? 'Le service e-mail du serveur n’est pas configuré. Vérifie la configuration de /api/feedback sur Vercel.'
            : `Échec de l’envoi (${error.message || 'erreur réseau'}). Réessaie plus tard.`;
          feedback.querySelectorAll('button').forEach(b => b.disabled = false);
          button.classList.remove('selected');
        }
      });
    });
  });
}
const infinityFeedbackObserver = new MutationObserver(() => addInfinityFeedbackToReplies());
if (document.getElementById('chat')) {
  infinityFeedbackObserver.observe(document.getElementById('chat'), { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', addInfinityFeedbackToReplies);
  setTimeout(addInfinityFeedbackToReplies, 800);
}


