let overlayCount = 0;
let prevOverflow = '';

const OVERLAY_ID = '__blocking_overlay__';

export function showBlocking(text = 'Loading…') {
    overlayCount++;
    
    let el = document.getElementById(OVERLAY_ID);
    if (!el) {
        el = document.createElement('div');
        el.id = OVERLAY_ID;
        el.setAttribute('role', 'alert');
        el.style.position = 'fixed';
        el.style.inset = '0';
        el.style.zIndex = '9999';
        el.style.background = 'rgba(255,255,255,0.7)';
        el.style.backdropFilter = 'blur(2px)';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.pointerEvents = 'all';
        
        const box = document.createElement('div');
        box.style.textAlign = 'center';
        
        const spinner = document.createElement('div');
        spinner.style.width = '48px';
        spinner.style.height = '48px';
        spinner.style.border = '4px solid #c7d2fe';
        spinner.style.borderTopColor = '#4f46e5';
        spinner.style.borderRadius = '50%';
        spinner.style.animation = 'fb-spin 0.9s linear infinite';
        
        const label = document.createElement('div');
        label.id = '__blocking_text__';
        label.textContent = text;
        label.style.marginTop = '10px';
        label.style.fontWeight = '600';
        label.style.color = '#111827';
        
        box.appendChild(spinner);
        box.appendChild(label);
        el.appendChild(box);
        document.body.appendChild(el);
        
        const style = document.createElement('style');
        style.id = '__blocking_style__';
        style.textContent = `
      @keyframes fb-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `;
        document.head.appendChild(style);
        
        prevOverflow = document.body.style.overflow || '';
        document.body.style.overflow = 'hidden';
    } else {
        const label = el.querySelector('#__blocking_text__');
        if (label) label.textContent = text;
    }
}

export function hideBlocking() {
    if (overlayCount > 0) overlayCount--;
    if (overlayCount > 0) return;
    
    const el = document.getElementById(OVERLAY_ID);
    if (el && el.parentNode) el.parentNode.removeChild(el);
    
    const style = document.getElementById('__blocking_style__');
    if (style && style.parentNode) style.parentNode.removeChild(style);
    
    document.body.style.overflow = prevOverflow || '';
    prevOverflow = '';
}

export async function runWithBlocking(fn, text = 'Loading…') {
    showBlocking(text);
    try {
        return await fn();
    } finally {
        hideBlocking();
    }
}
