// Overlay window entry (www/overlay.html).
import { createRoot } from 'react-dom/client';

import app from '../overlay/app';

const root = createRoot(document.getElementById('overlay-container'));
root.render(app());
