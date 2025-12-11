const pageUrl = encodeURIComponent(window.location.href);
const pageTitle = encodeURIComponent(document.title);
const shareText = encodeURIComponent('Stand with Iran - Woman, Life, Freedom ✊ زن، زندگی، آزادی');

function shareTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${pageUrl}`, '_blank', 'width=550,height=420');
}

function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`, '_blank', 'width=550,height=420');
}

function shareWhatsApp() {
    window.open(`https://wa.me/?text=${shareText}%20${pageUrl}`, '_blank');
}

function shareTelegram() {
    window.open(`https://t.me/share/url?url=${pageUrl}&text=${shareText}`, '_blank');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const toast = document.getElementById('copyToast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    });
}

